// app/admin/all-sellers/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function AllSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/admin/active-sellers');
      if (!res.ok) {
        setSellers([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSellers(data);
    } catch (err) {
      console.error('loadSellers error', err);
    } finally {
      setLoading(false);
    }
  }

  async function adminCall(path, method = 'PUT', body = null) {
    const secret = localStorage.getItem('adminSecret');
    if (!secret) return alert('Not authorized');
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret
        },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Action failed');
        return null;
      }
      return data;
    } catch (err) {
      console.error('adminCall error', err);
      alert('Network error');
      return null;
    }
  }

  function confirmThen(path, method, body, confirmMsg) {
    if (confirmMsg) {
      if (!confirm(confirmMsg)) return;
    }
    adminCall(path, method, body).then(() => loadSellers());
  }

  function warnSeller(id) {
    if (!confirm('Add a warning to this seller?')) return;
    confirmThen(`/api/admin/sellers/${id}/warn`, 'PUT', null, null);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Sellers</h1>
{/* SELLER STATS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

  {/* Total Sellers */}
  <div className="p-4 bg-white shadow rounded">
    <p className="text-gray-500 text-sm">Total Sellers</p>
    <p className="text-2xl font-bold">{sellers.length}</p>
  </div>

  {/* Approved Sellers */}
  <div className="p-4 bg-green-100 shadow rounded">
    <p className="text-gray-600 text-sm">Approved</p>
    <p className="text-2xl font-bold">
      {sellers.filter(s => s.approved === true).length}
    </p>
  </div>

  {/* Pending Sellers */}
  <div className="p-4 bg-yellow-100 shadow rounded">
    <p className="text-gray-600 text-sm">Pending</p>
    <p className="text-2xl font-bold">
      {sellers.filter(s => s.approved === false).length}
    </p>
  </div>

  {/* Suspended / Banned Sellers */}
  <div className="p-4 bg-red-100 shadow rounded">
    <p className="text-gray-600 text-sm">Suspended / Banned</p>
    <p className="text-2xl font-bold">
      {sellers.filter(s => s.status === "banned" || s.status === "suspended").length}
    </p>
  </div>

</div>


      {loading && <div>Loading sellers…</div>}

      <div className="grid gap-3">
        {sellers.map(s => (
          <div key={s._id} className="p-3 bg-white shadow rounded flex justify-between items-center">
            <div>
              <p><b>Shop:</b> {s.shopName || s.name}</p>
              <p className="text-sm"><b>Email:</b> {s.email}</p>
              <p className="text-sm">
                Status:
                {s.banned ? <span className="text-red-600 ml-2">BANNED</span> : s.suspended ? <span className="text-yellow-600 ml-2">SUSPENDED</span> : <span className="text-green-600 ml-2">ACTIVE</span>}
              </p>
              <p className="text-xs text-gray-500">Warnings: {s.warnings || 0}</p>
            </div>

            <div className="flex gap-2">
              {!s.banned && !s.suspended && (
                <button onClick={() => confirmThen(`/api/admin/sellers/${s._id}/suspend`, 'PUT', null, 'Suspend this seller?')} className="bg-yellow-500 px-3 py-1 text-white rounded">Suspend</button>
              )}

              {!s.banned && s.suspended && (
                <button onClick={() => confirmThen(`/api/admin/sellers/${s._id}/reactivate`, 'PUT', null, 'Unsuspend this seller?')} className="bg-green-600 px-3 py-1 text-white rounded">Unsuspend</button>
              )}

              {!s.banned && (
                <button onClick={() => confirmThen(`/api/admin/sellers/${s._id}/ban`, 'PUT', null, 'Permanently ban this seller?')} className="bg-red-700 px-3 py-1 text-white rounded">Ban</button>
              )}

              {s.banned && (
                <button onClick={() => confirmThen(`/api/admin/sellers/${s._id}/unban`, 'PUT', null, 'Unban this seller?')} className="bg-blue-600 px-3 py-1 text-white rounded">Unban</button>
              )}

              <button onClick={() => warnSeller(s._id)} className="bg-indigo-600 px-3 py-1 text-white rounded">Warn</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
