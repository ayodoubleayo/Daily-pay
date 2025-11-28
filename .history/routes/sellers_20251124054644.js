// backend/routes/sellers.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction'); // used to show seller purchases
const Order = require('../models/Order');             // <-- ensure Order model is imported

// History isn't always present in every project. try to require it safely.
let History = null;
try {
  History = require('../models/History');
} catch (e) {
  // History optional — we'll skip updating it if not available.
}

const authSeller = require('../middleware/authSeller');
const JWT_SECRET = process.env.JWT_SECRET || 'secret-dev';

// SELLER REGISTER
router.post('/register', async (req, res) => {
  try {
    const { shopName, email, password, phone, address } = req.body;

    if (!shopName || !email || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ error: "Seller already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const seller = new Seller({
      shopName,
      email,
      passwordHash,
      phone,
      address
    });

    await seller.save();

    res.json({ ok: true, seller: seller });
  } catch (err) {
    console.error('seller register error', err);
    res.status(500).json({ error: "Failed to register seller" });
  }
});

// SELLER LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const seller = await Seller.findOne({ email });
    if (!seller)
      return res.status(400).json({ error: "Seller not found" });

    // block banned / suspended
    if (seller.banned) return res.status(403).json({ error: 'Account banned permanently' });
    if (seller.suspended) return res.status(403).json({ error: 'Account suspended by admin' });

    const isMatch = await bcrypt.compare(password, seller.passwordHash);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: seller._id, role: "seller" }, JWT_SECRET, {
      expiresIn: "7d"
    });

    const sellerObj = seller.toObject();
    delete sellerObj.passwordHash;

    res.json({ ok: true, token, seller: sellerObj });
  } catch (err) {
    console.error('seller login error', err);
    res.status(500).json({ error: "Failed to login seller" });
  }
});

// GET PUBLIC SELLER BY ID
router.get('/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).select('-passwordHash').lean();
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller);
  } catch (err) {
    console.error('Get seller error', err);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
});

// GET my bank info
router.get('/me/bank-info', authSeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select('bankInfo').lean();
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    res.json(seller.bankInfo || {});
  } catch (err) {
    console.error("get bank info error", err);
    res.status(500).json({ error: "Failed to load bank info" });
  }
});

// UPDATE my bank info
router.put('/me/bank-info', authSeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id);
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    const { bankName = "", accountName = "", accountNumber = "", instructions = "" } = req.body;
    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({ error: "Missing required bank fields" });
    }
    seller.bankInfo = { bankName, accountName, accountNumber, instructions };
    await seller.save();

    const sellerObj = seller.toObject();
    delete sellerObj.passwordHash;
    res.json({ ok: true, seller: sellerObj });
  } catch (err) {
    console.error("update bank info error", err);
    res.status(500).json({ error: "Failed to update bank info" });
  }
});

// seller creates product
router.post('/me/products', authSeller, async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const { name, price, description = "", image = "", category = null, location = null } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const product = new Product({ name, price, description, image, category, seller: sellerId, location });
    await product.save();
    res.json(product);
  } catch (err) {
    console.error("Create product error", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/**
 * NEW: GET my products (seller dashboard list)
 * GET /api/sellers/me/products
 */
router.get('/me/products', authSeller, async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const prods = await Product.find({ seller: sellerId }).sort({ createdAt: -1 }).lean();
    res.json(prods);
  } catch (err) {
    console.error('get my products error', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

/**
 * NEW: GET my orders / purchases (from Transaction collection)
 * GET /api/sellers/me/orders
 * This shows purchases/payments where this seller was the recipient.
 */
router.get('/me/orders', authSeller, async (req, res) => {
  try {
    const sellerId = req.seller.id;

    const txs = await Transaction.find({ sellerId })
      .sort({ createdAt: -1 })
      .populate('orderId')            // bring order snapshot
      .populate('userId', 'name email'); // buyer info

    // Clean numeric fields
    const clean = txs.map(t => (Object.assign({}, t._doc, {
      totalAmount: Number(t.totalAmount || 0),
      serviceChargeAmount: Number(t.serviceChargeAmount || 0),
      amountToSeller: Number(t.amountToSeller || 0),
    })));

    res.json(clean);
  } catch (err) {
    console.error('get my orders error', err);
    res.status(500).json({ error: 'Failed to load seller orders' });
  }
});

// SELLER UPDATES ORDER STATUS
router.put('/me/orders/:id/status', authSeller, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const sellerId = req.seller.id;

    if (!status)
      return res.status(400).json({ error: "Status required" });

    // 1. Find order
    const order = await Order.findOne({ _id: orderId, seller: sellerId });
    if (!order)
      return res.status(404).json({ error: "Order not found" });

    // 2. Update order status (Order.schema must include the enum/status field)
    order.status = status;
    await order.save();

    // 3. Update Transaction status (set both status and orderStatus for robustness)
    await Transaction.updateMany(
      { orderId },
      { $set: { status: status, orderStatus: status } }
    );

    // 4. Update History (if present) — best-effort
    if (History) {
      try {
        await History.updateMany(
          { orderId },
          { $set: { status } }
        );
      } catch (e) {
        // ignore history update failure
      }
    }

    res.json({
      ok: true,
      order
    });

  } catch (err) {
    console.error("seller update status error", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// UPDATE SELLER STORE INFO
router.put("/me/store", authSeller, async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id);
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // UPDATE FIELDS
    seller.shopName = req.body.shopName ?? seller.shopName;
    seller.shopDescription = req.body.shopDescription ?? seller.shopDescription;
    seller.shopLogo = req.body.shopLogo ?? seller.shopLogo;
    seller.phone = req.body.phone ?? seller.phone;
    seller.address = req.body.address ?? seller.address;

    // UPDATE LOCATION
    if (!seller.location) seller.location = {}; // safety
    seller.location.lat = req.body.location?.lat ?? seller.location.lat;
    seller.location.lng = req.body.location?.lng ?? seller.location.lng;
    seller.location.address = req.body.location?.address ?? seller.location.address;

    await seller.save();

    // RETURN SANITIZED DATA
    const { passwordHash, ...cleanSeller } = seller.toObject();

    res.json({
      success: true,
      seller: cleanSeller
    });

  } catch (err) {
    console.error("Error updating seller store:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
