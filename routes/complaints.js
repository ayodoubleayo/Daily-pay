const express = require("express");
const router = express.Router();

const { sendComplaint } = require("../controllers/complaintsController");

router.post("/", sendComplaint);

module.exports = router;  // <-- VERY IMPORTANT
