// models/Settings.js
const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  pickupFee: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Settings", SettingsSchema);
