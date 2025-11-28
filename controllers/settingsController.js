// backend/controllers/settingsController.js
const Settings = require("../models/Settings");

// Helper to ensure at least one settings row exists
async function getSettingsDoc() {
  let doc = await Settings.findOne();
  if (!doc) doc = await Settings.create({});
  return doc;
}

exports.getSettings = async (req, res) => {
  try {
    const doc = await getSettingsDoc();
    res.json(doc);
  } catch (err) {
    console.error("getSettings error", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { pickupFee, deliveryFee } = req.body;
    const doc = await getSettingsDoc();

    if (pickupFee !== undefined) doc.pickupFee = Number(pickupFee);
    if (deliveryFee !== undefined) doc.deliveryFee = Number(deliveryFee);

    await doc.save();
    res.json({ ok: true, settings: doc });

  } catch (err) {
    console.error("updateSettings error", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};
