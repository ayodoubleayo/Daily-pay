const express = require("express"); 
const router = express.Router();

// ✅ AUTH MIDDLEWARES
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");  // <-- YOUR FIX ADDED HERE

// CONTROLLERS
const {
  submitProof,
  getUserHistory,
  getAllTransactions,
  adminApprove,
  adminSuccess
} = require("../controllers/historyController");

// USER uploads proof
router.post("/:orderId/proof", auth, submitProof);

// USER sees their own purchase history
router.get("/user/me", auth, getUserHistory);

// ADMIN sees all transactions
router.get("/all", admin, getAllTransactions);

// ADMIN approves payment proof
router.post("/:id/admin-approve", admin, adminApprove);

// ADMIN marks transaction successful
router.post("/:id/admin-success", admin, adminSuccess);

module.exports = router;
