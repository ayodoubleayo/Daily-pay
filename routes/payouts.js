// routes/payouts.js
const express = require("express");
const router = express.Router();
const payoutCtrl = require("../controllers/payoutController");
const auth = require("../middleware/auth");      // you already have this
const isAdmin = require("../middleware/authAdmin");  // 

// If you will allow file uploads via multer, we'll accept multipart; upload middleware will be applied in server or route if set up.
router.post("/", auth, payoutCtrl.savePayoutInfo);
router.get("/me", auth, payoutCtrl.getMyPayoutInfo);
router.post("/:id/verify", auth, isAdmin, payoutCtrl.adminVerify);

module.exports = router;
