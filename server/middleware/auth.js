const jwt = require('jsonwebtoken');
const { dbAsync } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'crm_secret_jwt_key_2026_super_secure';

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid Authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token is missing'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbAsync.get(
      'SELECT id, name, email, company, role, avatar, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: User account no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.'
    });
  }
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  authMiddleware,
  generateToken,
  JWT_SECRET
};
