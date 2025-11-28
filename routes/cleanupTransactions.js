cleanupTransactions.js
// backend/jobs/cleanupTransactions.js
// run using node-cron or manually with a scheduled process
const cron = require("node-cron");
const Transaction = require("../models/Transaction");

function startCleanup() {
  // run once a day at 03:00
  cron.schedule("0 3 * * *", async () => {
    try {
      const now = new Date();
      const removed = await Transaction.deleteMany({
        deleteAfter: { $lte: now },
        userConfirmed: true,
        sellerConfirmed: true
      });
      console.log("CleanupTransactions removed:", removed.deletedCount);
    } catch (err) {
      console.error("cleanup error", err);
    }
  });
}

module.exports = { startCleanup };
