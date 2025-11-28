

"use client";
import React from "react";


export default function TransactionCard({ tx, onAction }) {
return (
<div className="bg-white rounded shadow p-4">
<div className="flex justify-between">
<div>
<div className="font-semibold">
  Order: {tx.orderId?._id || "N/A"}
</div>
<div className="text-sm text-gray-600">Status: {tx.status}</div>
<div className="text-sm">Total: ₦{Number(tx.totalAmount).toLocaleString()}</div>
<div className="text-sm">Service: ₦{Number(tx.serviceChargeAmount).toLocaleString()}</div>
<div className="text-sm">To seller: ₦{Number(tx.amountToSeller).toLocaleString()}</div>
</div>
<div className="text-right">
<div className="text-sm">{new Date(tx.createdAt).toLocaleString()}</div>
</div>
</div>


<div className="mt-3">
<div className="font-medium">Items</div>
<ul className="list-disc ml-5 text-sm">
{tx.items.map((it, i) => (
<li key={i}>{it.name} x {it.qty} — ₦{Number(it.price).toLocaleString()}</li>
))}
</ul>
</div>

<div className="mt-2 text-sm">
  <div className="font-medium">Seller Details</div>
  <p>Shop: {tx.sellerId?.shopName}</p>
  <p>Bank: {tx.sellerId?.bankInfo?.bankName}</p>
  <p>Account Name: {tx.sellerId?.bankInfo?.accountName}</p>
  <p>Account Number: {tx.sellerId?.bankInfo?.accountNumber}</p>
</div>


{tx.paymentProof && (
<div className="mt-2 text-sm">
Proof: <a href={tx.paymentProof} target="_blank" rel="noreferrer" className="text-blue-600">View</a>
</div>
)}


{onAction && (
<div className="mt-3 flex gap-2">
<button className="py-1 px-3 border rounded" onClick={() => onAction("approve", tx)}>Approve</button>
<button className="py-1 px-3 border rounded" onClick={() => onAction("success", tx)}>Mark Successful</button>
</div>
)}
</div>
);
}