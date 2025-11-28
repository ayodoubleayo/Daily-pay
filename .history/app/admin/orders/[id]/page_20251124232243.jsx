"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { useAuth } from "../../../../context/AuthContext";

export default function UserOrderTrackingPage() {
  const { id: orderId } = useParams();
  const { token, authLoading } = useAuth(); // ⬅ NOW WE HAVE authLoading
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyCancel, setBusyCancel] = useState(false);
  const pollRef = useRef(null);

  // fetch order ONLY when token is ready
  async function fetchOrder() {
    if (!orderId || !token || authLoading) return; // ⬅ DO NOT FETCH UNTIL TOKEN READY

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ALWAYS LOADED NOW
          },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          setOrder(null);
          setLoading(false);
          return;
        }
        const txt = await res.text().catch(() => "");
        console.error("fetch order failed", res.status, txt);
        setOrder(null);
        setLoading(false);
        return;
      }

      const j = await res.json();
      setOrder(j.order || null);
    } catch (err) {
      console.error("fetchOrder error", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  // Wait for token + authLoading to finish
  useEffect(() => {
    if (!orderId || !token || authLoading) return; // ⬅ MUST WAIT
    fetchOrder();

    pollRef.current = setInterval(fetchOrder, 3000);
    return () => clearInterval(pollRef.current);
  }, [orderId, token, authLoading]); // ⬅ authLoading added

  async function cancelOrder(orderIdToCancel) {
    if (!token || authLoading) return;

    const ok = confirm(
      "Cancel delivery?\n\nIf the rider has already picked up your package you may be charged and the rider receives compensation.\n\nContinue?"
    );
    if (!ok) return;

    setBusyCancel(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderIdToCancel}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: "User cancelled via app" }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Cancel failed");
        return;
      }

      alert(
        `Order cancelled. Rider compensation: ₦${(
          data.riderCompensation || 0
        ).toLocaleString()}.`
      );
      fetchOrder();
    } catch (err) {
      console.error("cancel error", err);
      alert("Cancel failed");
    } finally {
      setBusyCancel(false);
    }
  }

  // ⬅ STOP rendering until token load finishes
  if (authLoading) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center text-gray-600">Checking login…</div>
      </ProtectedRoute>
    );
  }

  if (!token) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center text-gray-600">Checking login…</div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center text-gray-600">Loading order…</div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center text-red-600">Order not found</div>
      </ProtectedRoute>
    );
  }

  const progress = order?.riderProgress?.percent ?? 0;
  const shippingStatus = order.shippingStatus || "not_assigned";

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Order Tracking</h1>

        {/* Order Card */}
        <div className="border rounded p-4 mb-4 bg-white">
          <div className="mb-3">
            <strong>Order ID:</strong> {order._id}
          </div>
          <div className="mb-1">
            <strong>Status:</strong> {order.status}
          </div>
          <div className="mb-1">
            <strong>Shipping method:</strong>{" "}
            {order.shipping?.method || "pickup"}
          </div>
          <div className="mb-1">
            <strong>Shipping Fee:</strong>{" "}
            ₦{(order.shipping?.fee || 0).toLocaleString()}
          </div>
          <div className="mb-1">
            <strong>Shipping Status:</strong> {shippingStatus}
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
              <div
                className="h-3 bg-green-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Progress: {progress}%
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {shippingStatus !== "cancelled_with_fee" &&
          shippingStatus !== "cancelled_no_fee" &&
          !["failed", "successful", "delivered"].includes(order.status) && (
            <button
              onClick={() => cancelOrder(order._id)}
              disabled={busyCancel}
              className="px-4 py-2 bg-red-600 text-white rounded shadow mb-4"
            >
              {busyCancel ? "Cancelling…" : "Cancel Delivery"}
            </button>
          )}

        <a
          href="/products"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Continue shopping
        </a>
      </div>
    </ProtectedRoute>
  );
}
