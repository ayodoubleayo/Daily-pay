// backend/models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      qty: Number,
      price: Number
    }
  ],

  total: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: false },

  /**
   * Primary status (business states)
   */
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "transferred",
      "payment_confirmed",
      "approved",
      "successful",
      "out for delivery",
      "delivered",
      "failed"
    ],
    default: "pending"
  },

  /**
   * Shipping details (keeps snapshot)
   */
  shipping: {
    method: { type: String, default: "pickup" }, // 'pickup' | 'delivery'
    fee: { type: Number, default: 0 },            // computed fare
    details: mongoose.Schema.Types.Mixed         // { name, phone, address, city }
  },

  /**
   * Shipping-specific status & rider tracking
   * shippingStatus is the delivery flow for the courier/rider
   */
  shippingStatus: {
    type: String,
    enum: [
      "not_assigned",
      "rider_assigned",
      "picked_up",      // rider collected package
      "en_route",       // moving toward user
      "arrived",        // rider at destination
      "delivered",
      "cancelled_with_fee",
      "cancelled_no_fee"
    ],
    default: "not_assigned"
  },

  // Rider snapshot (could be null until assigned)
  rider: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    name: String,
    phone: String
  },

  // Rider progress tracking (minutes covered, percent for progress bar)
  riderProgress: {
    minutesCovered: { type: Number, default: 0 }, // minutes already ridden
    percent: { type: Number, default: 0 },        // 0..100 for UI progress
    lastLocation: mongoose.Schema.Types.Mixed     // { lat, lng, timestamp } optional
  },

  // Estimated minutes (server-calculated at order creation)
  distanceMinutesEstimated: { type: Number, default: 0 },

  // Cancellation metadata (if cancelled)
  cancelled: {
    by: { type: String }, // 'user' | 'rider' | 'admin'
    at: Date,
    reason: String,
    riderCompensationPaid: { type: Number, default: 0 } // amount paid to rider for covered distance
  },

  meta: mongoose.Schema.Types.Mixed

}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
