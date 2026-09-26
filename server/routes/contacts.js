const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { validateContact } = require('../middleware/validation');

// All contacts routes require authentication
router.use(authMiddleware);

// Get all contacts with optional search and filters
router.get('/', async (req, res) => {
  try {
    const { search, status, tag, sort } = req.query;
    const userId = req.user.id;

    let query = `
      SELECT 
        c.*,
        COUNT(DISTINCT d.id) as deals_count,
        COALESCE(SUM(d.value), 0) as total_pipeline_value,
        MAX(a.created_at) as last_activity_at
      FROM contacts c
      LEFT JOIN deals d ON d.contact_id = c.id
      LEFT JOIN activities a ON a.contact_id = c.id
      WHERE c.user_id = ?
    `;
    const params = [userId];

    if (search && search.trim().length > 0) {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ? OR c.phone LIKE ? OR c.job_title LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status && status !== 'All') {
      query += ` AND c.status = ?`;
      params.push(status);
    }

    if (tag && tag !== 'All') {
      query += ` AND c.tags LIKE ?`;
      params.push(`%"${tag}"%`);
    }

    query += ` GROUP BY c.id`;

    // Sorting
    if (sort === 'value_desc') {
      query += ` ORDER BY total_pipeline_value DESC`;
    } else if (sort === 'name_asc') {
      query += ` ORDER BY c.name ASC`;
    } else if (sort === 'name_desc') {
      query += ` ORDER BY c.name DESC`;
    } else if (sort === 'oldest') {
      query += ` ORDER BY c.created_at ASC`;
    } else {
      query += ` ORDER BY c.created_at DESC`;
    }

    const contacts = await dbAsync.all(query, params);

    // Parse JSON tags
    const formattedContacts = contacts.map(c => {
      let parsedTags = [];
      try {
        parsedTags = typeof c.tags === 'string' ? JSON.parse(c.tags) : (c.tags || []);
      } catch (e) {
        parsedTags = [];
      }
      return {
        ...c,
        tags: parsedTags
      };
    });

    return res.json({
      success: true,
      contacts: formattedContacts,
      count: formattedContacts.length
    });
  } catch (err) {
    console.error('Get contacts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch contacts.' });
  }
});

// Get a single contact with associated deals and timeline activities
router.get('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.user.id;

    const contact = await dbAsync.get(
      'SELECT * FROM contacts WHERE id = ? AND user_id = ?',
      [contactId, userId]
    );

    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    let parsedTags = [];
    try {
      parsedTags = typeof contact.tags === 'string' ? JSON.parse(contact.tags) : [];
    } catch (e) {
      parsedTags = [];
    }

    // Get deals for this contact
    const deals = await dbAsync.all(
      'SELECT * FROM deals WHERE contact_id = ? AND user_id = ? ORDER BY created_at DESC',
      [contactId, userId]
    );

    // Get activities for this contact
    const activities = await dbAsync.all(
      'SELECT * FROM activities WHERE contact_id = ? AND user_id = ? ORDER BY created_at DESC',
      [contactId, userId]
    );

    return res.json({
      success: true,
      contact: {
        ...contact,
        tags: parsedTags
      },
      deals,
      activities
    });
  } catch (err) {
    console.error('Get single contact error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve contact details.' });
  }
});

// Create new contact
router.post('/', validateContact, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, company, job_title, status, tags, value, notes, linkedin, twitter, avatar } = req.body;

    const avatarUrl = avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : '[]';

    const result = await dbAsync.run(
      `INSERT INTO contacts (user_id, name, email, phone, company, job_title, status, tags, value, notes, linkedin, twitter, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        company ? company.trim() : null,
        job_title ? job_title.trim() : null,
        status || 'Lead',
        tagsJson,
        Number(value) || 0,
        notes ? notes.trim() : null,
        linkedin ? linkedin.trim() : null,
        twitter ? twitter.trim() : null,
        avatarUrl
      ]
    );

    const newContact = await dbAsync.get('SELECT * FROM contacts WHERE id = ?', [result.lastID]);

    // Log Activity
    await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, type, title, description)
       VALUES (?, ?, 'contact_created', 'Contact Created', ?)`,
      [userId, newContact.id, `Added contact ${newContact.name} (${newContact.company || 'No company'})`]
    );

    return res.status(201).json({
      success: true,
      message: 'Contact created successfully!',
      contact: {
        ...newContact,
        tags: Array.isArray(tags) ? tags : []
      }
    });
  } catch (err) {
    console.error('Create contact error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create contact.' });
  }
});

// Update contact
router.put('/:id', validateContact, async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.user.id;
    const { name, email, phone, company, job_title, status, tags, value, notes, linkedin, twitter, avatar } = req.body;

    const existing = await dbAsync.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : (tags ? JSON.stringify([tags]) : existing.tags);

    await dbAsync.run(
      `UPDATE contacts 
       SET name = ?, email = ?, phone = ?, company = ?, job_title = ?, status = ?, tags = ?, value = ?, notes = ?, linkedin = ?, twitter = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        name.trim(),
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        company ? company.trim() : null,
        job_title ? job_title.trim() : null,
        status || existing.status,
        tagsJson,
        value !== undefined ? Number(value) : existing.value,
        notes !== undefined ? notes : existing.notes,
        linkedin !== undefined ? linkedin : existing.linkedin,
        twitter !== undefined ? twitter : existing.twitter,
        avatar || existing.avatar,
        contactId,
        userId
      ]
    );

    const updatedContact = await dbAsync.get('SELECT * FROM contacts WHERE id = ?', [contactId]);

    // Log Activity
    await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, type, title, description)
       VALUES (?, ?, 'note', 'Contact Updated', ?)`,
      [userId, contactId, `Updated details for ${updatedContact.name}`]
    );

    let parsedTags = [];
    try {
      parsedTags = JSON.parse(updatedContact.tags);
    } catch (e) {
      parsedTags = [];
    }

    return res.json({
      success: true,
      message: 'Contact updated successfully!',
      contact: {
        ...updatedContact,
        tags: parsedTags
      }
    });
  } catch (err) {
    console.error('Update contact error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update contact.' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.user.id;

    const existing = await dbAsync.get('SELECT name FROM contacts WHERE id = ? AND user_id = ?', [contactId, userId]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    await dbAsync.run('DELETE FROM contacts WHERE id = ? AND user_id = ?', [contactId, userId]);

    return res.json({
      success: true,
      message: `Contact "${existing.name}" and associated records deleted.`
    });
  } catch (err) {
    console.error('Delete contact error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete contact.' });
  }
});

// Add a quick note to a contact
router.post('/:id/notes', async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.user.id;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Note content is required.' });
    }

    const contact = await dbAsync.get('SELECT * FROM contacts WHERE id = ? AND user_id = ?', [contactId, userId]);
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    // Append to existing notes
    const newNotes = contact.notes 
      ? `${contact.notes}\n[${new Date().toLocaleDateString()}]: ${note.trim()}`
      : `[${new Date().toLocaleDateString()}]: ${note.trim()}`;

    await dbAsync.run(
      'UPDATE contacts SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newNotes, contactId]
    );

    // Log Activity
    const actResult = await dbAsync.run(
      `INSERT INTO activities (user_id, contact_id, type, title, description)
       VALUES (?, ?, 'note', 'Note Added', ?)`,
      [userId, contactId, note.trim()]
    );

    const newActivity = await dbAsync.get('SELECT * FROM activities WHERE id = ?', [actResult.lastID]);

    return res.json({
      success: true,
      message: 'Note saved!',
      notes: newNotes,
      activity: newActivity
    });
  } catch (err) {
    console.error('Add note error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save note.' });
  }
});

module.exports = router;
