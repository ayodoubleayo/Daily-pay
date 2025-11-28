// app/forgot-password/page.jsx
"use client";
import { useState } from "react";
import { apiUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("Sending...");
    try {
      const res = await fetch(apiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "Failed");
      setMessage("If that email exists, a reset link was sent.");
      // optional: redirect to home after a moment
      // setTimeout(()=>router.push('/'),2000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send reset link");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Forgot password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <button className="bg-blue-600 text-white p-2 rounded">Send reset link</button>
      </form>
      <p className="mt-3 text-sm text-gray-600">{message}</p>
    </div>
  );
}
