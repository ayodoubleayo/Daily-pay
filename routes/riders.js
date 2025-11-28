const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');

// Prefer your existing authAdmin middleware if available.
// Fallback: simple admin-secret header check.
let authAdmin = null;
try {
  authAdmin = require('../middleware/authAdmin');
} catch (e) {
  authAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'] || req.query.adminSecret;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Admin auth required' });
    }
    next();
  };
}

// List riders (admin)
router.get('/', authAdmin, async (req, res) => {
  try {
    const riders = await Rider.find().sort({ createdAt: -1 }).lean();
    res.json(riders);
  } catch (err) {
    console.error('list riders error', err);
    res.status(500).json({ error: 'Failed to load riders' });
  }
});

// Create rider (admin)
router.post('/', authAdmin, async (req, res) => {
  try {
    const { name, phone, status = 'available', location = null } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const r = new Rider({ name, phone, status, location });
    await r.save();
    res.status(201).json(r);
  } catch (err) {
    console.error('create rider error', err);
    res.status(500).json({ error: 'Failed to create rider' });
  }
});

// Update rider status/profile (admin)
router.put('/:id', authAdmin, async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.id);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });
    rider.name = req.body.name ?? rider.name;
    rider.phone = req.body.phone ?? rider.phone;
    rider.status = req.body.status ?? rider.status;
    rider.location = req.body.location ?? rider.location;
    await rider.save();
    res.json(rider);
  } catch (err) {
    console.error('update rider error', err);
    res.status(500).json({ error: 'Failed to update rider' });
  }
});

module.exports = router;
