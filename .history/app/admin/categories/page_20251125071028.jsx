// app/admin/categories/page.jsx
"use client";
import { useEffect, useState } from "react";
import AddCategoryForm from "./AddCategoryForm";
import Link from "next/link";

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminSecret, setAdminSecret] = useState(null);

  useEffect(() => {
    // adminSecret stored by your admin login
    setAdminSecret(typeof window !== "undefined" ? localStorage.getItem("adminSecret") : null);
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`);
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        setError(j.error || "Failed to load categories");
        setCats([]);
      } else {
        const data = await res.json();
        setCats(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("load categories error", err);
      setError("Network error");
      setCats([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    const secret = localStorage.getItem("adminSecret");
    if (!secret) return alert("Admin secret missing");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret },
      });
      const j = await res.json().catch(()=>({}));
      if (!res.ok) return alert(j.error || "Delete failed");
      // refresh list
      load();
    } catch (err) {
      console.error("delete category err", err);
      alert("Network error");
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex gap-6">
        <div className="w-2/3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Manage Categories</h1>
            {!adminSecret && <div className="text-sm text-red-600">Admin not signed in</div>}
          </div>

          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cats.map((c) => (
              <div key={c._id} className="card-sm p-2 flex flex-col">
                <div className="h-28 overflow-hidden mb-2">
                  <img src={c.image || "/placeholder.png"} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">/{c.slug}</div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link href={`/admin/categories/edit/${c._id}`} className="px-2 py-1 border rounded text-sm">Edit</Link>
                  <button onClick={() => handleDelete(c._id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/3">
          <AddCategoryForm onAdded={(newCat) => {
            // push to local list to show immediately
            setCats((prev) => [newCat, ...prev]);
          }} />
        </div>
      </div>
    </div>
  );
}
