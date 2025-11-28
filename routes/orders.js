const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Settings = require("../models/Settings");
const auth = require("../middleware/auth");
let authAdmin = null;
try { authAdmin = require('../middleware/authAdmin'); } catch (e) {
  authAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'] || req.query.adminSecret;
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: 'Admin auth required' });
    }
    next();
  };
}
const Rider = require('../models/Rider');

// inline haversine (same logic as shipping calc)
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// CREATE order
router.post("/", auth, async (req, res) => {
  try {
    const { items = [], meta = {}, sellerId = null } = req.body;

    // subtotal server-side
    const subtotal = items.reduce((s, it) => {
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 1);
      return s + price * qty;
    }, 0);

    // ensure settings
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    // default shipping
    let shippingMethod = meta?.shipping?.method || "pickup";
    let shippingFee = shippingMethod === "delivery" ? Number(settings.deliveryFee || 0) : Number(settings.pickupFee || 0);
    let distanceMinutesEstimated = 0;

    // pick up coords if sent
    const sellerLat = meta?.shipping?.sellerLat;
    const sellerLng = meta?.shipping?.sellerLng;
    const userLat = meta?.shipping?.userLat;
    const userLng = meta?.shipping?.userLng;

    // if client requested delivery and provided coords, recalc server-side (safe)
    if (shippingMethod === "delivery" && sellerLat != null && sellerLng != null && userLat != null && userLng != null) {
      const distanceKm = haversineKm(Number(sellerLat), Number(sellerLng), Number(userLat), Number(userLng));
      distanceMinutesEstimated = Math.max(1, Math.round(distanceKm * 2));
      const perMinute = 50;
      let fare = Math.round(distanceMinutesEstimated * perMinute);
      fare = Math.max(500, Math.min(5000, fare));
      shippingFee = fare;
    }

    shippingFee = Number(shippingFee || 0);

    const total = Math.round(Number(subtotal) + Number(shippingFee));
    const commission = Math.round(total * 0.05);

    const order = await Order.create({
      user: req.user.id,
      seller: sellerId || null,
      total: Number(total),
      commission,
      items: items.map((i) => ({
        product: i.productId || i._id || i.product,
        qty: i.qty || 1,
        price: Number(i.price) || 0,
      })),
      shipping: {
        method: shippingMethod,
        fee: shippingFee,
        details: meta?.shipping?.details || meta?.shipping?.address || {}
      },
      distanceMinutesEstimated,
      meta: { ...meta }
    });

    try {
      const serviceChargePercent = 10;
      const serviceChargeAmount = Math.round((total * serviceChargePercent) / 100);
      const amountToSeller = total - serviceChargeAmount;

      const tx = await Transaction.create({
        orderId: order._id,
        userId: req.user.id,
        sellerId: sellerId || null,
        totalAmount: Number(total),
        items,
        serviceChargePercent,
        serviceChargeAmount,
        amountToSeller,
        shipping: {
          method: shippingMethod,
          fee: shippingFee,
          details: meta?.shipping || {}
        },
      });

      return res.status(201).json({ order, transaction: tx });
    } catch (e) {
      console.error("Transaction create failed", e);
      return res.status(201).json({ order, warning: "Order OK but transaction failed" });
    }

  } catch (err) {
    console.error("create order error", err);
    res.status(500).json({ error: "Cannot create order" });
  }
});

// GET an order (user can only view his own order)
router.get("/:id", auth, async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("seller")
      .populate("user", "name email")
      .populate("rider")
      .lean();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // ensure only the owner can view the order
    if (order.user?._id?.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not allowed" });
    }

    return res.json({ order });
  } catch (err) {
    console.error("get order error", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});


// Cancel route
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const { reason = "" } = req.body;
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ error: "Order not found" });

    if (["delivered", "successful"].includes(o.shippingStatus) || ["delivered", "successful"].includes(o.status)) {
      return res.status(400).json({ error: "Cannot cancel delivered or completed order" });
    }

    let riderCompensation = 0;
    const pickedUpStates = ["picked_up", "en_route", "arrived"];
    if (pickedUpStates.includes(o.shippingStatus)) {
      const minutes = Number(o.riderProgress?.minutesCovered || 0);
      const perMinute = 50;
      const distanceCoveredFee = Math.round(minutes * perMinute);
      riderCompensation = Math.round(distanceCoveredFee * 0.5);

      o.cancelled = {
        by: "user",
        at: new Date(),
        reason,
        riderCompensationPaid: riderCompensation
      };
      o.shippingStatus = "cancelled_with_fee";
    } else {
      o.cancelled = { by: "user", at: new Date(), reason, riderCompensationPaid: 0 };
      o.shippingStatus = "cancelled_no_fee";
    }

    o.status = "failed";
    await o.save();

    res.json({ ok: true, message: "Order cancelled", riderCompensation });
  } catch (err) {
    console.error("cancel order error", err);
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

/**
 * ADMIN: assign a rider to an order
 * POST /api/orders/:id/assign-rider  { riderId }
 */
router.post('/:id/assign-rider', authAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { riderId } = req.body;
    if (!riderId) return res.status(400).json({ error: 'riderId required' });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const rider = await Rider.findById(riderId);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });

    // mark rider busy
    rider.status = 'busy';
    await rider.save();

    // attach snapshot to order and set shippingStatus
    order.rider = {
      id: rider._id,
      name: rider.name,
      phone: rider.phone
    };
    order.shippingStatus = 'rider_assigned';
    await order.save();

    return res.json({ ok: true, order });
  } catch (err) {
    console.error('assign rider error', err);
    res.status(500).json({ error: 'Failed to assign rider' });
  }
});

/**
 * Rider/progress update
 * POST /api/orders/:id/rider-progress { minutesCovered, percent, lastLocation, shippingStatus? }
 * auth is required - rider or admin
 */
router.post('/:id/rider-progress', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { minutesCovered, percent, lastLocation, shippingStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (typeof minutesCovered === 'number') order.riderProgress.minutesCovered = minutesCovered;
    if (typeof percent === 'number') order.riderProgress.percent = Math.max(0, Math.min(100, percent));
    if (lastLocation) order.riderProgress.lastLocation = lastLocation;

    // optional: update shippingStatus if provided and valid
    if (shippingStatus && ['picked_up','en_route','arrived','delivered'].includes(shippingStatus)) {
      order.shippingStatus = shippingStatus;
    } else if (order.riderProgress.percent > 0) {
      // if progress started, ensure at least en_route
      if (order.shippingStatus === 'rider_assigned' || order.shippingStatus === 'not_assigned') {
        order.shippingStatus = 'en_route';
      }
    }

    await order.save();

    // if percent === 100 or shippingStatus === 'delivered' mark order.status/delivered
    if (order.riderProgress.percent >= 100 || order.shippingStatus === 'delivered') {
      order.shippingStatus = 'delivered';
      order.status = 'delivered';
      await order.save();

      // mark rider available again (if rider exists)
      if (order.rider?.id) {
        try {
          const rid = await Rider.findById(order.rider.id);
          if (rid) {
            rid.status = 'available';
            await rid.save();
          }
        } catch (e) {
          // ignore
        }
      }
    }

    res.json({ ok: true, order });
  } catch (err) {
    console.error('rider progress error', err);
    res.status(500).json({ error: 'Failed to update rider progress' });
  }
});

module.exports = router;
