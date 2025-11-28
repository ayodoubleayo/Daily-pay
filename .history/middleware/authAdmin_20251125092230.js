module.exports = function (req, res, next) {
  const headerSecret = req.headers['x-admin-secret'];

  if (!headerSecret)
    return res.status(401).json({ error: "Unauthorized (no admin secret)" });

  if (headerSecret !== process.env.ADMIN_SECRET)
    return res.status(403).json({ error: "Invalid admin secret" });

  return next();
};
