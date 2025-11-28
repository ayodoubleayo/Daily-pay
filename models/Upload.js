const mongoose = require("mongoose");

const UploadSchema = new mongoose.Schema(
  {
    originalName: { type: String },
    filename: { type: String },
    url: { type: String, required: true },
    size: { type: Number },
    mimeType: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Upload", UploadSchema);
