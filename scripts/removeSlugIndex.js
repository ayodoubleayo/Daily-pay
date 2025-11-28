// run this once if you previously created a unique slug index that blocks seeding
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Try drop index on categories collection if it exists
    try {
      const idxs = await db.collection("categories").indexes();
      if (idxs.some(i => i.name === "slug_1")) {
        await db.collection("categories").dropIndex("slug_1");
        console.log("Dropped categories.slug_1 index");
      } else {
        console.log("categories.slug_1 index not found, skipping");
      }
    } catch (e) {
      console.warn("Could not drop categories.slug_1:", e.message || e);
    }

    // Try drop index on products collection if it exists
    try {
      const idxs2 = await db.collection("products").indexes();
      if (idxs2.some(i => i.name === "slug_1")) {
        await db.collection("products").dropIndex("slug_1");
        console.log("Dropped products.slug_1 index");
      } else {
        console.log("products.slug_1 index not found, skipping");
      }
    } catch (e) {
      console.warn("Could not drop products.slug_1:", e.message || e);
    }

    await mongoose.disconnect();
    console.log("Done");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
