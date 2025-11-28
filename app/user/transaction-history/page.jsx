// frontend/app/user/transaction-history/page.jsx
"use client";
import { useEffect, useState } from "react";
import TransactionCard from "../../../components/TransactionCard";

export default function UserHistoryPage() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const j = await res.json();
      setTxs(j);
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">My Transactions</h1>
      <div className="grid gap-4">
        {txs.length === 0 ? <div>No transactions yet</div> : txs.map(tx => <TransactionCard key={tx._id} tx={tx} />)}
      </div>
    </div>
  );
}
