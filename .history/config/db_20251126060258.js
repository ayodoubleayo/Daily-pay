// backend/config/db.js
const mongoose = require('mongoose');

async function connectDB() {
  // accept multiple common env names
  const uri = process.env.MONGODB_URI ||
              process.env.MONGO_URI ||
              process.env.MONGO_URL ||
              // fallback to your long connection string if env not set (you may remove this)
              'mongodb+srv://ayo-ecom:CBZoMcMAY4sd0j7Y@cluster0.qyzmvty.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

  try {
    await mongoose.connect(uri, {
      // modern mongoose options
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // In development we exit so it's obvious; in production you may prefer to retry
    process.exit(1);
  }
}

module.exports = connectDB;
