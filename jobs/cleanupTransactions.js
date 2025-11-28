// backend/jobs/cleanupTransactions.js

const Transaction = require("../models/Transaction");

// function to clean completed or terminated after 30 days
async function cleanupTransactions() {
  try {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    const cutoffDate = new Date(Date.now() - THIRTY_DAYS);

    await Transaction.deleteMany({
      $or: [
        { status: "completed" },
        { status: "terminated" }
      ],
      updatedAt: { $lte: cutoffDate }
    });

    console.log("🧹 Old transactions cleaned successfully");
  } catch (err) {
    console.error("Cleanup Job Failed:", err);
  }
}

function startCleanup() {
  console.log("Cleanup job started…");
  cleanupTransactions();
}

module.exports = {
  startCleanup,
  cleanupTransactions
};
