'use client';
import { useEffect, useState } from 'react';

export default function PendingSellersPage() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/api/sellers?approved=false'
    );
    if (res.ok) setPending(await res.json());
  }

  async function approveSeller(id) {
    const secret = localStorage.getItem('adminSecret');
    const headers = {
      'x-admin-secret': secret,
      'Content-Type': 'application/json'
    };

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + `/api/admin/sellers/${id}/approve`,
      { method: 'PUT', headers }
    );

    if (res.ok) {
      alert("Seller approved!");
      loadPending();
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Pending Sellers</h1>

      <div className="grid gap-3">
        {pending.map(s => (
          <div key={s._id} className="p-3 bg-white shadow rounded flex justify-between items-center">
            <div>
              <p><b>Name:</b> {s.name}</p>
              <p><b>Email:</b> {s.email}</p>
            </div>
            <button
              onClick={() => approveSeller(s._id)}
              className="bg-green-600 text-white px-4 py-2 rounded">
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
