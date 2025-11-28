// File: app/admin/page.jsx
'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    activeSellers: 0,
    pendingSellers: 0
  });

  useEffect(() => {
    const secret = localStorage.getItem("adminSecret");
    if (!secret) window.location.href = "/admin/login";
    loadStats();
  }, []);

  async function loadStats() {
    const secret = localStorage.getItem('adminSecret');
    const headers = { 'x-admin-secret': secret };

   
    const base = process.env.NEXT_PUBLIC_API_URL;

const au = await fetch(base + '/admin/active-users', { headers });
const as = await fetch(base + '/admin/active-sellers', { headers });
const ps = await fetch(base + '/sellers?approved=false');

    const auData = au.ok ? await au.json() : [];
    const asData = as.ok ? await as.json() : [];
    const psData = ps.ok ? await ps.json() : [];

    setStats({
      activeUsers: auData.length,
      activeSellers: asData.length,
      pendingSellers: psData.length
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Active Users Today</h3>
          <p className="text-3xl font-bold mt-2">{stats.activeUsers}</p>
        </div>

        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Active Sellers Today</h3>
          <p className="text-3xl font-bold mt-2">{stats.activeSellers}</p>
        </div>

        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Pending Sellers</h3>
          <p className="text-3xl font-bold mt-2">{stats.pendingSellers}</p>
        </div>
      </div>

      {/* ADMIN NAVIGATION */}
      <div className="grid gap-4">
        <a href="/admin/active-users" className="p-4 bg-blue-600 text-white rounded block text-center">Active Users</a>
        <a href="/admin/active-sellers" className="p-4 bg-green-600 text-white rounded block text-center">Active Sellers</a>
        <a href="/admin/all-sellers" className="p-4 bg-purple-600 text-white rounded block text-center">All Sellers</a>
        <a href="/admin/pending-sellers" className="p-4 bg-yellow-600 text-white rounded block text-center">Pending Sellers</a>
      </div>
    </div>
  );
}
