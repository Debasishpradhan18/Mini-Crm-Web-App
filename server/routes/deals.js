const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { validateDeal, VALID_DEAL_STAGES } = require('../middleware/validation');

router.use(authMiddleware);

// Get all deals with contact details & optional filtering
router.get('/', async (req, res) => {
  try {
    const { stage, contactId, priority, search } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        d.*,
        c.name as contact_name,
        c.email as contact_email,
        c.company as contact_company,
        c.avatar as contact_avatar,
        c.phone as contact_phone
      FROM deals d
      LEFT JOIN contacts c ON c.id = d.contact_id
      WHERE d.user_id = ?
    `;
    const params = [userId];

    if (stage && VALID_DEAL_STAGES.includes(stage)) {
      query += ` AND d.stage = ?`;
      params.push(stage);
    }

    if (contactId) {
      query += ` AND d.contact_id = ?`;
      params.push(contactId);
    }

    if (priority && priority !== 'All') {
      query += ` AND d.priority = ?`;
      params.push(priority);
    }

    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (d.title LIKE ? OR c.name LIKE ? OR c.company LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY d.created_at DESC`;

    const deals = await dbAsync.all(query, params);

    return res.json({
      success: true,
      deals,
      count: deals.length
    });
  } catch (err) {
    console.error('Get deals error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch deals.' });
  }
});

// Get Kanban pipeline summary breakdown
router.get('/pipeline/summary', async (req, res) => {
  try {
    const userId = req.user.id;

    const summaryRows = await dbAsync.all(
      `SELECT 
        stage, 
        COUNT(id) as count, 
        COALESCE(SUM(value), 0) as total_value,
        AVG(probability) as avg_probability
       FROM deals 
       WHERE user_id = ? 
       GROUP BY stage`,
      [userId]
    );

    // Ensure all 5 stages exist in response
    const stageMap = {};
    VALID_DEAL_STAGES.forEach(s => {
      stageMap[s] = { count: 0, total_value: 0, avg_probability: 0 };
    });

    summaryRows.forEach(row => {
      stageMap[row.stage] = {
        count: Number(row.count),
        total_value: Number(row.total_value),
        avg_probability: Math.round(Number(row.avg_probability) || 0)
      };
    });

    const totalDeals = Object.values(stageMap).reduce((acc, s) => acc + s.count, 0);
    const totalPipelineValue = Object.values(stageMap).reduce((acc, s) => acc + s.total_value, 0);
    const wonValue = stageMap['Won'].total_value;
    const winRate = totalDeals > 0 ? Math.round((stageMap['Won'].count / totalDeals) * 100) : 0;

    return res.json({
      success: true,
      stages: stageMap,
      metrics: {
        totalDeals,
        totalPipelineValue,
        wonValue,
        winRate
      }
    });
  } catch (err) {
    console.error('Pipeline summary error:', err);
    return res.status(500).json({ success: false, error: 'Failed to calculate pipeline metrics.' });
  }
});

// Get single deal
router.get('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user.id;

    const deal = await dbAsync.get(
      `SELECT d.*, c.name as contact_name, c.email as contact_email, c.company as contact_company, c.avatar as contact_avatar, c.phone as contact_phone, c.notes as contact_notes
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.contact_id
       WHERE d.id = ? AND d.user_id = ?`,
      [dealId, userId]
    );

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found.' });
    }

    const activities = await dbAsync.all(
      'SELECT * FROM activities WHERE deal_id = ? AND user_id = ? ORDER BY created_at DESC',
      [dealId, userId]
    );

    return res.json({
      success: true,
      deal,
      activities
    });
  } catch (err) {
    console.error('Get single deal error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve deal.' });
  }
});

// Create new deal
router.post('/', validateDeal, async (req, res) => {
  try {
    const userId = req.user.id;
    const { contact_id, title, value, stage, probability, priority, expected_close_date, notes } = req.body;

    // Default probability mapping based on stage if not provided
    let prob = probability;
    if (prob === undefined || prob === null) {
      const stageProbs = { 'New': 20, 'Contacted': 40, 'Qualified': 70, 'Won': 100, 'Lost': 0 };
      prob = stageProbs[stage || 'New'] || 20;
    }

    const result = await dbAsync.run(
      `INSERT INTO deals (user_id, contact_id, title, value, stage, probability, priority, expected_close_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        contact_id || null,
        title.trim(),
        Number(value) || 0,
        stage || 'New',
        Number(prob),
        priority || 'Medium',
        expected_close_date || null,
        notes ? notes.trim() : null
      ]
    );

    const newDeal = await dbAsync.get(
      `SELECT d.*, c.name as contact_name, c.company as contact_company, c.avatar as contact_avatar
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.contact_id
       WHERE d.id = ?`,
      [result.lastID]
    );

    // Log activity
    await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, deal_id, type, title, description)
       VALUES (?, ?, ?, 'deal_created', 'Deal Created', ?)`,
      [userId, contact_id || null, newDeal.id, `Created deal "${newDeal.title}" valued at $${Number(newDeal.value).toLocaleString()}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Deal created successfully!',
      deal: newDeal
    });
  } catch (err) {
    console.error('Create deal error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create deal.' });
  }
});

// Update deal info
router.put('/:id', validateDeal, async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user.id;
    const { contact_id, title, value, stage, probability, priority, expected_close_date, notes } = req.body;

    const existing = await dbAsync.get('SELECT * FROM deals WHERE id = ? AND user_id = ?', [dealId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found.' });
    }

    const stageChanged = stage && stage !== existing.stage;

    await dbAsync.run(
      `UPDATE deals
       SET contact_id = ?, title = ?, value = ?, stage = ?, probability = ?, priority = ?, expected_close_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        contact_id !== undefined ? contact_id : existing.contact_id,
        title.trim(),
        Number(value),
        stage || existing.stage,
        probability !== undefined ? Number(probability) : existing.probability,
        priority || existing.priority,
        expected_close_date !== undefined ? expected_close_date : existing.expected_close_date,
        notes !== undefined ? notes : existing.notes,
        dealId,
        userId
      ]
    );

    const updatedDeal = await dbAsync.get(
      `SELECT d.*, c.name as contact_name, c.company as contact_company, c.avatar as contact_avatar
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.contact_id
       WHERE d.id = ?`,
      [dealId]
    );

    if (stageChanged) {
      await dbAsync.run(
        `INSERT INTO activities (user_id, contact_id, deal_id, type, title, description)
         VALUES (?, ?, ?, 'stage_change', 'Stage Changed', ?)`,
        [userId, updatedDeal.contact_id, dealId, `Moved deal "${updatedDeal.title}" from ${existing.stage} to ${stage}`]
      );
    }

    return res.json({
      success: true,
      message: 'Deal updated successfully!',
      deal: updatedDeal
    });
  } catch (err) {
    console.error('Update deal error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update deal.' });
  }
});

// Fast stage change endpoint (specifically tailored for drag-and-drop Kanban updates!)
router.patch('/:id/stage', async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user.id;
    const { stage } = req.body;

    if (!stage || !VALID_DEAL_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: `Invalid stage. Must be one of: ${VALID_DEAL_STAGES.join(', ')}`
      });
    }

    const existing = await dbAsync.get('SELECT * FROM deals WHERE id = ? AND user_id = ?', [dealId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found.' });
    }

    const oldStage = existing.stage;
    const stageProbs = { 'New': 20, 'Contacted': 40, 'Qualified': 70, 'Won': 100, 'Lost': 0 };
    const newProb = stageProbs[stage] !== undefined ? stageProbs[stage] : existing.probability;

    await dbAsync.run(
      `UPDATE deals SET stage = ?, probability = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [stage, newProb, dealId, userId]
    );

    // Log Activity
    await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, deal_id, type, title, description)
       VALUES (?, ?, ?, 'stage_change', 'Stage Moved', ?)`,
      [userId, existing.contact_id, dealId, `Moved deal from "${oldStage}" to "${stage}" via Pipeline Board`]
    );

    const updated = await dbAsync.get(
      `SELECT d.*, c.name as contact_name, c.company as contact_company, c.avatar as contact_avatar
       FROM deals d
       LEFT JOIN contacts c ON c.id = d.contact_id
       WHERE d.id = ?`,
      [dealId]
    );

    return res.json({
      success: true,
      message: `Deal moved to ${stage}`,
      deal: updated,
      oldStage,
      newStage: stage
    });
  } catch (err) {
    console.error('Patch deal stage error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update deal stage.' });
  }
});

// Delete deal
router.delete('/:id', async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user.id;

    const existing = await dbAsync.get('SELECT title FROM deals WHERE id = ? AND user_id = ?', [dealId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Deal not found.' });
    }

    await dbAsync.run('DELETE FROM deals WHERE id = ? AND user_id = ?', [dealId, userId]);

    return res.json({
      success: true,
      message: `Deal "${existing.title}" deleted.`
    });
  } catch (err) {
    console.error('Delete deal error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete deal.' });
  }
});

module.exports = router;
