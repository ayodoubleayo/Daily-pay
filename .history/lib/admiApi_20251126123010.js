// lib/adminFetch.js
// Small helper for admin-only fetches from client code.
// Usage: await adminFetch('/api/some-admin-route', { method: 'GET' })

export async function adminFetch(path, opts = {}) {
  if (typeof window === "undefined") {
    throw new Error("adminFetch can only be used in the browser");
  }

  const secret = localStorage.getItem("adminSecret");
  if (!secret) {
    throw new Error("Admin secret missing");
  }

  // Merge headers safely and include admin secret
  const headers = { ...(opts.headers || {}), "x-admin-secret": secret };

  // Construct full options and URL
  const fetchOpts = {
    ...opts,
    headers,
  };

  const url = `${process.env.NEXT_PUBLIC_API_URL || ""}${path}`;
  const res = await fetch(url, fetchOpts);
  return res;
}
