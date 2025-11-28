// app/reset-password/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !email) setMessage("Invalid or missing reset link. Use the link from your email.");
  }, [token, email]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) return setMessage("Password must be at least 6 chars");
    if (password !== confirm) return setMessage("Passwords do not match");
    setMessage("Saving...");
    try {
      const res = await fetch(apiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password })
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "Failed");
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(()=>router.push("/login"), 1400);
    } catch (err) {
      console.error(err);
      setMessage("Reset failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Reset password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="New password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Confirm password" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        <button className="bg-green-600 text-white p-2 rounded">Save new password</button>
      </form>
      <p className="mt-3 text-sm text-gray-600">{message}</p>
    </div>
  );
}
