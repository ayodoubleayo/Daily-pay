// app/register/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("Loading...");
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "Something went wrong");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Account created successfully!");
      router.push("/");
    } catch (err) {
      console.error(err);
      setMessage("Registration failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 rounded" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white p-2 rounded">Create Account</button>
      </form>

      <p className="mt-3 text-sm text-gray-600">{message}</p>
    </div>
  );
}
