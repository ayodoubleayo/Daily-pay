"use client";
import { useEffect, useState, useCallback } from "react";
import { PlusCircle, Loader2, Info } from 'lucide-react';

// --- UI Helper Component ---

/**
 * Custom Status Message component for displaying errors/successes
 */
function StatusMessage({ message, type, onClose }) {
  if (!message) return null;
  
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-transform duration-300";
  const typeClasses = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-500';

  // Auto-hide messages after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          &times;
        </button>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function AddCategoryForm({ onAdded }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }

  const showAlert = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const resetMessage = useCallback(() => setMessage(null), []);

  async function handleSubmit(e) {
    e.preventDefault();
    resetMessage();

    if (!name.trim()) return showAlert("Category Name is required.", 'error');

    const adminSecret = typeof window !== "undefined" ? localStorage.getItem("adminSecret") : null;
    if (!adminSecret) return showAlert("Admin secret missing. Please log in to the admin panel.", 'error');

    setBusy(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ 
            name: name.trim(), 
            // Only send image if it's provided and trimmed
            ...(image.trim() && { image: image.trim() }) 
        }),
      });

      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        showAlert(data.error || `Failed to create category (Status ${res.status}).`, 'error');
        return;
      }

      setName("");
      setImage("");
      showAlert("Category added successfully!", 'success');
      if (onAdded) onAdded(data);

    } catch (err) {
      console.error("create category error", err);
      showAlert("Network error while attempting to create category.", 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
        <PlusCircle className="w-5 h-5 mr-2 text-red-600" />
        Add New Category
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Category Name Input */}
        <div>
          <label htmlFor="category-name" className="text-sm block font-medium text-gray-700 mb-1">Category Name</label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Electronics, Fashion, Groceries"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
            disabled={busy}
          />
        </div>

        {/* Image Input */}
        <div>
          <label htmlFor="category-image" className="text-sm block font-medium text-gray-700 mb-1">Image Filename (optional)</label>
          <input
            id="category-image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="e.g. electronics.jpg or a placeholder URL"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm"
            disabled={busy}
          />
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <Info className="w-3 h-3 mr-1" />
            This should be the filename or URL for the category's icon/image.
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={busy || !name.trim()} 
          className={`w-full flex items-center justify-center px-4 py-3 font-semibold rounded-lg transition duration-300 shadow-md ${
            busy || !name.trim() 
              ? "bg-red-400 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 mr-2" />
              Add Category
            </>
          )}
        </button>
      </form>
      
      {/* Custom Status Message */}
      <StatusMessage 
        message={message?.text} 
        type={message?.type} 
        onClose={resetMessage} 
      />
    </div>
  );
}