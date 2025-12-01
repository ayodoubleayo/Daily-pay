// backend/middleware/authAdmin.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-dev';

module.exports = async function (req, res, next) {
  try {
    // 1) Try cookie first
    let token = req.cookies && req.cookies.token;

    // 2) Fallback to Authorization header: Bearer <token>
    if (!token) {
      const auth = (req.headers.authorization || '').trim();
      if (auth.toLowerCase().startsWith('bearer ')) {
        token = auth.slice(7).trim();
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized: Missing token' });
    }

    // 3) Verify token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Not authorized: Invalid token' });
    }

    // 4) Payload must have id
    if (!payload || !payload.id) {
      return res.status(401).json({ error: 'Not authorized: Invalid token payload' });
    }

    // 5) Fetch user
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized: User not found' });
    }

    // 6) Must be admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }

    // 7) Attach to request
    req.user = user;
    next();

  } catch (err) {
    console.error('authAdmin error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
