const Order = require("../models/Order");

// USER SUBMITS PAYMENT PROOF
exports.submitProof = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({ error: "Payment proof is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.meta = {
      ...order.meta,
      paymentProof: proofUrl,
      submittedAt: new Date()
    };

    order.status = "transferred";

    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Proof submit error:", err);
    res.status(500).json({ error: "Server error saving proof" });
  }
};

// USER — GET THEIR HISTORY
exports.getUserHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ADMIN — GET ALL TRANSACTIONS
exports.getAllTransactions = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ADMIN APPROVES PAYMENT PROOF
exports.adminApprove = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Transaction not found" });

    order.status = "approved";
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ADMIN MARKS SUCCESSFUL
exports.adminSuccess = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Transaction not found" });

    order.status = "successful";
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
