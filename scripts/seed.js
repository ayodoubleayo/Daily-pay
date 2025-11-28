require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Seller = require("../models/Seller");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function main() {
  await connectDB();
  console.log("Seeding data...");
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Seller.deleteMany({});

  // Use create so pre('save') runs and slugs are generated
  const categories = await Promise.all([
    Category.create({ name: "Electronics" }),
    Category.create({ name: "Home Appliances" }),
    Category.create({ name: "Men Fashion" }),
    Category.create({ name: "Women Fashion" }),
    Category.create({ name: "Phones & Tablets" }),
  ]);

  const s = await Seller.create({ name: "Yisa Store", email: "seller@yisa.com", phone: "08012345678" });

  await Product.create([
    {
      name: "Wireless Headphones",
      description: "Good headphones",
      price: 25000,
      image: "https://via.placeholder.com/600x400",
      category: categories[0]._id,
      seller: s._id,
      location: { lat: 6.5244, lng: 3.3792 }
    },
    {
      name: "Smart Watch",
      description: "Nice watch",
      price: 18000,
      image: "https://via.placeholder.com/600x400",
      category: categories[0]._id,
      seller: s._id,
      location: { lat: 6.5244, lng: 3.3792 }
    },
    {
      name: "USB-C Charger",
      description: "Fast charger",
      price: 4000,
      image: "https://via.placeholder.com/600x400",
      category: categories[4]._id,
      seller: s._id,
      location: { lat: 6.5244, lng: 3.3792 }
    }
  ]);

  console.log("Seed finished.");
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
