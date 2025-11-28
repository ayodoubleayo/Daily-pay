"use client";

import { useEffect } from "react";

export default function StatusMessage({ message, type, onClose }) {
  if (!message) return null;

  const baseClasses =
    "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-transform duration-300";

  const typeClasses =
    type === "error"
      ? "bg-red-600"
      : type === "success"
      ? "bg-green-600"
      : "bg-blue-500";

  // ❌ Removed auto-hide timer here
  // The hook already handles message expiration safely

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold">{message}</p>

        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
          aria-label="close status message"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
