// File: app/seller/bank-info/page.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../../../lib/api";
import { useRouter } from "next/navigation";
import useMessage from "@/components/useMessage";
import StatusMessage from "@/components/StatusMessage";

export default function SellerBankInfoPage() {
  const router = useRouter();
  const { message, isError, showMessage, clearMessage } = useMessage();

  const [bank, setBank] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "",
  });

  // ----------------------------------------------------
  // LOAD EXISTING BANK INFO
  // ----------------------------------------------------
  const loadBank = useCallback(async () => {
    const token = localStorage.getItem("sellerToken");
    if (!token) return;

    try {
      const res = await fetch(apiUrl("/api/sellers/me/bank-info"), {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data) {
        setBank({
          bankName: data.bankName || "",
          accountName: data.accountName || "",
          accountNumber: data.accountNumber || "",
          instructions: data.instructions || "",
        });
      }
    } catch (err) {
      console.error("loadBank error", err);
      showMessage("Error loading bank info", true);
    }
  }, [showMessage]);

  useEffect(() => {
    loadBank();
  }, [loadBank]);

  // ----------------------------------------------------
  // SAVE BANK INFO (PUT)
  // ----------------------------------------------------
  const saveBank = async (e) => {
    e.preventDefault();
    showMessage("Saving...");

    const token = localStorage.getItem("sellerToken");
    if (!token) {
      showMessage("No token. Please login.", true);
      return;
    }

    try {
      const res = await fetch(apiUrl("/api/sellers/me/bank-info"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(bank),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.error || "Error saving bank info", true);
        return;
      }

      // Update local storage copy
      const seller = JSON.parse(localStorage.getItem("seller")) || {};
      seller.bankInfo = bank;
      localStorage.setItem("seller", JSON.stringify(seller));

      showMessage("Bank info updated!");

      setTimeout(() => router.push("/seller/dashboard"), 1200);
    } catch (err) {
      console.error("saveBank error", err);
      showMessage("Network error saving bank info", true);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Bank Information</h1>

      <form onSubmit={saveBank} className="space-y-3">
        <input
          value={bank.bankName}
          onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
          placeholder="Bank Name"
          className="input"
        />

        <input
          value={bank.accountName}
          onChange={(e) => setBank({ ...bank, accountName: e.target.value })}
          placeholder="Account Name"
          className="input"
        />

        <input
          value={bank.accountNumber}
          onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })}
          placeholder="Account Number"
          className="input"
        />

        <textarea
          value={bank.instructions}
          onChange={(e) =>
            setBank({ ...bank, instructions: e.target.value })
          }
          placeholder="Payment Instructions (optional)"
          className="input"
        />

        <button className="btn">Save Bank Info</button>
      </form>

      <StatusMessage
        message={message}
        type={isError ? "error" : "success"}
        onClose={clearMessage}
      />
    </div>
  );
}
