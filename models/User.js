// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, default: 'user' },
  suspended: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  warnings: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },

  // FORGOT PASSWORD
  resetPasswordToken: String,   // hashed token
  resetPasswordExpires: Date,   // expiry timestamp
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
