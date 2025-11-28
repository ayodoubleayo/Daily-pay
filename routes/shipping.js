const express = require("express");
const router = express.Router();

/**
 * POST /api/shipping/calc
 * Body: { sellerLat, sellerLng, userLat, userLng }
 * Returns: { distanceKm, estimatedMinutes, fare }
 */

function haversineKm(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post("/calc", (req, res) => {
  try {
    const { sellerLat, sellerLng, userLat, userLng } = req.body;
    if (
      sellerLat == null || sellerLng == null ||
      userLat == null || userLng == null
    ) {
      return res.status(400).json({ error: "sellerLat, sellerLng, userLat and userLng are required" });
    }

    const distanceKm = haversineKm(Number(sellerLat), Number(sellerLng), Number(userLat), Number(userLng));
    // estimatedMinutes = approx distance * 2 (or tune)
    const estimatedMinutes = Math.max(1, Math.round(distanceKm * 2));

    let perMinute = 50;
    let fare = Math.round(estimatedMinutes * perMinute);
    fare = Math.max(500, Math.min(5000, fare));

    res.json({
      distanceKm: Number(distanceKm.toFixed(3)),
      estimatedMinutes,
      fare
    });
  } catch (err) {
    console.error("shipping calc error", err);
    res.status(500).json({ error: "Failed to calculate shipping" });
  }
});

module.exports = router;
