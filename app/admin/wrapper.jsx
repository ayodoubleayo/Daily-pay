"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminWrapper({ children }) {
  const [secret, setSecret] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const s = localStorage.getItem("adminSecret");
    if (!s) router.push("/admin/login");
    setSecret(s);
  }, []);

  function logout() {
    localStorage.removeItem("adminSecret");
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

        <Link href="/admin">Dashboard Overview</Link>
        <Link href="/admin/active-users">Active Users</Link>
        <Link href="/admin/active-sellers">Active Sellers</Link>
        <Link href="/admin/pending-sellers">Pending Sellers</Link>
        <Link href="/admin/all-users">All Users</Link>
        <Link href="/admin/all-sellers">All Sellers</Link>
        <Link href="/admin/categories">Categories</Link>
        <Link href="/admin/orders">Orders</Link>
        <Link href="/admin/payments">Payments</Link>
        <Link href="/admin/bank">Platform Bank</Link>

        <button
          onClick={logout}
          className="mt-auto bg-red-600 px-4 py-2 rounded text-white"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <div className="bg-white shadow px-6 py-3 rounded mb-5 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <span className="text-gray-600">Welcome, Super Admin</span>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
