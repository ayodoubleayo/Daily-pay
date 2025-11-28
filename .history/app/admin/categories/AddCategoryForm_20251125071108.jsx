// app/admin/categories/AddCategoryForm.jsx
"use client";
import { useState } from "react";

export default function AddCategoryForm({ onAdded }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!name.trim()) return setMsg("Name is required");

    const adminSecret = typeof window !== "undefined" ? localStorage.getItem("adminSecret") : null;
    if (!adminSecret) return setMsg("Admin secret missing. Please login to admin.");

    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ name: name.trim(), image: image.trim() || undefined }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || `Create failed (status ${res.status})`);
        return;
      }

      setName("");
      setImage("");
      setMsg("Category added");
      if (onAdded) onAdded(data);
    } catch (err) {
      console.error("create category error", err);
      setMsg("Network error creating category");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="text-lg font-semibold">Add Category</h3>

      <div>
        <label className="text-sm block mb-1">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Electronics"
          className="input"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Image filename (optional)</label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="e.g. electronics.jpg"
          className="input"
        />
      </div>

      <div className="flex items-center gap-3">
        <button disabled={busy} className="btn">
          {busy ? "Adding…" : "Add Category"}
        </button>

        {msg && <div className="text-sm text-gray-600">{msg}</div>}
      </div>
    </form>
  );
}
