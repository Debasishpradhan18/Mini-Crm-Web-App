const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { generateAIEmail, generateAISummary, generateAIDealInsights } = require('../services/aiService');

router.use(authMiddleware);

// Helper to fetch user's configured AI key and provider
async function getUserAISettings(userId) {
  const rows = await dbAsync.all('SELECT key, value FROM settings WHERE user_id = ?', [userId]);
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  
  return {
    apiKey: settings['ai_api_key'] || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || null,
    provider: settings['ai_provider'] || (process.env.OPENAI_API_KEY ? 'openai' : 'gemini')
  };
}

// 1. AI Follow-up Email Drafter
router.post('/draft-email', async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactId, dealId, tone, objective, customNotes } = req.body;

    let contact = null;
    let deal = null;

    if (contactId) {
      contact = await dbAsync.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, userId]);
    }

    if (dealId) {
      deal = await dbAsync.get('SELECT * FROM deals WHERE id = ? AND user_id = ?', [dealId, userId]);
      if (!contact && deal?.contact_id) {
        contact = await dbAsync.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [deal.contact_id, userId]);
      }
    }

    if (!contact && !deal) {
      return res.status(400).json({ success: false, error: 'A valid contactId or dealId is required.' });
    }

    const { apiKey, provider } = await getUserAISettings(userId);

    const emailResult = await generateAIEmail({
      contact,
      deal,
      tone: tone || 'Professional',
      objective: objective || 'General Follow-up',
      customNotes,
      senderName: req.user.name || 'Sales Representative',
      senderCompany: req.user.company || 'Our Company',
      apiKey,
      provider
    });

    // Automatically log AI email assist in CRM timeline
    if (contact?.id) {
      await dbAsync.run(
        `INSERT INTO activities (user_id, contact_id, deal_id, type, title, description, metadata)
         VALUES (?, ?, ?, 'ai_assist', 'AI Email Drafted', ?, ?)`,
        [
          userId,
          contact.id,
          deal?.id || null,
          `Drafted follow-up email with tone "${tone || 'Professional'}" for ${contact.name}`,
          JSON.stringify({ subject: emailResult.subject, model: emailResult.modelUsed })
        ]
      );
    }

    return res.json({
      success: true,
      data: emailResult
    });
  } catch (err) {
    console.error('AI Draft Email Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to draft AI email.' });
  }
});

// 2. AI Contact Activity Summary (Stretch Goal)
router.post('/summarize-contact', async (req, res) => {
  try {
    const userId = req.user.id;
    const { contactId } = req.body;

    if (!contactId) {
      return res.status(400).json({ success: false, error: 'contactId is required.' });
    }

    const contact = await dbAsync.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, userId]);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    const deals = await dbAsync.all('SELECT * FROM deals WHERE contact_id = ? AND user_id = ?', [contactId, userId]);
    const activities = await dbAsync.all('SELECT * FROM activities WHERE contact_id = ? AND user_id = ? ORDER BY created_at DESC', [contactId, userId]);

    const { apiKey, provider } = await getUserAISettings(userId);

    const summaryResult = await generateAISummary({
      contact,
      deals,
      activities,
      apiKey,
      provider
    });

    // Log AI summary activity
    await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, type, title, description)
       VALUES (?, ?, 'ai_assist', 'AI Account Summary Generated', ?)`,
      [userId, contactId, `Generated executive intelligence summary for ${contact.name}`]
    );

    return res.json({
      success: true,
      data: summaryResult
    });
  } catch (err) {
    console.error('AI Summarize Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to summarize contact history.' });
  }
});

// 3. AI Deal Win Probability & Insights
router.post('/analyze-deal', async (req, res) => {
  try {
    const userId = req.user.id;
    const { dealId } = req.body;

    if (!dealId) {
      return res.status(400).json({ success: false, error: 'dealId is required.' });
    }

    const deal = await dbAsync.get('SELECT * FROM deals WHERE id = ? AND user_id = ?', [dealId, userId]);
    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found.' });
    }

    let contact = null;
    if (deal.contact_id) {
      contact = await dbAsync.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [deal.contact_id, userId]);
    }

    const activities = await dbAsync.all('SELECT * FROM activities WHERE deal_id = ? AND user_id = ? ORDER BY created_at DESC', [dealId, userId]);

    const { apiKey, provider } = await getUserAISettings(userId);

    const insightsResult = await generateAIDealInsights({
      deal,
      contact,
      activities,
      apiKey,
      provider
    });

    return res.json({
      success: true,
      data: insightsResult
    });
  } catch (err) {
    console.error('AI Deal Analysis Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to analyze deal.' });
  }
});

module.exports = router;
