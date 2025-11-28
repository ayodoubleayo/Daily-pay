// frontend: app/admin/settings/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [fees, setFees] = useState({ pickupFee: 0, deliveryFee: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFees();
  }, []);

  async function loadFees() {
    const secret = localStorage.getItem('adminSecret');
    if (!secret) return;
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/settings', { headers: { 'x-admin-secret': secret } });
    if (!res.ok) return;
    const data = await res.json();
    setFees({ pickupFee: data.pickupFee || 0, deliveryFee: data.deliveryFee || 0 });
  }

  async function saveFees() {
    const secret = localStorage.getItem('adminSecret');
    if (!secret) return alert('No admin secret');

    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ pickupFee: Number(fees.pickupFee || 0), deliveryFee: Number(fees.deliveryFee || 0) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      alert('Fees updated');
      setFees({ pickupFee: data.settings.pickupFee, deliveryFee: data.settings.deliveryFee });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin: Shipping Fees</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm">Pickup Fee (₦)</label>
          <input type="number" value={fees.pickupFee} onChange={e => setFees({...fees, pickupFee: e.target.value})} className="w-full mt-1 border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm">Delivery Fee (₦)</label>
          <input type="number" value={fees.deliveryFee} onChange={e => setFees({...fees, deliveryFee: e.target.value})} className="w-full mt-1 border rounded p-2" />
        </div>

        <div className="flex gap-2">
          <button onClick={saveFees} className="px-4 py-2 bg-green-600 text-white rounded" disabled={loading}>
            {loading ? 'Saving...' : 'Save Fees'}
          </button>
          <button onClick={loadFees} className="px-4 py-2 border rounded">Reload</button>
        </div>
      </div>
    </div>
  );
}
