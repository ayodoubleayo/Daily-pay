const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-dev';

/**
 * Protect routes for logged-in users.
 * - Accepts "Authorization: Bearer <token>"
 * - Attaches req.user (mongoose document) when valid
 * - Updates lastActive timestamp for the user
 */
module.exports = async function (req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    let data;
    try {
      data = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await User.findById(data.id);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    // optional: block suspended users
    if (user.suspended) return res.status(403).json({ error: 'User suspended' });

    // attach user and update lastActive
    req.user = user;
    user.lastActive = new Date();
    await user.save();

    next();
  } catch (err) {
    console.error('auth middleware error', err);
    res.status(500).json({ error: 'Server error' });
  }
};
