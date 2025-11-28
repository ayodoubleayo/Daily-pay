// app/user/orders/page.jsx
'use client';
import { useEffect, useState, useRef } from 'react';
import Link from "next/link"; // ✅ ADDED

export default function UserOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    loadOrders();

    intervalRef.current = setInterval(() => {
      loadOrders(false);
    }, 30000);

    return () => clearInterval(intervalRef.current);
  }, []);

  async function loadOrders(showLoading = true) {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not logged in. Please login to view your orders.');
      return;
    }

    if (showLoading) {
      setLoading(true);
      setError('');
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || 'Failed to load orders');
        setOrders([]);
      } else {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('loadOrders error', err);
      setError('Network error loading orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(d) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  function statusStepIndex(status) {
    const steps = [
      'pending',
      'transferred',
      'payment_confirmed',
      'processing',
      'out for delivery',
      'delivered',
      'approved',
      'successful',
      'failed'
    ];
    const idx = steps.indexOf(status);
    return idx === -1 ? 0 : idx;
  }

  function renderTimeline(order) {
    const timelineSteps = [
      { key: 'pending', label: 'Order received' },
      { key: 'transferred', label: 'Payment transferred' },
      { key: 'payment_confirmed', label: 'Payment confirmed' },
      { key: 'processing', label: 'Processing' },
      { key: 'out for delivery', label: 'Out for delivery' },
      { key: 'delivered', label: 'Delivered' },
      { key: 'failed', label: 'Failed / Cancelled' }
    ];

    const currentIdx = statusStepIndex(order.status);

    return (
      <div className="space-y-3">
        {timelineSteps.map((s, i) => {
          const done = i <= currentIdx && order.status !== 'failed';
          const active = i === currentIdx;
          return (
            <div key={s.key} className="flex items-start gap-3">
              <div className="w-8 flex justify-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${done ? 'bg-green-600 text-white' : active ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  {done ? '✓' : active ? '…' : i + 1}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div className={`font-medium ${done ? 'text-gray-800' : active ? 'text-yellow-800' : 'text-gray-600'}`}>
                    {s.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {s.key === 'pending' && formatDate(order.createdAt)}
                    {s.key === 'transferred' && formatDate(order.meta?.submittedAt || order.meta?.paymentSubmittedAt)}
                    {s.key === 'payment_confirmed' && formatDate(order.meta?.paymentConfirmedAt)}
                    {s.key === 'processing' && formatDate(order.meta?.processingAt)}
                    {s.key === 'out for delivery' && formatDate(order.meta?.outForDeliveryAt)}
                    {s.key === 'delivered' && formatDate(order.meta?.deliveredAt || order.updatedAt)}
                    {s.key === 'failed' && formatDate(order.meta?.failedAt)}
                  </div>
                </div>

                {order.meta?.notes && (
                  <div className="text-sm text-gray-500 mt-1">{order.meta.notes}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>

        <button
          onClick={() => loadOrders(true)}
          className="px-3 py-1 border rounded bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-sm text-gray-500 mb-4">Loading orders...</div>}
      {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {orders.length === 0 && !loading ? (
        <div className="text-gray-600">No orders found.</div>
      ) : (
        <div className="space-y-6">

          {orders.map((o) => (
            <Link
              key={o._id}
              href={`/user/orders/${o._id}`}
              className="block p-4 bg-white rounded shadow hover:bg-gray-50" // ✅ WRAPPED
            >

              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold">Order #{o._id}</div>
                  <div className="text-sm text-gray-500">Placed: {formatDate(o.createdAt)}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm">Total: ₦{Number(o.total || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Status: <span className="font-medium">{o.status}</span></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="font-medium mb-1">Items</div>
                <ul className="list-disc ml-5 text-sm text-gray-700">
                  {(o.items || []).map((it, i) => (
                    <li key={i}>
                      {(it.name || it.product?.name || 'Item')} x {it.qty} — ₦{Number(it.price).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-3">
                <div className="font-medium mb-2">Progress</div>
                {renderTimeline(o)}
              </div>

              {(o.meta?.deliveryPerson?.phone || o.meta?.deliveryPhone) && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="text-sm text-gray-600">Delivery contact:</div>
                  <a
                    href={`tel:${o.meta?.deliveryPerson?.phone || o.meta?.deliveryPhone}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Call delivery person
                  </a>
                </div>
              )}

              {o.meta?.message && (
                <div className="mt-3 text-sm text-gray-700">
                  <strong>Message:</strong> {o.meta.message}
                </div>
              )}

            </Link>
          ))}

        </div>
      )}
    </div>
  );
}
