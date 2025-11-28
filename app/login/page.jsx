// app/login/page.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("Loading...");
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) return setMessage(data.error || "Invalid login");

      login(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") {
        localStorage.setItem("isAdminUser", "true");
      } else {
        localStorage.removeItem("isAdminUser");
      }

      setMessage("Login successful!");
      router.push("/");
    } catch (err) {
      console.error(err);
      setMessage("Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 shadow rounded bg-white">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input className="border p-2 rounded" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <input className="border p-2 rounded" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        {/* Forgot Password link (Option C includes this) */}
        <p
          className="text-sm text-blue-600 hover:underline cursor-pointer"
          onClick={() => router.push('/forgot-password')}
        >
          Forgot Password?
        </p>

        <button className="bg-green-600 text-white p-2 rounded">Login</button>
      </form>

      <p className="mt-3 text-sm text-gray-600">{message}</p>
    </div>
  );
}
