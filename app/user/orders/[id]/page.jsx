"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ViewOrderPage() {
  const router = useRouter();
  const params = useParams();   // <-- NEW WAY IN NEXT.JS 15
  const id = params.id;         // <-- this is now safe

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          if (res.status === 404) {
            setError("Order not found");
          } else {
            setError("Failed to load order");
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setOrder(data.order);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError("Error loading order");
        setLoading(false);
      }
    };

    if (id) loadOrder();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading order...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-3">Order ID: {order._id}</h1>

      <p className="mb-2">Status: {order.status}</p>
      <p className="mb-2">Shipping: {order.shipping.method}</p>
      <p className="mb-2">Shipping Fee: ₦{order.shipping.fee}</p>
      <p className="mb-2">Total: ₦{order.total}</p>

      <h2 className="text-lg font-semibold mt-4 mb-2">Items</h2>

      <ul className="space-y-2">
        {order.items.map((it, i) => (
          <li key={i} className="border p-2 rounded">
            <p>Qty: {it.qty}</p>
            <p>Price: ₦{it.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
