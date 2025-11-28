"use client";

import { useState, useEffect } from "react";
import { fetchJson, apiUrl } from "@/lib/api";

export default function AdminBankPage() {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Load existing bank details
  useEffect(() => {
    fetchJson("/api/bank-details")
      .then((data) => setForm(data))
      .catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveBank() {
    setLoading(true);
    setMsg("");

    try {
      // ⭐ FIX: REMOVE TOKEN. USE ADMIN SECRET INSTEAD
      const secret = localStorage.getItem("adminSecret");
      if (!secret) {
        setMsg("Admin not logged in.");
        setLoading(false);
        return;
      }

      const res = await fetch(apiUrl("/api/bank-details"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      setMsg("Bank details saved successfully!");
    } catch (err) {
      setMsg("Save failed: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold">Admin — Bank Settings</h1>
      <p className="mt-2 text-gray-600">
        Edit the platform bank details here. These are used as fallback when a seller has no bank info.
      </p>

      <div className="mt-6 space-y-4">
        <input
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Bank Name"
        />

        <input
          name="accountName"
          value={form.accountName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Account Name"
        />

        <input
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Account Number"
        />

        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Optional instructions"
        ></textarea>

        <button
          onClick={saveBank}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Saving..." : "Save Bank Details"}
        </button>

        {msg && <p className="mt-3 text-red-500">{msg}</p>}
      </div>
    </div>
  );
}
