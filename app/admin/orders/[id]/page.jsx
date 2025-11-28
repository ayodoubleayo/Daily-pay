"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderTrackingPage() {
  const { id: orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const token = localStorage.getItem("token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("fetch order error", err);
        setLoading(false);
      });
  }, [orderId]);

  async function cancelOrder(orderId) {
    const ok = confirm(
      "Cancel delivery?\n\nIf the rider has already picked up your package you may be charged and the rider receives compensation.\n\nContinue?"
    );
    if (!ok) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason: "User cancelled via app" }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Cancel failed");
    alert(`Order cancelled. Rider compensation: ₦${(data.riderCompensation||0).toLocaleString()}.`);
    window.location.reload();
  }

  if (loading) return <p className="p-4 text-center text-gray-500">Loading order…</p>;
  if (!order) return <p className="p-4 text-center text-red-500">Order not found</p>;

  const progress = order?.riderProgress?.percent || 0;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order Tracking</h1>

      <div className="border rounded p-4 mb-4">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Shipping method:</strong> {order.shipping?.method || "pickup"}</p>
        <p><strong>Shipping Fee:</strong> ₦{(order.shipping?.fee || 0).toLocaleString()}</p>
        <p><strong>Shipping Status:</strong> {order.shippingStatus}</p>

        <div className="mt-4 w-full bg-gray-300 h-2 rounded">
          <div className="bg-green-500 h-2 rounded transition-all" style={{ width: `${progress}%` }} />
        </div>

        {order.rider?.name && <p className="mt-3 text-sm text-blue-600">Rider Assigned: {order.rider.name} ({order.rider.phone})</p>}
      </div>

      {(order.shippingStatus !== "cancelled_with_fee" && order.shippingStatus !== "cancelled_no_fee" && !["failed","successful","delivered"].includes(order.status)) && (
        <button onClick={() => cancelOrder(order._id)} className="bg-red-600 text-white px-4 py-2 rounded shadow">Cancel Delivery</button>
      )}
    </div>
  );
}
