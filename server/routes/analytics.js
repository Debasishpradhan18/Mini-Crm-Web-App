const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { VALID_DEAL_STAGES } = require('../middleware/validation');

router.use(authMiddleware);

// Get comprehensive sales analytics & pipeline metrics
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user.id;

    // Total Contacts
    const contactStats = await dbAsync.get(
      `SELECT 
        COUNT(id) as total_contacts,
        SUM(CASE WHEN status = 'Customer' THEN 1 ELSE 0 END) as customers_count,
        SUM(CASE WHEN status = 'Lead' THEN 1 ELSE 0 END) as leads_count,
        SUM(CASE WHEN status = 'Prospect' THEN 1 ELSE 0 END) as prospects_count
       FROM contacts WHERE user_id = ?`,
      [userId]
    );

    // Total Deals & Pipeline Value
    const dealStats = await dbAsync.get(
      `SELECT 
        COUNT(id) as total_deals,
        COALESCE(SUM(value), 0) as total_pipeline_value,
        COALESCE(AVG(value), 0) as avg_deal_size,
        COALESCE(SUM(CASE WHEN stage = 'Won' THEN value ELSE 0 END), 0) as total_won_value,
        SUM(CASE WHEN stage = 'Won' THEN 1 ELSE 0 END) as total_won_deals,
        SUM(CASE WHEN stage = 'Lost' THEN 1 ELSE 0 END) as total_lost_deals,
        SUM(CASE WHEN stage NOT IN ('Won', 'Lost') THEN 1 ELSE 0 END) as active_deals_count,
        COALESCE(SUM(CASE WHEN stage NOT IN ('Won', 'Lost') THEN value ELSE 0 END), 0) as active_pipeline_value
       FROM deals WHERE user_id = ?`,
      [userId]
    );

    const totalDeals = dealStats.total_deals || 0;
    const closedDeals = (dealStats.total_won_deals || 0) + (dealStats.total_lost_deals || 0);
    const winRate = closedDeals > 0 
      ? Math.round(((dealStats.total_won_deals || 0) / closedDeals) * 100)
      : (totalDeals > 0 ? Math.round(((dealStats.total_won_deals || 0) / totalDeals) * 100) : 0);

    // Stage Funnel Distribution
    const stageCounts = await dbAsync.all(
      `SELECT stage, COUNT(id) as count, COALESCE(SUM(value), 0) as total_value
       FROM deals WHERE user_id = ?
       GROUP BY stage`,
      [userId]
    );

    const funnel = VALID_DEAL_STAGES.map(stageName => {
      const match = stageCounts.find(s => s.stage === stageName);
      return {
        stage: stageName,
        count: match ? Number(match.count) : 0,
        value: match ? Number(match.total_value) : 0
      };
    });

    // Deals Won Per Month (Past 6 months trend)
    const monthlyWon = await dbAsync.all(
      `SELECT 
        strftime('%Y-%m', updated_at) as month,
        COUNT(id) as won_count,
        COALESCE(SUM(value), 0) as won_revenue
       FROM deals
       WHERE user_id = ? AND stage = 'Won'
       GROUP BY month
       ORDER BY month ASC
       LIMIT 12`,
      [userId]
    );

    // If less than 6 months of data, generate a neat 6-month timeline
    const monthsMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      monthsMap[mKey] = { monthKey: mKey, label: monthLabel, won_count: 0, won_revenue: 0 };
    }

    monthlyWon.forEach(item => {
      if (monthsMap[item.month]) {
        monthsMap[item.month].won_count = item.won_count;
        monthsMap[item.month].won_revenue = item.won_revenue;
      }
    });

    const monthlyTrend = Object.values(monthsMap);

    // Top upcoming/closing deals
    const topDeals = await dbAsync.all(
      `SELECT d.*, c.name as contact_name, c.company as contact_company
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.contact_id
       WHERE d.user_id = ? AND d.stage NOT IN ('Won', 'Lost')
       ORDER BY d.value DESC
       LIMIT 5`,
      [userId]
    );

    // Recent 5 activities
    const recentActivities = await dbAsync.all(
      `SELECT a.*, c.name as contact_name
       FROM activities a
       LEFT JOIN contacts c ON c.id = a.contact_id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({
      success: true,
      stats: {
        totalContacts: contactStats.total_contacts || 0,
        customersCount: contactStats.customers_count || 0,
        leadsCount: contactStats.leads_count || 0,
        prospectsCount: contactStats.prospects_count || 0,
        totalDeals,
        activeDealsCount: dealStats.active_deals_count || 0,
        totalPipelineValue: dealStats.total_pipeline_value || 0,
        activePipelineValue: dealStats.active_pipeline_value || 0,
        totalWonValue: dealStats.total_won_value || 0,
        totalWonDeals: dealStats.total_won_deals || 0,
        avgDealSize: Math.round(dealStats.avg_deal_size || 0),
        winRate
      },
      funnel,
      monthlyTrend,
      topDeals,
      recentActivities
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate analytics.' });
  }
});

module.exports = router;
