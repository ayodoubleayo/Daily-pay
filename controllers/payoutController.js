// backend/controllers/payoutController.js
const PayoutInfo = require("../models/PayoutInfo");
const User = require("../models/User");

// Save / update payout info for logged-in user
exports.savePayoutInfo = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Not authorized" });

    const { fullName, bankName, accountNumber, bvn = "", nin = "", idUpload = "", certificate = "" } = req.body;
    if (!fullName || !bankName || !accountNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // upsert: find existing
    let pi = await PayoutInfo.findOne({ userId });
    if (!pi) {
      pi = new PayoutInfo({
        userId,
        fullName,
        bankName,
        accountNumber,
        bvn,
        nin,
        idUpload,
        certificate,
        verified: false
      });
    } else {
      pi.fullName = fullName;
      pi.bankName = bankName;
      pi.accountNumber = accountNumber;
      pi.bvn = bvn;
      pi.nin = nin;
      if (idUpload) pi.idUpload = idUpload;
      if (certificate) pi.certificate = certificate;
      // when user edits, mark unverified (admin must reverify)
      pi.verified = false;
    }

    await pi.save();
    res.json({ ok: true, payoutInfo: pi });
  } catch (err) {
    console.error("savePayoutInfo error", err);
    res.status(500).json({ error: "Failed to save payout info" });
  }
};

// get current user's payout info
exports.getMyPayoutInfo = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: "Not authorized" });

    const pi = await PayoutInfo.findOne({ userId });
    if (!pi) return res.json({ ok: true, payoutInfo: null });
    res.json({ ok: true, payoutInfo: pi });
  } catch (err) {
    console.error("getMyPayoutInfo error", err);
    res.status(500).json({ error: "Failed to fetch payout info" });
  }
};

// admin verify a payout info record (id param)
exports.adminVerify = async (req, res) => {
  try {
    const id = req.params.id;
    const pi = await PayoutInfo.findById(id);
    if (!pi) return res.status(404).json({ error: "Not found" });

    pi.verified = true;
    await pi.save();

    res.json({ ok: true, payoutInfo: pi });
  } catch (err) {
    console.error("adminVerify error", err);
    res.status(500).json({ error: "Failed to verify payout info" });
  }
};
