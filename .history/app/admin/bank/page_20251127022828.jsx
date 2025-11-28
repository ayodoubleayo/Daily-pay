'use client';
import { useState, useEffect, useCallback, useEffect as useUIEffect } from "react";
import { Banknote, Save, Loader2, Info } from 'lucide-react';

// Assume apiUrl is defined or derived from environment variables, 
// using process.env.NEXT_PUBLIC_API_URL for self-containment.
const apiUrl = (path) => process.env.NEXT_PUBLIC_API_URL + path;

// --- UI Helper Component ---

/**
 * Custom Status Message component for displaying errors/successes
 */
function StatusMessage({ message, type, onClose }) {
  if (!message) return null;
  
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-transform duration-300";
  const typeClasses = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-500';

  // Auto-hide messages after a delay
  useUIEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          &times;
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function AdminBankPage() {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }

  const showAlert = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const resetMessage = useCallback(() => setMessage(null), []);

  // Function to load existing bank details securely
  const loadBankDetails = useCallback(async () => {
    const secret = localStorage.getItem("adminSecret");
    
    if (!secret) {
      showAlert("Admin secret not found. Cannot load details.", 'error');
      return;
    }
    
    try {
      // Securely fetching details using admin secret
      const res = await fetch(apiUrl("/api/bank-details"), {
        headers: { 'x-admin-secret': secret }
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data);
      } else {
        // This endpoint might return 404 if no details are set yet, which is fine.
        console.warn("Failed to load existing bank details securely or none exist.", await res.text());
      }
    } catch (err) {
      console.error("Load bank details error:", err);
    }
  }, [showAlert]);

  // Load existing bank details on mount
  useEffect(() => {
    loadBankDetails();
  }, [loadBankDetails]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function saveBank() {
    setLoading(true);
    resetMessage();

    try {
      const secret = localStorage.getItem("adminSecret");
      
      if (!secret) {
        showAlert("Admin not authorized. Secret missing.", 'error');
        setLoading(false);
        return;
      }

      const res = await fetch(apiUrl("/api/bank-details"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret, // CRITICAL: Ensure admin secret is used for saving
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      showAlert("Bank details saved successfully!", 'success');
    } catch (err) {
      showAlert("Save failed: " + err.message, 'error');
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
          These details serve as the platform's default bank account. They are used for transactions
          when an individual seller has not provided their own banking information.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {/* Bank Name */}
        <input
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
          placeholder="Official Bank Name (e.g., Central Bank)"
          aria-label="Bank Name"
        />

        {/* Account Name */}
        <input
          name="accountName"
          value={form.accountName}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
          placeholder="Account Name (e.g., DAILY-PAY PLATFORM LTD)"
          aria-label="Account Name"
        />

        {/* Account Number */}
        <input
          type="text"
          name="accountNumber"
          value={form.accountNumber}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
          placeholder="Account Number (e.g., 1234567890)"
          aria-label="Account Number"
        />

        {/* Instructions */}
        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm h-32"
          placeholder="Optional instructions for customers making direct transfers (e.g., use order ID as reference)."
          aria-label="Payment Instructions"
        ></textarea>

        {/* Save Button */}
        <button
          onClick={saveBank}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-3 text-white font-semibold rounded-lg transition duration-300 shadow-lg ${
            loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
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

      {/* Custom Status Message */}
      <StatusMessage 
        message={message?.text} 
        type={message?.type} 
        onClose={resetMessage} 
      />
    </div>
  );
}