const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { dbAsync } = require('../db');
const { authMiddleware, generateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Register a new user
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, company, role } = req.body;

    const existingUser = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await dbAsync.run(
      `INSERT INTO users (name, email, password_hash, company, role, avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        company ? company.trim() : 'My Business',
        role ? role.trim() : 'Sales Lead',
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`
      ]
    );

    const newUser = await dbAsync.get(
      'SELECT id, name, email, company, role, avatar, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    const token = generateToken(newUser);

    // Also auto-seed demo data for this brand new user so they have a great first experience!
    const { seedUserCRMData } = require('../seed');
    await seedUserCRMData(newUser.id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

// User Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await dbAsync.get(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Welcome back!',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error during login.' });
  }
});

// Demo Login (quick 1-click test account)
router.post('/demo-login', async (req, res) => {
  try {
    let user = await dbAsync.get('SELECT * FROM users WHERE email = ?', ['demo@minicrm.io']);
    
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('demopass123', salt);
      const result = await dbAsync.run(
        `INSERT INTO users (name, email, password_hash, company, role, avatar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Alex Morgan', 'demo@minicrm.io', passwordHash, 'Apex Solutions', 'Sales Director', 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex']
      );
      user = await dbAsync.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      const { seedUserCRMData } = require('../seed');
      await seedUserCRMData(user.id);
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      role: user.role,
      avatar: user.avatar,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Logged in as Demo User',
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ success: false, error: 'Failed to authenticate demo user.' });
  }
});

// Get Current User Profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Get custom settings if any (like AI key)
    const settingsRows = await dbAsync.all('SELECT key, value FROM settings WHERE user_id = ?', [req.user.id]);
    const settingsMap = {};
    settingsRows.forEach(r => { settingsMap[r.key] = r.value; });

    return res.json({
      success: true,
      user: req.user,
      settings: settingsMap
    });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
});

// Update Profile & Settings
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, company, role, avatar, aiApiKey, aiProvider } = req.body;

    await dbAsync.run(
      `UPDATE users SET name = COALESCE(?, name), company = COALESCE(?, company), role = COALESCE(?, role), avatar = COALESCE(?, avatar) WHERE id = ?`,
      [name, company, role, avatar, req.user.id]
    );

    if (aiApiKey !== undefined) {
      await dbAsync.run(
        `INSERT INTO settings (user_id, key, value) VALUES (?, 'ai_api_key', ?)
         ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value`,
        [req.user.id, aiApiKey.trim()]
      );
    }

    if (aiProvider !== undefined) {
      await dbAsync.run(
        `INSERT INTO settings (user_id, key, value) VALUES (?, 'ai_provider', ?)
         ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value`,
        [req.user.id, aiProvider.trim()]
      );
    }

    const updatedUser = await dbAsync.get(
      'SELECT id, name, email, company, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      success: true,
      message: 'Profile and settings updated!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update user profile.' });
  }
});

module.exports = router;
