// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const User = require('../models/User');
const Seller = require('../models/Seller');

/**
 * Helpers
 */
function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * DAILY ACTIVE USERS
 */
router.get('/active-users', authAdmin, async (req, res) => {
  try {
    const today = startOfToday();
    const users = await User.find({ lastActive: { $gte: today } }).select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('active-users error', err);
    res.status(500).json({ error: 'Failed to fetch active users' });
  }
});


/**
 * DAILY ACTIVE SELLERS
 */
router.get('/active-sellers', authAdmin, async (req, res) => {
  try {
    const today = startOfToday();
    const sellers = await Seller.find({ lastActive: { $gte: today } }).select('-passwordHash');
    res.json(sellers);
  } catch (err) {
    console.error('active-sellers error', err);
    res.status(500).json({ error: 'Failed to fetch active sellers' });
  }
});

/**
 * PENDING SELLERS (list)
 */
router.get('/sellers/pending', authAdmin, async (req, res) => {
  try {
    const pending = await Seller.find({ approved: false }).select('-passwordHash');
    res.json(pending);
  } catch (err) {
    console.error('pending sellers error', err);
    res.status(500).json({ error: 'Failed to fetch pending sellers' });
  }
});

/**
 * APPROVE SELLER
 */
router.put('/sellers/:id/approve', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    s.approved = true;
    await s.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('approve seller error', err);
    res.status(500).json({ error: 'Failed to approve seller' });
  }
});



/**
 * SUSPEND SELLER
 */
router.put('/sellers/:id/suspend', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    s.suspended = true;
    await s.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('suspend seller error', err);
    res.status(500).json({ error: 'Failed to suspend seller' });
  }
});

/**
 * REACTIVATE SELLER
 */
router.put('/sellers/:id/reactivate', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    s.suspended = false;
    await s.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('reactivate seller error', err);
    res.status(500).json({ error: 'Failed to reactivate seller' });
  }
});

/**
 * BAN SELLER
 */
router.put('/sellers/:id/ban', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    s.banned = true;
    s.suspended = false;
    await s.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('ban seller error', err);
    res.status(500).json({ error: 'Failed to ban seller' });
  }
});

/**
 * UNBAN SELLER
 */
router.put('/sellers/:id/unban', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    s.banned = false;
    await s.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('unban seller error', err);
    res.status(500).json({ error: 'Failed to unban seller' });
  }
});

/**
 * WARN SELLER (increment counter)
 */
router.put('/sellers/:id/warn', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    s.warnings = (s.warnings || 0) + 1;
    await s.save();
    res.json({ ok: true, warnings: s.warnings });
  } catch (err) {
    console.error('warn seller error', err);
    res.status(500).json({ error: 'Failed to warn seller' });
  }
});

/**
 * REMOVE (DELETE) SELLER
 */
router.delete('/sellers/:id', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('delete seller error', err);
    res.status(500).json({ error: 'Failed to delete seller' });
  }
});

/**
 * SUSPEND USER
 */
router.put('/users/:id/suspend', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.suspended = true;
    await u.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('suspend user error', err);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

/**
 * REACTIVATE USER
 */
router.put('/users/:id/reactivate', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.suspended = false;
    await u.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('reactivate user error', err);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

/**
 * BAN USER
 */
router.put('/users/:id/ban', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.banned = true;
    u.suspended = false;
    await u.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('ban user error', err);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

/**
 * UNBAN USER
 */
router.put('/users/:id/unban', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.banned = false;
    await u.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('unban user error', err);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

/**
 * WARN USER (increment counter)
 */
router.put('/users/:id/warn', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    u.warnings = (u.warnings || 0) + 1;
    await u.save();
    res.json({ ok: true, warnings: u.warnings });
  } catch (err) {
    console.error('warn user error', err);
    res.status(500).json({ error: 'Failed to warn user' });
  }
});

/**
 * UNWARN SELLER (decrement counter but never go below 0)
 */
router.put('/sellers/:id/unwarn', authAdmin, async (req, res) => {
  try {
    const s = await Seller.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });

    s.warnings = Math.max(0, (s.warnings || 0) - 1);
    await s.save();

    res.json({ ok: true, warnings: s.warnings });
  } catch (err) {
    console.error('unwarn seller error', err);
    res.status(500).json({ error: 'Failed to remove seller warning' });
  }
});


/**
 * UNWARN USER (decrement counter but never go below 0)
 */
router.put('/users/:id/unwarn', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });

    u.warnings = Math.max(0, (u.warnings || 0) - 1);
    await u.save();

    res.json({ ok: true, warnings: u.warnings });
  } catch (err) {
    console.error('unwarn user error', err);
    res.status(500).json({ error: 'Failed to remove user warning' });
  }
});

/**
 * REMOVE (DELETE) USER
 */
router.delete('/users/:id', authAdmin, async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    await u.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error('delete user error', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * LIST SUSPENDED USERS/SELLERS
 */
router.get('/users/suspended', authAdmin, async (req, res) => {
  try {
    const users = await User.find({ suspended: true }).select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('users suspended error', err);
    res.status(500).json({ error: 'Failed to fetch suspended users' });
  }
});

router.get('/sellers/suspended', authAdmin, async (req, res) => {
  try {
    const sellers = await Seller.find({ suspended: true }).select('-passwordHash');
    res.json(sellers);
  } catch (err) {
    console.error('sellers suspended error', err);
    res.status(500).json({ error: 'Failed to fetch suspended sellers' });
  }
});

module.exports = router;
