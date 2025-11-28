// components/UserHistoryTimeline.jsx
"use client";

import { useEffect, useState } from "react";

/**
 * UserHistoryTimeline
 * - Fetches /api/history/user/me with Authorization Bearer token (localStorage "token")
 * - Renders orders in timeline style
 * - Allows refresh and viewing payment proof (if present)
 * - Shows "Call delivery" button when delivery phone is available in order.meta.deliveryPhone
 */

export default function UserHistoryTimeline() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadHistory();
    // optional: poll every 30s to keep UI fresh (remove if you don't want polling)
    const id = setInterval(() => loadHistory(), 30000);
    return () => clearInterval(id);
  }, []);

  async function loadHistory() {
    setLoading(true);
    setErr("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErr("You must be logged in to see your history.");
        setOrders([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Failed to load history");
        setOrders([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("loadHistory error", e);
      setErr("Network error loading history");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function prettyDate(d) {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  // Map order status to a small tint / label
  function statusBadge(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("pending")) return <span className="px-2 py-0.5 rounded text-xs bg-gray-200">Pending</span>;
    if (s.includes("transfer") || s.includes("transferred")) return <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">Transferred</span>;
    if (s.includes("payment_confirmed")) return <span className="px-2 py-0.5 rounded text-xs bg-yellow-300 text-black">Payment confirmed</span>;
    if (s.includes("processing")) return <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">Processing</span>;
    if (s.includes("out")) return <span className="px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-800">Out for delivery</span>;
    if (s.includes("delivered")) return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">Delivered</span>;
    if (s.includes("successful") || s.includes("approved")) return <span className="px-2 py-0.5 rounded text-xs bg-green-200 text-green-800">Successful</span>;
    if (s.includes("failed") || s.includes("cancel")) return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-800">Failed</span>;
    return <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{status}</span>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">My Order History</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="px-3 py-1 border rounded bg-white hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

      {orders.length === 0 && !loading ? (
        <div className="text-sm text-gray-600">No orders yet.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o._id} className="bg-white shadow-sm border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">Order</div>
                  <div className="font-semibold text-lg">{o._id}</div>
                  <div className="text-xs text-gray-500">Placed: {prettyDate(o.createdAt)}</div>
                </div>

                <div className="text-right">
                  <div className="mb-1">{statusBadge(o.status)}</div>
                  <div className="text-sm">Total: ₦{Number(o.total || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Items */}
              <div className="mt-3">
                <div className="font-medium text-sm">Items</div>
                <ul className="list-disc ml-5 text-sm mt-1">
                  {(o.items || []).map((it, i) => (
                    <li key={i}>
                      {it.name || (it.product && it.product.name) || "Item"} × {it.qty || 1} — ₦{Number(it.price || 0).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Meta / Payment Proof */}
              <div className="mt-3 flex flex-col gap-2">
                {o.meta?.paymentProof && (
                  <a
                    href={o.meta.paymentProof}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline text-blue-600"
                  >
                    View payment proof
                  </a>
                )}

                {o.meta?.notes && <div className="text-sm text-gray-600">Note: {o.meta.notes}</div>}

                {/* Delivery phone (optional) */}
                {o.meta?.deliveryPhone && (
                  <div className="flex items-center gap-2">
                    <a href={`tel:${o.meta.deliveryPhone}`} className="px-3 py-1 border rounded text-sm">
                      Call delivery: {o.meta.deliveryPhone}
                    </a>
                    <button
                      onClick={() => {
                        // copy number to clipboard and alert
                        navigator.clipboard?.writeText(o.meta.deliveryPhone);
                        alert("Delivery number copied to clipboard");
                      }}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      Copy
                    </button>
                  </div>
                )}

                {/* Helpful small timeline / messages */}
                <div className="text-xs text-gray-500">
                  Latest status: {o.status} — updated {prettyDate(o.updatedAt || o.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
