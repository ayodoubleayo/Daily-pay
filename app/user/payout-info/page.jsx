// frontend/app/user/payout-info/page.jsx
"use client";
import { useEffect, useState } from "react";

export default function PayoutInfoPage() {
  const [form, setForm] = useState({
    fullName: "",
    bankName: "",
    accountNumber: "",
    bvn: "",
    nin: "",
    agree: false
  });
  const [idUpload, setIdUpload] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payout-info/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const j = await res.json();
        if (j) {
          setForm({
            fullName: j.fullName || "",
            bankName: j.bankName || "",
            accountNumber: j.accountNumber || "",
            bvn: j.bvn || "",
            nin: j.nin || "",
            agree: true
          });
        }
      }
    })();
  }, []);

  async function uploadFile(file) {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Upload failed");
    return j.url;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.agree) return alert("You must agree to terms");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login");

      let idUrl = "";
      let certUrl = "";
      if (idUpload) idUrl = await uploadFile(idUpload);
      if (certificate) certUrl = await uploadFile(certificate);

      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("bankName", form.bankName);
      fd.append("accountNumber", form.accountNumber);
      if (form.bvn) fd.append("bvn", form.bvn);
      if (form.nin) fd.append("nin", form.nin);
      if (idUrl) fd.append("idUpload", idUrl);
      if (certUrl) fd.append("certificate", certUrl);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payout-info`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert("Saved payout info");
    } catch (err) {
      alert(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Payout Information</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Full Name (Required)</label>
          <input required value={form.fullName} onChange={(e)=>setForm({...form, fullName: e.target.value})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">Bank Name (Required)</label>
          <input required value={form.bankName} onChange={(e)=>setForm({...form, bankName: e.target.value})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">Account Number (Required)</label>
          <input required value={form.accountNumber} onChange={(e)=>setForm({...form, accountNumber: e.target.value})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">BVN (Optional)</label>
          <input value={form.bvn} onChange={(e)=>setForm({...form, bvn: e.target.value})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">NIN (Optional)</label>
          <input value={form.nin} onChange={(e)=>setForm({...form, nin: e.target.value})} className="w-full border p-2 rounded"/>
        </div>
        <div>
          <label className="block text-sm">Upload ID (Optional)</label>
          <input type="file" onChange={(e)=>setIdUpload(e.target.files[0])}/>
        </div>
        <div>
          <label className="block text-sm">Upload Certificate (Optional)</label>
          <input type="file" onChange={(e)=>setCertificate(e.target.files[0])}/>
        </div>
        <div className="flex items-start gap-2">
          <input type="checkbox" checked={form.agree} onChange={()=>setForm({...form, agree: !form.agree})}/>
          <div className="text-sm">I confirm these bank details belong to me and I agree to a 72 working hour verification window.</div>
        </div>
        <button disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded">{loading ? "Saving..." : "Save Payout Info"}</button>
      </form>
    </div>
  );
}
