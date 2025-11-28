// lib/api.js
export function apiUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
  }
  return `${base.replace(/\/+$/,"")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchJson(path, opts = {}) {
  const url = apiUrl(path);
  const res = await fetch(url, { ...opts });
  if (!res.ok) {
    const text = await res.text().catch(()=>"");
    const err = new Error(`API error ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
