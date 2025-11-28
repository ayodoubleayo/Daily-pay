const mongoose = require('mongoose');

const RiderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: "" },
  // status: available | busy | inactive
  status: { type: String, enum: ['available', 'busy', 'inactive'], default: 'available' },
  // optional last known location
  location: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false },
    address: { type: String, required: false }
  },
  // optional meta
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Rider', RiderSchema);
