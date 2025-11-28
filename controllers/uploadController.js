const Upload = require("../models/Upload");
const path = require("path");
const fs = require("fs");

// Handle upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Save file info in the database
    const uploadDoc = await Upload.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user ? req.user._id : null
    });

    res.json({
      success: true,
      url: uploadDoc.url,
      fileId: uploadDoc._id
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};
