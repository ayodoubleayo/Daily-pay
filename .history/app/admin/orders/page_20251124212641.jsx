'use client';
import { useEffect, useState } from 'react';
import { apiUrl } from '../../../lib/api'; // adjust path if needed

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState({}); // { [orderId]: boolean }
  const [selectedRider, setSelectedRider] = useState({}); // { [orderId]: riderId }

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    await Promise.all([loadOrders(), loadRiders()]);
  }

  async function loadOrders() {
    try {
      const secret = localStorage.getItem('adminSecret');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/orders', { headers: { 'x-admin-secret': secret }});
      if (!res.ok) {
        console.warn('Could not load orders', res.status);
        setOrders([]);
        return;
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : (data.orders || []));
    } catch (err) {
      console.error('loadOrders error', err);
      setOrders([]);
    }
  }

  async function loadRiders() {
    try {
      const secret = localStorage.getItem('adminSecret');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/riders', { headers: { 'x-admin-secret': secret }});
      if (!res.ok) {
        console.warn('Could not load riders', res.status);
        setRiders([]);
        return;
      }
      const data = await res.json();
      setRiders(Array.isArray(data) ? data : (data.riders || []));
    } catch (err) {
      console.error('loadRiders error', err);
      setRiders([]);
    }
  }

  async function markTransferred(id) {
    try {
      setLoading(true);
      const secret = localStorage.getItem('adminSecret');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/mark-transferred`, {
        method: 'POST',
        headers: { 'x-admin-secret': secret }
      });
      await loadOrders();
    } catch (err) {
      console.error('markTransferred', err);
    } finally {
      setLoading(false);
    }
  }

  async function assignRider(orderId) {
    const riderId = selectedRider[orderId];
    if (!riderId) return alert('Select a rider first');
    setAssigning(prev => ({ ...prev, [orderId]: true }));
    try {
      const secret = localStorage.getItem('adminSecret');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/assign-rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ riderId })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Assign failed');
      }
      await loadAll();
      alert('Rider assigned');
    } catch (err) {
      console.error('assignRider', err);
      alert(err.message || 'Could not assign rider');
    } finally {
      setAssigning(prev => ({ ...prev, [orderId]: false }));
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Orders (Admin)</h1>
      <div className="grid gap-3">
        {orders.map(o => (
          <div key={o._id} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="font-semibold">Order {o._id}</div>
                <div className="text-sm">Total: ₦{Number(o.total).toLocaleString()}</div>
                <div className="text-sm">Status: {o.status}</div>
                {o.rider?.name && (
                  <div className="text-sm mt-1">
                    <strong>Rider:</strong> {o.rider.name} — {o.rider.phone}
                  </div>
                )}

                {/* Shipping summary */}
                {o.meta?.shipping && (
                  <div className="mt-2 text-sm">
                    <div><strong>Shipping:</strong> {o.meta.shipping.method || 'pickup'}</div>
                    <div>Fee: ₦{Number(o.meta.shipping.fee || 0).toLocaleString()}</div>
                    {o.meta.shipping.details && (
                      <div className="mt-1 text-xs text-gray-600">
                        <div>{o.meta.shipping.details.name}</div>
                        <div>{o.meta.shipping.details.phone}</div>
                        <div>{o.meta.shipping.details.address}, {o.meta.shipping.details.city}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div>
                  <select
                    value={selectedRider[o._id] || ''}
                    onChange={(e) => setSelectedRider(prev => ({ ...prev, [o._id]: e.target.value }))}
                    className="border rounded px-2 py-1 mr-2"
                  >
                    <option value="">Assign rider...</option>
                    {riders.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.name} {r.status === 'busy' ? '(busy)' : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => assignRider(o._id)}
                    className="px-3 py-1 border rounded"
                    disabled={assigning[o._id]}
                  >
                    {assigning[o._id] ? 'Assigning…' : 'Assign'}
                  </button>
                </div>

                <div>
                  <button onClick={() => markTransferred(o._id)} className="px-3 py-1 border rounded mr-2">Mark transferred</button>
                </div>

                <div className="text-sm mt-2">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && <div className="text-center p-6 bg-white rounded shadow">No orders found</div>}
      </div>
    </div>
  );
}
