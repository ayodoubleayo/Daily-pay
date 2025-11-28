// lib/api.js
export function apiUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
  }
  // ensure no duplicate slashes
  const baseClean = base.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${baseClean}${suffix}`;
}

export async function fetchJson(path, opts = {}) {
  const url = apiUrl(path);
  // opts is already an object acceptable by fetch
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`API error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
