'use client';
import { useState } from "react";
import { fetchJson } from "@/lib/api";

export default function SuggestionsPage() {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Sending...");

    try {
      await fetchJson("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, name, email })
      });

      setMsg("Thank you for your suggestion!");
      setText("");
      setName("");
      setEmail("");

    } catch (err) {
      setMsg(err.message || "Error sending suggestion");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h1 className="text-3xl font-bold mb-4">Suggestions</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          className="border p-3 rounded"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-3 rounded"
          placeholder="Your email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          className="border p-3 rounded"
          rows={6}
          placeholder="Write your suggestion..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="bg-blue-600 text-white p-2 rounded">
          Submit
        </button>
      </form>

      <p className="mt-3 text-gray-700">{msg}</p>
    </div>
  );
}
