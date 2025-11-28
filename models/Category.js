const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
}, { timestamps: true });

// Auto-generate slug before save
CategorySchema.pre("save", function(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Auto-generate slug on findOneAndUpdate
CategorySchema.pre("findOneAndUpdate", function(next) {
  const update = this.getUpdate();
  // Mongoose update objects can be {$set: { name: 'New' }} or direct
  const name = (update && (update.name || (update.$set && update.$set.name)));
  if (name) {
    const newSlug = slugify(name, { lower: true, strict: true });
    if (!update.slug && !(update.$set && update.$set.slug)) {
      if (update.$set) {
        update.$set.slug = newSlug;
      } else {
        update.slug = newSlug;
      }
      this.setUpdate(update);
    }
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
