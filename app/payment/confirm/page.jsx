// frontend/app/payment/confirm/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmPayment() {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState(null);
  const router = useRouter();

  async function uploadFile(file) {
    // For now we assume a simple API that accepts multipart form and returns URL
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    return json.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    let proofUrl = "";
    if (proof) {
      proofUrl = await uploadFile(proof);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/history/${orderId}/proof`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ proofUrl })
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to submit proof");
    alert("Payment proof submitted. Admin will verify.");
    router.push("/user/transaction-history");
  }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Confirm Payment / Upload Proof</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Order ID</label>
          <input value={orderId} onChange={(e)=>setOrderId(e.target.value)} className="w-full border p-2 rounded" required/>
        </div>

        <div>
          <label className="block text-sm">Amount (₦)</label>
          <input value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Upload proof (image)</label>
          <input type="file" onChange={(e)=>setProof(e.target.files[0])}/>
        </div>

        <button className="w-full py-2 bg-blue-600 text-white rounded">Submit Proof</button>
      </form>
    </div>
  );
}
