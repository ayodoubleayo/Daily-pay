'use client';
import { useEffect, useState } from 'react';

export default function ActiveUsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const secret = localStorage.getItem('adminSecret');
    const headers = { 'x-admin-secret': secret };

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_URL + '/api/admin/active-users',
      { headers }
    );

    if (res.ok) setUsers(await res.json());
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Active Users Today</h1>

      <div className="grid gap-3">
        {users.map(u => (
          <div key={u._id} className="p-3 bg-white shadow rounded">
            <p><b>Email:</b> {u.email}</p>
            <p><b>Name:</b> {u.name}</p>
            <p><b>Last Active:</b> {new Date(u.lastActive).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
