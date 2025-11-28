// backend/routes/settings.js
const express = require("express");
const router = express.Router();
const authAdmin = require("../middleware/authAdmin");
const settingsCtrl = require("../controllers/settingsController");

// Public: read admin fees (used by checkout)
router.get("/public", settingsCtrl.getSettings);

// Admin: get current fees
router.get("/", authAdmin, settingsCtrl.getSettings);

// Admin: update pickup + delivery fees
router.put("/", authAdmin, settingsCtrl.updateSettings);

module.exports = router; // ✔ CORRECT
