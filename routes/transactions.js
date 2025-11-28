const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authSeller = require("../middleware/authSeller");
const authAdmin = require("../middleware/authAdmin");
const transactionsCtrl = require("../controllers/transactionsController");

// Admin: get all transactions
router.get("/all", authAdmin, transactionsCtrl.getAllTransactions);

// User: get my transactions
router.get("/user/me", auth, transactionsCtrl.getUserTransactions);

// Seller: get my transactions
router.get("/seller/me", authSeller, transactionsCtrl.getSellerTransactions);

// User uploads proof for a specific transaction id
router.post("/:id/proof", auth, transactionsCtrl.uploadProof);

// Admin actions
router.post("/:id/admin-approve", authAdmin, transactionsCtrl.adminApprove);
router.post("/:id/admin-success", authAdmin, transactionsCtrl.adminMarkSuccessful);

// Confirm by party (role in body)
router.post("/:id/confirm", auth, transactionsCtrl.confirmByParty);

// (Optional) allow creation via API (if needed)
router.post("/create", auth, transactionsCtrl.createTransaction);

module.exports = router;
