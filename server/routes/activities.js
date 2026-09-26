const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Get recent activities for current user
router.get('/', async (req, res) => {
  try {
    const { limit = 30, contactId, dealId } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        a.*,
        c.name as contact_name,
        c.avatar as contact_avatar,
        c.company as contact_company,
        d.title as deal_title,
        d.stage as deal_stage
      FROM activities a
      LEFT JOIN contacts c ON c.id = a.contact_id
      LEFT JOIN deals d ON d.id = a.deal_id
      WHERE a.user_id = ?
    `;
    const params = [userId];

    if (contactId) {
      query += ` AND a.contact_id = ?`;
      params.push(contactId);
    }

    if (dealId) {
      query += ` AND a.deal_id = ?`;
      params.push(dealId);
    }

    query += ` ORDER BY a.created_at DESC LIMIT ?`;
    params.push(Number(limit));

    const activities = await dbAsync.all(query, params);

    return res.json({
      success: true,
      activities
    });
  } catch (err) {
    console.error('Get activities error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch activities.' });
  }
});

// Log a custom activity (Note, Call, Email, Meeting)
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { contact_id, deal_id, type, title, description, metadata } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, error: 'Type and title are required.' });
    }

    const metaStr = metadata ? JSON.stringify(metadata) : null;

    const result = await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, deal_id, type, title, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, contact_id || null, deal_id || null, type, title.trim(), description ? description.trim() : null, metaStr]
    );

    const newActivity = await dbAsync.get(
      `SELECT a.*, c.name as contact_name, d.title as deal_title
       FROM activities a
       LEFT JOIN contacts c ON c.id = a.contact_id
       LEFT JOIN deals d ON d.id = a.deal_id
       WHERE a.id = ?`,
      [result.lastID]
    );

    return res.status(201).json({
      success: true,
      message: 'Activity recorded!',
      activity: newActivity
    });
  } catch (err) {
    console.error('Post activity error:', err);
    return res.status(500).json({ success: false, error: 'Failed to log activity.' });
  }
});

module.exports = router;
