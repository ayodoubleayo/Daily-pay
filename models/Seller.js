// backend/models/Seller.js
const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  // STORE / MARKET FIELDS
  shopName: String,
  shopDescription: String,
  shopLogo: String,
  phone: String,
  address: String,

  // Seller bank info (each seller can set their own)
  bankInfo: {
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    instructions: { type: String, default: "" } // optional notes
  },

  // NEW: seller geolocation
  location: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    address: { type: String, required: false }
  },

  approved: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },    // NEW
  warnings: { type: Number, default: 0 },       // NEW
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);
