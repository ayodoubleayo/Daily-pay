// backend/controllers/transactionsController.js
const Transaction = require("../models/Transaction");
const PayoutInfo = require("../models/PayoutInfo");
const Seller = require("../models/Seller");
const Order = require("../models/Order");
const User = require("../models/User");

// create history record (called from checkout)
exports.createTransaction = async (req, res) => {
  try {
    const {
      orderId,
      userId,
      sellerId,
      items = [],
      totalAmount,
      total,
      amount,
      shipping = {}
    } = req.body;

    // Always produce a valid number
    const finalTotal = Number(totalAmount || total || amount || 0);

    if (!orderId || !userId || !sellerId)
      return res.status(400).json({ error: "Missing required data" });

    const serviceChargePercent = 10;

    // Ensure these are always numeric
    const serviceChargeAmount = Number(
      Math.round((finalTotal * serviceChargePercent) / 100)
    );

    const amountToSeller = Number(finalTotal - serviceChargeAmount);

    const tx = new Transaction({
      orderId,
      userId,
      sellerId,

      items: items.map(i => ({
        productId: i.productId,
        name: i.name,
        qty: Number(i.qty || 1),
        price: Number(i.price || 0)
      })),

      // Always store clean numbers
      totalAmount: finalTotal,
      serviceChargePercent,
      serviceChargeAmount,
      amountToSeller,

      shipping,
      status: "pending"
    });

    await tx.save();
    res.json({ ok: true, transaction: tx });

  } catch (err) {
    console.error("createTransaction error", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};


// user lists their history
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(400).json({ error: "Missing user id" });

    const txs = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .populate("sellerId", "shopName shopLogo address bankInfo")
      .populate("orderId", "total status createdAt");

    // Fallback values added here too
    const clean = txs.map(t => ({
      ...t._doc,
      totalAmount: Number(t.totalAmount || 0),
      serviceChargeAmount: Number(t.serviceChargeAmount || 0),
      amountToSeller: Number(t.amountToSeller || 0),
    }));

    res.json(clean);

  } catch (err) {
    console.error("getUserTransactions", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};


// seller lists their history
exports.getSellerTransactions = async (req, res) => {
  try {
    const sellerId =
      (req.seller && req.seller.id) ||
      (req.user && req.user.id) ||
      req.params.sellerId;

    if (!sellerId)
      return res.status(400).json({ error: "Missing seller id" });

    const txs = await Transaction.find({ sellerId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("orderId", "total status createdAt");

    const clean = txs.map(t => ({
      ...t._doc,
      totalAmount: Number(t.totalAmount || 0),
      serviceChargeAmount: Number(t.serviceChargeAmount || 0),
      amountToSeller: Number(t.amountToSeller || 0),
    }));

    res.json(clean);

  } catch (err) {
    console.error("getSellerTransactions", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};


// admin: list all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const txs = await Transaction.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("sellerId", "shopName email bankInfo phone")
      .populate("orderId", "total status createdAt");

    const clean = txs.map(t => ({
      ...t._doc,
      totalAmount: Number(t.totalAmount || 0),
      serviceChargeAmount: Number(t.serviceChargeAmount || 0),
      amountToSeller: Number(t.amountToSeller || 0),
    }));

    res.json(clean);

  } catch (err) {
    console.error("getAllTransactions", err);
    res.status(500).json({ error: "Failed to fetch all transactions" });
  }
};


// user uploads proof
exports.uploadProof = async (req, res) => {
  try {
    const id = req.params.id;

    const proofUrl =
      req.body.proofUrl ||
      req.body.paymentProof ||
      (req.body && req.body.proofUrl) ||
      "";

    if (!id || !proofUrl)
      return res.status(400).json({ error: "Missing proof or id" });

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    if (req.user && tx.userId.toString() !== req.user.id.toString())
      return res.status(403).json({ error: "Not allowed" });

    tx.paymentProof = proofUrl;
    tx.status = "payment_confirmed";
    tx.userConfirmed = true;

    await tx.save();
    res.json({ ok: true, tx });

  } catch (err) {
    console.error("uploadProof error", err);
    res.status(500).json({ error: "Failed to upload proof" });
  }
};


// admin approves
exports.adminApprove = async (req, res) => {
  try {
    const id = req.params.id;
    const { adminNote = "" } = req.body;

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ error: "Not found" });

    tx.status = "approved";
    tx.adminNote = adminNote;

    await tx.save();
    res.json({ ok: true, tx });

  } catch (err) {
    console.error("adminApprove error", err);
    res.status(500).json({ error: "Failed to approve" });
  }
};


// admin marks successful
exports.adminMarkSuccessful = async (req, res) => {
  try {
    const id = req.params.id;

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ error: "Not found" });

    tx.status = "successful";
    tx.sellerConfirmed = true;
    tx.userConfirmed = true;

    if (tx.orderId) {
      await Order.findByIdAndUpdate(tx.orderId, {
        status: "transferred"
      }).catch(() => {});
    }

    await tx.save();
    res.json({ ok: true, tx });

  } catch (err) {
    console.error("adminMarkSuccessful", err);
    res.status(500).json({ error: "Failed to mark successful" });
  }
};


// user OR seller confirm
exports.confirmByParty = async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body;

    const tx = await Transaction.findById(id);
    if (!tx) return res.status(404).json({ error: "Not found" });

    if (role === "user") tx.userConfirmed = true;
    if (role === "seller") tx.sellerConfirmed = true;

    if (
      tx.userConfirmed &&
      tx.sellerConfirmed &&
      (tx.status === "approved" || tx.status === "payment_confirmed")
    ) {
      tx.status = "successful";
    }

    await tx.save();
    res.json({ ok: true, tx });

  } catch (err) {
    console.error("confirmByParty", err);
    res.status(500).json({ error: "Failed to confirm" });
  }
};
