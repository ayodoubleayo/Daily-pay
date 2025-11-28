const express = require("express");
const router = express.Router();
const bankCtrl = require("../controllers/bankDetailsController");
const isAdmin = require("../middleware/authAdmin");

// public
router.get("/", bankCtrl.getBankDetails);

// admin only (NO seller auth)
router.post("/", isAdmin, bankCtrl.setBankDetails);

module.exports = router;
