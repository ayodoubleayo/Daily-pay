// backend/middleware/admin.js (Production Ready)

/**
 * Middleware to protect admin routes.
 * It strictly checks for a matching secret in the 'x-admin-secret' header 
 * against the ADMIN_SECRET environment variable.
 * * CRITICAL: You MUST set the ADMIN_SECRET environment variable on your server.
 */
module.exports = function (req, res, next) {
  // 1. Get the admin secret from the secure environment variable.
  const adminSecret = (process.env.ADMIN_SECRET || '').toString().trim(); 

  // Check if the environment variable is set.
  if (adminSecret.length === 0) {
    console.error("ADMIN_SECRET environment variable is not set. Admin routes are inaccessible.");
    return res.status(503).json({ error: 'Server configuration error: Admin secret missing.' });
  }

  // 2. Only accept the secret from the 'x-admin-secret' header.
  const header = (req.headers['x-admin-secret'] || '').toString().trim();

  // 3. Compare the provided header value to the environment variable.
  if (header === adminSecret) {
    // Authentication successful
    return next();
  }

  // All other methods (query, body, hardcoded fallbacks) are removed.
  return res.status(401).json({ error: 'Not authorized: Invalid Admin Secret' });
};