// File: app/seller/transaction-history/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import TransactionCard from "../../../components/TransactionCard";
import StatusMessage from "@/components/StatusMessage";
import useMessage from "@/components/useMessage";

export default function SellerHistory() {
  const [txs, setTxs] = useState([]);
  const { message, isError, showMessage, clearMessage } = useMessage();

  const loadTx = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("sellerToken") ||
        localStorage.getItem("token");

      if (!token) {
        showMessage("No token found. Please login.", true);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/history/seller/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        showMessage("Failed to load transactions.", true);
        return;
      }

      const data = await res.json();
      setTxs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Seller history error:", err);
      showMessage("Network error loading transactions.", true);
    }
  }, [showMessage]);

  useEffect(() => {
    loadTx();
  }, [loadTx]);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Seller Transactions</h1>

      <div className="grid gap-4">
        {txs.length === 0 ? (
          <div>No transactions yet</div>
        ) : (
          txs.map((tx) => <TransactionCard key={tx._id} tx={tx} />)
        )}
      </div>

      <StatusMessage
        message={message}
        type={isError ? "error" : "success"}
        onClose={clearMessage}
      />
    </div>
  );
}
