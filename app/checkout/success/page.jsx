"use client";

import ProtectedRoute from "../../../components/ProtectedRoute";
import { useSearchParams } from "next/navigation";

export default function Success() {
  const search = useSearchParams();
  const orderId = search.get("order");

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Order received</h1>
        <p className="mb-6">Thanks! Your order has been placed. We'll send updates to your phone.</p>

        {orderId ? (
  <a href={`/user/orders/${orderId}`} className="inline-block px-4 py-2 bg-green-600 text-white rounded mb-4">
  Track delivery
</a>

        ) : null}

        <div>
          <a href="/products" className="px-4 py-2 bg-blue-600 text-white rounded">Continue shopping</a>
        </div>
      </div>
    </ProtectedRoute>
  );
}
