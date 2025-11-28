"use client";

import { useEffect, useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CartContext } from "../../../context/CartContext";

export default function TransferPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { clearCart } = useContext(CartContext);

  const [bank, setBank] = useState(null);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentProof, setPaymentProof] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- FIXED ---
  // NOW WE ONLY READ sellerId — NOT [object Object]
  const sellerId = search.get("seller");
  const orderId = search.get("order");
  const txId = search.get("tx");
  const amountParam = search.get("amount");
  const amount = amountParam ? Number(amountParam) : null;

  // Unlock client render
  useEffect(() => { setReady(true); }, []);

  // Load user + token
  useEffect(() => {
    if (!ready) return;

    const tk = localStorage.getItem("token");
    const usr = localStorage.getItem("user");

    if (tk && usr) {
      setToken(tk);
      setUser(JSON.parse(usr));
    }
  }, [ready]);

  // --- FIXED BANK LOADER ---
  useEffect(() => {
    if (!ready) return;

    async function loadSellerBank() {
      try {
        if (sellerId) {
          // get seller
          const sellerRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/sellers/${sellerId}`
          );

          if (sellerRes.ok) {
            const seller = await sellerRes.json();

            // seller bank exists?
            if (seller.bank && seller.bank.accountNumber) {
              setBank({
                bankName: seller.bank.bankName,
                accountName: seller.bank.accountName,
                accountNumber: seller.bank.accountNumber,
                instructions: seller.bank.instructions || ""
              });
              return;
            }
          }
        }

        // fallback → platform bank
        const platformRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/bank-details`
        );

        if (platformRes.ok) {
          const pb = await platformRes.json();
          setBank({
            bankName: pb.bankName || "",
            accountName: pb.accountName || "",
            accountNumber: pb.accountNumber || "",
            instructions: pb.instructions || ""
          });
        }
      } catch (err) {
        console.error("BANK LOAD ERROR: ", err);
      }
    }

    loadSellerBank();
  }, [ready, sellerId]);

  // Upload payment proof
  async function uploadProof(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: fd,
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) throw new Error((data.error || "Upload failed"));

      setPaymentProof(data.url);
      alert("Payment proof uploaded!");
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  // submit payment proof

// Replace your existing submitOrder with this inside TransferPage component
// inside TransferPage component — replace submitOrder with:
async function submitOrder() {
  if (!paymentProof) return alert("Upload payment proof first!");
  if (!token) return alert("Please login to finalize order");

  setLoading(true);

  try {
    // only transaction id is valid for proof upload
    const targetId = txId; // txId comes from search params
    const thisOrderId = orderId; // orderId read at top from search params
    console.log("DEBUG submitOrder — txId:", targetId, "paymentProof:", paymentProof);

    if (!targetId) throw new Error("Missing transaction ID. Make sure checkout returned a tx id and it was passed as ?tx=...");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${targetId}/proof`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // controller expects { proofUrl }
        body: JSON.stringify({ proofUrl: paymentProof }),
      }
    );

    const text = await res.text();
    let j;
    try { j = text ? JSON.parse(text) : {}; } catch { j = {}; }

    if (!res.ok) {
      throw new Error(j.error || j.message || text || "Failed to submit proof");
    }

    // success: clear cart and navigate to success page — include order id so user can track
    clearCart();
    if (thisOrderId) {
      router.push(`/checkout/success?order=${thisOrderId}`);
    } else {
      router.push("/checkout/success");
    }
  } catch (err) {
    console.error("submitOrder error:", err);
    alert(err.message || "Could not submit proof");
  } finally {
    setLoading(false);
  }
}



  if (!ready || !bank) return null;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Transfer Payment</h1>

      <p className="text-sm mb-4">Please make payment using the bank details below:</p>

      <div className="p-4 border rounded mb-4">
        <p><strong>Bank:</strong> {bank.bankName}</p>
        <p><strong>Account Name:</strong> {bank.accountName}</p>
        <p><strong>Account Number:</strong> {bank.accountNumber}</p>

        {bank.instructions && (
          <p className="mt-2 text-sm text-gray-600">{bank.instructions}</p>
        )}
      </div>

      <p className="font-semibold mb-4">
        Amount to Pay: ₦{amount ? amount.toLocaleString() : "—"}
      </p>

      <div className="mb-4">
        <label className="text-sm">Upload Payment Screenshot:</label>
        <input type="file" onChange={uploadProof} className="mt-1 w-full border rounded p-2" />
        {uploading && <p className="text-blue-600 text-sm">Uploading…</p>}
        {paymentProof && <p className="text-green-600 text-sm">Uploaded ✓</p>}
      </div>

      <button
        onClick={submitOrder}
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing…" : "I Have Paid — Submit Order"}
      </button>
    </div>
  );
}
