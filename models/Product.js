const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
  location: { lat: Number, lng: Number, address: String },
}, { timestamps: true });
module.exports = mongoose.model('Product', ProductSchema);
