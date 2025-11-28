'use client';
import { useEffect, useState } from 'react';

export default function ActiveSellersPage() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    const secret = localStorage.getItem('adminSecret');
    const headers = { 'x-admin-secret': secret };

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/api/admin/active-sellers',
      { headers }
    );

    if (res.ok) setSellers(await res.json());
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Active Sellers Today</h1>

      <div className="grid gap-3">
        {sellers.map(s => (
          <div key={s._id} className="p-3 bg-white shadow rounded">
            <p><b>Name:</b> {s.name}</p>
            <p><b>Email:</b> {s.email}</p>
            <p><b>Last Active:</b> {new Date(s.lastActive).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
