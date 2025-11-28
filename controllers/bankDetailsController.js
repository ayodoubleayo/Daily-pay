// backend/controllers/bankDetailsController.js
const BankDetail = require("../models/BankDetail");

// get platform bank details (public)
exports.getBankDetails = async (req, res) => {
  try {
    const bd = await BankDetail.findOne().sort({ updatedAt: -1 }).lean();
    if (!bd) return res.json({ bankName: "", accountName: "", accountNumber: "", instructions: "" });
    res.json(bd);
  } catch (err) {
    console.error("getBankDetails", err);
    res.status(500).json({ error: "Failed to fetch bank details" });
  }
};

// admin set / update platform bank details
exports.setBankDetails = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, instructions = "" } = req.body;
    if (!bankName || !accountName || !accountNumber) return res.status(400).json({ error: "Missing fields" });

    const bd = new BankDetail({ bankName, accountName, accountNumber, instructions });
    await bd.save();
    res.json({ ok: true, bank: bd });
  } catch (err) {
    console.error("setBankDetails", err);
    res.status(500).json({ error: "Failed to save bank details" });
  }
};
