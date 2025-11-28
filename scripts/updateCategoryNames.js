// scripts/updateCategoryNames.js
const mongoose = require("mongoose");
const slugify = require("slugify");
require("dotenv").config();

const Category = require("../models/Category");

// OLD → NEW clean grammar mapping
const FIX = {
  "Laptop Repairer Near Me": "Laptop Repair Near Me",
  "Drinks": "Drinks & Beverages",
  "AC Repairer Near Me": "AC Repair Near Me",
  "Pickers Near Me": "Pickup Services",
  "Fish Seller Near Me": "Fish Sellers",
  "Club Near Me": "Clubs Near Me",
  "Hotel Near Me": "Hotels Near Me",
  "Shortlet Near Me": "Shortlet Apartments",
  "Frozen Food": "Frozen Foods",
  "Market": "Local Markets",
  "Hairdresser": "Hairdressers",
  "Amala Spot": "Amala Spots",
  "Pepper Grinder": "Pepper Grinders",
  "Football Pitch": "Football Pitches",
  "Sport Kit": "Sports Kits",
  "Bars": "Bars & Lounges",
  "Pepper Soup Spot": "Pepper Soup Spots",
  "Rent-Replacement": "Rent Replacement",
  "Cyber-cafe": "Cyber Café",
  "Hospitals": "Hospitals & Clinics",
  "Tutorial": "Tutorial Centers",
  "Gym": "Gyms & Fitness",
  "Rental": "Rental Services",
  "Cement": "Cement Suppliers",
  "Paints": "Paint Stores",
  "Swimming Pool": "Swimming Pools",
  "Event Center": "Event Centers",
  "Security Service": "Security Services",
  "Caterer Services": "Catering Services",
  "Oils": "Cooking Oils",
  "Raw Food": "Raw Food Items",
  "Eggs": "Egg Sellers",
  "Medical Scrub": "Medical Scrubs",
  "Car Painter": "Car Painters",
  "Home Tutor": "Home Tutors"
};

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Updating categories...\n");

    const all = await Category.find();

    for (const cat of all) {
      const old = cat.name.trim();

      if (FIX[old]) {
        const newName = FIX[old];
        const newSlug = slugify(newName, { lower: true, strict: true });

        console.log(`Updating: ${old} → ${newName}`);

        await Category.findByIdAndUpdate(
          cat._id,
          { name: newName, slug: newSlug }
        );
      }
    }

    console.log("\n✅ DONE — Category names updated!");
    process.exit();
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

run();
