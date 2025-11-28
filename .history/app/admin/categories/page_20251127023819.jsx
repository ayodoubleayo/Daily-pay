"use client";
import { useEffect, useState, useCallback, useEffect as useUIEffect } from "react";
import { ListChecks, Trash2, Edit, Loader2, AlertTriangle, XCircle, PlusCircle, Info } from 'lucide-react';

// Define the API base URL. It will use process.env.NEXT_PUBLIC_API_URL if defined,
// otherwise, it defaults to an empty string ('') which allows for relative API calls
// (e.g., fetch('/api/categories')) to the current host, which is generally correct
// for full-stack deployments.
const API_BASE_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) 
    ? process.env.NEXT_PUBLIC_API_URL 
    : ''; 

// --- INLINED AddCategoryForm Component ---
function AddCategoryForm({ onAdded }) {
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
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
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
      showAlert("Network error while attempting to create category. Check your API server.", 'error');
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
      
      {/* Custom Status Message for AddForm */}
      <StatusMessage 
        message={message?.text} 
        type={message?.type} 
        onClose={resetMessage} 
      />
    </div>
  );
}


// --- UI Helper Components ---

/**
 * Custom Status Message component for displaying errors/successes
 */
function StatusMessage({ message, type, onClose }) {
  if (!message) return null;
  
  const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-transform duration-300";
  const typeClasses = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-500';

  // Auto-hide messages after a delay
  useUIEffect(() => {
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

/**
 * Custom Confirmation Modal component to replace confirm()
 */
function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSecret, setAdminSecret] = useState(null);
  const [message, setMessage] = useState(null); // { text, type }
  const [confirmState, setConfirmState] = useState(null); // { message, id, name }

  const showAlert = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const resetMessage = useCallback(() => setMessage(null), []);

  useEffect(() => {
    // Check local storage for admin secret
    setAdminSecret(typeof window !== "undefined" ? localStorage.getItem("adminSecret") : null);
    load();
  }, []);

  // Function to load all categories (does NOT require admin secret)
  const load = useCallback(async () => {
    setLoading(true);
    resetMessage();

    try {
      // Use the API_BASE_URL to construct the full path
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        showAlert(j.error || `Failed to load categories (Status ${res.status}).`, 'error');
        setCats([]);
      } else {
        const data = await res.json();
        setCats(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("load categories error", err);
      showAlert("Network error during category load. Check if your backend is running.", 'error');
      setCats([]);
    } finally {
      setLoading(false);
    }
  }, [showAlert, resetMessage]);

  // Function executed after user confirms deletion
  const executeDelete = useCallback(async (id) => {
    setConfirmState(null); // Close the modal

    const secret = localStorage.getItem("adminSecret");
    if (!secret) {
      showAlert("Admin secret missing. Cannot proceed with delete.", 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: { "x-admin-secret": secret },
      });
      
      const j = await res.json().catch(()=>({}));
      
      if (!res.ok) {
        showAlert(j.error || `Category deletion failed (Status ${res.status}).`, 'error');
        return;
      }
      
      showAlert("Category deleted successfully.", 'success');
      load(); // Refresh list
      
    } catch (err) {
      console.error("delete category error", err);
      showAlert("Network error during category deletion. Check your API server.", 'error');
    }
  }, [showAlert, load]);

  // Handler to initiate confirmation modal. Replaces confirm().
  const handleDelete = useCallback((id, name) => {
    // Only show confirmation if admin is signed in
    if (!adminSecret) {
        showAlert("Admin not signed in. Cannot perform delete action.", 'error');
        return;
    }

    setConfirmState({
        message: `Are you sure you want to permanently delete the category: "${name}"? This action cannot be undone.`,
        id: id,
        name: name,
    });
  }, [adminSecret, showAlert]);

  // Handler for category added via the form
  const handleCategoryAdded = useCallback((newCat) => {
    // push to local list to show immediately
    setCats((prev) => [newCat, ...prev]);
  }, []);


  const renderCategoryCard = (c) => (
    <div key={c._id} className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-[1.02] transition duration-300 border border-gray-100">
      <div className="h-32 overflow-hidden">
        {/* Placeholder or image */}
        <img 
          src={c.image || `https://placehold.co/400x150/f9fafb/374151?text=${c.name}`} 
          alt={c.name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = `https://placehold.co/400x150/f9fafb/374151?text=${c.name}`;
          }}
        />
      </div>
      <div className="p-3">
        <div className="font-bold text-gray-800 truncate">{c.name}</div>
        <div className="text-xs text-gray-500 truncate">Slug: /{c.slug}</div>
        <div className="text-xs text-gray-500 truncate">ID: {c._id}</div>
        
        <div className="mt-3 flex gap-2">
          {/* Replaced Link from next/link with standard anchor tag to fix compilation */}
          <a 
            href={`/admin/categories/edit/${c._id}`} 
            className="flex-1 flex items-center justify-center px-3 py-1 border border-blue-500 text-blue-600 rounded-full text-sm hover:bg-blue-50 transition"
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </a>
          <button 
            onClick={() => handleDelete(c._id, c.name)} 
            className="flex-1 flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!adminSecret}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2 flex items-center">
        <ListChecks className="w-7 h-7 mr-3 text-red-600" />
        Category Management
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Category List Panel (Left/Top) */}
        <div className="lg:w-2/3 w-full">
          
          <div className="mb-4">
            {loading && <div className="p-4 text-center text-blue-500 bg-gray-50 rounded-lg flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading categories...</div>}
            
            {!loading && !adminSecret && (
                <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    You are not signed in as an Admin. Functions like Add and Delete are disabled.
                </div>
            )}
            
            {!loading && cats.length === 0 && message?.type !== 'error' && (
                 <div className="p-4 bg-gray-100 text-gray-700 rounded-lg flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    No categories found. Use the form to the right to add one.
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {cats.map(renderCategoryCard)}
          </div>
        </div>

        {/* Add Category Form Panel (Right/Bottom) */}
        <div className="lg:w-1/3 w-full">
          <AddCategoryForm onAdded={handleCategoryAdded} />
        </div>
      </div>
      
      {/* Custom Status and Confirmation Modals */}
      <StatusMessage 
        message={message?.text} 
        type={message?.type} 
        onClose={resetMessage} 
      />
      {confirmState && (
        <ConfirmationModal 
          message={confirmState.message} 
          onConfirm={() => executeDelete(confirmState.id)} 
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
}