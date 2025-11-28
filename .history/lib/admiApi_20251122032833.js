export async function adminFetch(path, opts = {}) {
const secret = localStorage.getItem('adminSecret');
const headers = { ...(opts.headers || {}), 'x-admin-secret': secret };
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, { ...opts, headers });
return res;
}