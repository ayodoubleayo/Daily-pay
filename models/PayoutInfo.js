// backend/models/PayoutInfo.js
const mongoose = require("mongoose");

const PayoutInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },

  // optional fields
  bvn: { type: String, default: "" },
  nin: { type: String, default: "" },

  idUpload: { type: String, default: "" }, // URL to uploaded file
  certificate: { type: String, default: "" }, // URL

  verified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PayoutInfo", PayoutInfoSchema);
