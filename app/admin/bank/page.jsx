'use client';

import { useEffect, useState, useCallback } from "react";
import { Banknote, Save, Loader2, Info } from 'lucide-react';

import useMessage from "@/components/useMessage";
import StatusMessage from "@/components/StatusMessage";

// Helper to generate API URL
const apiUrl = (path) => process.env.NEXT_PUBLIC_API_URL + path;

export default function AdminBankPage() {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);

  // ⬇️ unified message system
  const { message, isError, showMessage, clearMessage } = useMessage();

  // Load existing bank details
  const loadBankDetails = useCallback(async () => {
    const secret = localStorage.getItem("adminSecret");

    if (!secret) {
      showMessage("Admin secret not found. Cannot load details.", true);
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/bank-details"), {
        headers: { "x-admin-secret": secret },
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data);
      } else {
        console.warn(
          "Failed to load bank details or none exist.",
          await res.text()
        );
      }
    } catch (err) {
      console.error("Load bank details error:", err);
    }
  }, [showMessage]);

  useEffect(() => {
    loadBankDetails();
  }, [loadBankDetails]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveBank() {
    setLoading(true);
    clearMessage();

    try {
      const secret = localStorage.getItem("adminSecret");

      if (!secret) {
        showMessage("Admin not authorized. Secret missing.", true);
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
        const errorData = await res.json();
        throw new Error(errorData.error || "Unknown error");
      }

      showMessage("Bank details saved successfully!", false);
    } catch (err) {
      showMessage("Save failed: " + err.message, true);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-4 text-gray-800 flex items-center border-b pb-2">
        <Banknote className="w-6 h-6 mr-3 text-red-600" />
        Admin — Bank Settings
      </h1>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg flex items-start text-sm">
        <Info className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
        <p>
          These details serve as the platform's default bank account. They are
          used for transactions when a seller has not added their own bank
          information.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <input
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
          placeholder="Official Bank Name"
        />

        <input
          name="accountName"
          value={form.accountName}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
          placeholder="Account Name"
        />

        <input
          type="text"
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
          placeholder="Account Number"
        />

        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm h-32"
          placeholder="Payment Instructions"
        ></textarea>

        <button
          onClick={saveBank}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-3 text-white font-semibold rounded-lg transition duration-300 shadow-lg ${
            loading
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Bank Details
            </>
          )}
        </button>
      </div>

      {/* Updated Status Message */}
      <StatusMessage
        message={message}
        type={isError ? "error" : "success"}
        onClose={clearMessage}
      />
    </div>
  );
}
