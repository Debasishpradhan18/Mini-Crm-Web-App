require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initDB, dbAsync } = require('./db');
const { seedUserCRMData } = require('./seed');
const { authMiddleware } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const dealRoutes = require('./routes/deals');
const activityRoutes = require('./routes/activities');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/assets')) {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), app: 'Mini CRM API' });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Re-seed endpoint for user data reset
app.post('/api/seed/reset', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Clear user's deals, contacts, activities
    await dbAsync.run('DELETE FROM activities WHERE user_id = ?', [userId]);
    await dbAsync.run('DELETE FROM deals WHERE user_id = ?', [userId]);
    await dbAsync.run('DELETE FROM contacts WHERE user_id = ?', [userId]);
    
    // Seed fresh demo data
    await seedUserCRMData(userId);

    return res.json({ success: true, message: 'CRM data has been successfully reset to default demo dataset.' });
  } catch (err) {
    console.error('Reset seed error:', err);
    return res.status(500).json({ success: false, error: 'Failed to reset CRM data.' });
  }
});

// Serve client in production if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Mini CRM API Server</title></head>
          <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h2>Mini CRM Backend API Server is Active (Port ${PORT})</h2>
            <p>To run the frontend, start the Vite dev server on port 5173.</p>
          </body>
        </html>
      `);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An internal server error occurred.'
  });
});

// Startup & Auto-seed default demo account
async function startServer() {
  try {
    await initDB();

    // Check if demo user exists
    let demoUser = await dbAsync.get('SELECT * FROM users WHERE email = ?', ['demo@minicrm.io']);
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('demopass123', salt);
      const res = await dbAsync.run(
        `INSERT INTO users (name, email, password_hash, company, role, avatar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Alex Morgan', 'demo@minicrm.io', hash, 'Apex Solutions', 'Sales Director', 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex']
      );
      demoUser = { id: res.lastID };
      await seedUserCRMData(demoUser.id);
      console.log('Default demo account created: demo@minicrm.io (password: demopass123)');
    }

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` Mini CRM Server running on port ${PORT}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log(`=========================================`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
