// backend/scripts/fixCategoryNames.js
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const slugify = require("slugify");

const NEW_NAMES = {
  "ELECTRONICS": "Electronics",
  "PHONES": "Phones",
  "PHONE ACCESSORIES": "Phone Accessories",
  "ELECTRICAL APPLIANCES": "Electrical Appliances",
  "HOME BEDS": "Home Beds",
  "HOME CHAIRS": "Home Chairs",
  "MOTOR SPARE PART": "Motor Spare Parts",
  "MOTORBIKE SPARE PART": "Motorbike Spare Parts",
  "MALE CLOTHES": "Men’s Clothing",
  "FEMALE CLOTHES": "Women’s Clothing",
  "CHILDREN CLOTHES": "Children’s Clothing",
  "FOOTWEAR": "Footwear",
  "ANYTHING USED FOR SALE": "Used Items",
  "YOU NEED PLUMBER": "Plumber Services",
  "YOU NEED ELECTRICIAN": "Electrician",
  "YOU NEED REWIRE": "Rewire Technician",
  "YOU NEED VULCANIZER": "Vulcanizer",
  "YOU NEED URGENT CARRIER": "Carrier Services",
  "YOU NEED URGENT GRASS CUTTER": "Grass Cutting",
  "YOU NEED URGENT DOCTOR": "Doctor",
  "YOU NEED URGENT NURSE": "Nurse",
  "YOU NEED URGENT PHYSIOTHERAPY": "Physiotherapy",
  "YOU NEED URGENT MECHANICS": "Mechanics",
  "YOU NEED HOUSE CLEANER": "House Cleaner",
  "YOU NEED URGENT FURNITURE": "Furniture Services",
  "YOU NEED URGENT CARPENTER": "Carpenter",
  "YOU NEED URGENT TAXI": "Taxi Services",
  "BOOKS": "Books",
  "PHARMACY": "Pharmacy",
  "RESTAURANT": "Restaurant",
  "PEPPER SELLER": "Pepper Seller",
  "FRUIT SELLER": "Fruit Seller",
  "AGRIC PRODUCT": "Agricultural Products"
};

async function run() {
  try {
await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const categories = await Category.find();

    for (const cat of categories) {
      const currentName = cat.name.trim().toUpperCase();

      if (NEW_NAMES[currentName]) {
        const newName = NEW_NAMES[currentName];

        console.log(`Updating "${cat.name}" → "${newName}"`);

        await Category.findByIdAndUpdate(
          cat._id,
          { name: newName }, // ONLY name updated
          { new: true }
        );
      }
    }

    console.log("Category names updated successfully.");
    process.exit();

  } catch (err) {
    console.error("Error fixing names:", err);
    process.exit(1);
  }
}

run();
