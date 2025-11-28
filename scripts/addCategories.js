// backend/scripts/addCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const list = [
  "Tailor Near Me",
  "Barber Near Me",
  "Photographer Near Me",
  "Laptop Repairer Near Me",
  "Drinks",
  "AC Repairer Near Me",
  "Pickers Near Me",
  "Fish Seller Near Me",
  "Concerts Near Me",
  "Club Near Me",
  "Hotel Near Me",
  "Shortlet Near Me",
  "Frozen Food",
  "Market",
  "Hairdresser",
  "Amala Spot",
  "Pepper Grinder",
  "Supermarkets",
  "Football Pitch",
  "Sport Kit",
  "Bars",
  "Pepper Soup Spot",
  "Rent-Replacement",
  "Cyber-cafe",
  "Hospitals",
  "Tutorial",
  "Gym",
  "Rental",
  "Bricklayers",
  "Cement",
  "Paints",
  "Swimming Pool",
  "Event Center",
  "Security Service",
  "Caterer Services",
  "Tattoo Artists",
  "Welders",
  "Oils",
  "Raw Food",
  "Baby Food",
  "Eggs",
  "Medical Scrub",
  "Hospital Equipment",
  "Printing Press",
  "Car Painter",
  "Home Tutor",
  "Latest Events"
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  for (const name of list) {
    const exists = await Category.findOne({ name: new RegExp(`^${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') });
    if (exists) {
      console.log("Skip (exists):", name);
      continue;
    }
    const c = await Category.create({ name, image: "" });
    console.log("Created:", c.name, c._id);
  }
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
