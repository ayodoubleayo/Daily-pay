// backend/controllers/shippingController.js
const toRad = (deg) => (deg * Math.PI) / 180;

// Haversine — distance in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.calcShipping = async (req, res) => {
  try {
    // expects { sellerLat, sellerLng, userLat, userLng }
    const { sellerLat, sellerLng, userLat, userLng } = req.body;
    if (sellerLat == null || sellerLng == null || userLat == null || userLng == null) {
      return res.status(400).json({ error: "sellerLat, sellerLng, userLat and userLng are required" });
    }

    const distanceKm = haversineKm(Number(sellerLat), Number(sellerLng), Number(userLat), Number(userLng));
    // estimate minutes: assume average 30 km/h -> minutes = distanceKm / 30 * 60 = distanceKm * 2
    // you can tune speed if needed
    const estimatedMinutes = Math.max(1, Math.round(distanceKm * 2));

    // business rule: ₦50 per minute, min 500, max 5000
    const perMinute = 50;
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
};
