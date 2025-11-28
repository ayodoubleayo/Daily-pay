const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-dev';
module.exports = async function (req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const data = jwt.verify(token, JWT_SECRET);
    const seller = await Seller.findById(data.id);
    if (!seller) return res.status(401).json({ error: 'Invalid token' });
    if (!seller.approved) return res.status(403).json({ error: 'Seller not approved' });
    if (seller.suspended) return res.status(403).json({ error: 'Seller suspended' });
    req.seller = seller;
    seller.lastActive = new Date();
    await seller.save().catch(()=>{});
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
