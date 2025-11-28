// backend/models/BankDetail.js
const mongoose = require("mongoose");

const BankDetailSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  instructions: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BankDetail", BankDetailSchema);
