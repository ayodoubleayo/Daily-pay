// backend/routes/suggestions.js
const express = require("express");
const router = express.Router();

const { sendSuggestion } = require("../controllers/suggestionsController");

router.post("/", sendSuggestion);

module.exports = router;
