// app/admin/all-users/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/users');
      if (!res.ok) {
        setUsers([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('loadUsers error', err);
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
    adminCall(path, method, body).then(() => loadUsers());
  }

  function warnUser(id) {
    const confirmMsg = 'Add a warning to this user?';
    if (!confirm(confirmMsg)) return;
    confirmThen(`/api/admin/users/${id}/warn`, 'PUT', null, null);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>

      {loading && <div>Loading users…</div>}

      <div className="grid gap-3">
        {users.map(u => (
          <div key={u._id} className="p-3 bg-white shadow rounded flex justify-between items-center">
            <div>
              <p><b>Email:</b> {u.email}</p>
              <p><b>Name:</b> {u.name}</p>
              <p className="text-sm">
                Status:
                {u.banned ? <span className="text-red-600 ml-2">BANNED</span> : u.suspended ? <span className="text-yellow-600 ml-2">SUSPENDED</span> : <span className="text-green-600 ml-2">ACTIVE</span>}
              </p>
              <p className="text-xs text-gray-500">Warnings: {u.warnings || 0}</p>
            </div>

            <div className="flex gap-2">
              {!u.banned && !u.suspended && (
                <button onClick={() => confirmThen(`/api/admin/users/${u._id}/suspend`, 'PUT', null, 'Suspend this user?')} className="bg-yellow-500 px-3 py-1 text-white rounded">Suspend</button>
              )}

              {!u.banned && u.suspended && (
                <button onClick={() => confirmThen(`/api/admin/users/${u._id}/reactivate`, 'PUT', null, 'Unsuspend this user?')} className="bg-green-600 px-3 py-1 text-white rounded">Unsuspend</button>
              )}

              {!u.banned && (
                <button onClick={() => confirmThen(`/api/admin/users/${u._id}/ban`, 'PUT', null, 'Permanently ban this user?')} className="bg-red-700 px-3 py-1 text-white rounded">Ban</button>
              )}

              {u.banned && (
                <button onClick={() => confirmThen(`/api/admin/users/${u._id}/unban`, 'PUT', null, 'Unban this user?')} className="bg-blue-600 px-3 py-1 text-white rounded">Unban</button>
              )}

              <button onClick={() => warnUser(u._id)} className="bg-indigo-600 px-3 py-1 text-white rounded">Warn</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
