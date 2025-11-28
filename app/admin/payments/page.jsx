// File: app/admin/payments/page.jsx
"use client";
import { useEffect, useState } from "react";
import TransactionCard from "@/app/admin/payments/TransactionCard";

export default function AdminPayments() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    (async () => {
      const secret = localStorage.getItem("adminSecret");
      if (!secret) return;

      // FIX 1 — remove newline + correct route
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/all`,
        {
          headers: { "x-admin-secret": secret },
        }
      );

      if (!res.ok) return;
      setTxs(await res.json());
    })();
  }, []);

  async function onAction(action, tx) {
    const secret = localStorage.getItem("adminSecret");
    if (!secret) return alert("Not authorized");

    if (action === "approve") {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${tx._id}/admin-approve`,
        {
          method: "POST",
          headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "success") {
      // FIX 2 — fix broken string quote
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${tx._id}/admin-success`,
        {
          method: "POST",
          headers: { "x-admin-secret": secret, "Content-Type": "application/json" },
        }
      );
    }

    // FIX 3 — correct refresh route
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/all`,
      { headers: { "x-admin-secret": secret } }
    );

    setTxs(await r.json());
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Admin — Payments</h1>
      <div className="grid gap-4">
        {txs.map((tx) => (
          <TransactionCard key={tx._id} tx={tx} onAction={onAction} />
        ))}
      </div>
    </div>
  );
}
