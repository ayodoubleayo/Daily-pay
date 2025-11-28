// File: app/admin/categories/page.jsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ListChecks,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Info,
} from 'lucide-react';

// API base taken from environment; fall back to empty string for relative calls
const API_BASE = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : '';

/* -------------------------
   Small UI helpers
   ------------------------- */
function StatusMessage({ message, type = 'info', onClose }) {
  if (!message) return null;
  const base = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-transform duration-300";
  const tc = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600';

  // auto hide after 4s
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 4000);
    return () => clearTimeout(t);
  }, [message, type, onClose]);

  return (
    <div className={`${base} ${tc}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200" aria-label="close">×</button>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
        <p className="mb-6 text-gray-800">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   Main Admin Categories Page
   ------------------------- */
export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSecret, setAdminSecret] = useState(null);
  const [message, setMessage] = useState(null); // { text, type }
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }
  const [confirmState, setConfirmState] = useState(null); // { id, name, message }
  const [busy, setBusy] = useState(false);

  // load admin secret from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAdminSecret(localStorage.getItem('adminSecret'));
    }
  }, []);

  const show = (text, type = 'info') => setMessage({ text, type });
  const hide = () => setMessage(null);

  // Load categories (public GET)
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        show(j.error || `Failed to load categories (status ${res.status})`, 'error');
        setCats([]);
      } else {
        const data = await res.json();
        setCats(Array.isArray(data) ? data : (data.categories || []));
      }
    } catch (err) {
      console.error('load categories error', err);
      show('Network error while loading categories. Is backend running?', 'error');
      setCats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Create category
  const createCategory = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return show('Category name required', 'error');
    const secret = adminSecret || (typeof window !== 'undefined' && localStorage.getItem('adminSecret'));
    if (!secret) return show('Admin not signed in. Add adminSecret to localStorage.', 'error');

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        show(j.error || `Create failed (status ${res.status})`, 'error');
        return;
      }
      show('Category created', 'success');
      setNewName('');
      // prepend the returned category if provided, otherwise reload
      if (j && j._id) setCats(prev => [j, ...prev]);
      else await loadCategories();
    } catch (err) {
      console.error('createCategory', err);
      show('Network error creating category', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Start editing
  const startEdit = (c) => {
    setEditing({ id: c._id || c.id, name: c.name || '' });
  };

  // Save edit
  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing || !editing.name.trim()) return show('Name required to update', 'error');
    const secret = adminSecret || (typeof window !== 'undefined' && localStorage.getItem('adminSecret'));
    if (!secret) return show('Admin not signed in. Add adminSecret to localStorage.', 'error');

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ name: editing.name.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        show(j.error || `Update failed (status ${res.status})`, 'error');
        return;
      }
      show('Category updated', 'success');
      // update local list if server returned the new object
      if (j && (j._id || j.id)) {
        setCats(prev => prev.map(p => (p._id === j._id || p.id === j.id ? j : p)));
      } else {
        await loadCategories();
      }
      setEditing(null);
    } catch (err) {
      console.error('saveEdit', err);
      show('Network error updating category', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Confirm delete
  const confirmDelete = (id, name) => {
    setConfirmState({ id, name, message: `Permanently delete category "${name}"? This cannot be undone.` });
  };

  // Execute delete
  const doDelete = async () => {
    if (!confirmState) return;
    const { id } = confirmState;
    setConfirmState(null);
    const secret = adminSecret || (typeof window !== 'undefined' && localStorage.getItem('adminSecret'));
    if (!secret) return show('Admin not signed in. Add adminSecret to localStorage.', 'error');

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': secret }
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        show(j.error || `Delete failed (status ${res.status})`, 'error');
        return;
      }
      show('Category deleted', 'success');
      // remove locally
      setCats(prev => prev.filter(c => (c._id || c.id) !== id));
    } catch (err) {
      console.error('deleteCategory', err);
      show('Network error deleting category', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2 flex items-center">
        <ListChecks className="w-7 h-7 mr-3 text-red-600" />
        Category Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* list */}
        <div className="lg:w-2/3 w-full">
          <div className="mb-4">
            {loading && (
              <div className="p-4 text-center text-blue-500 bg-gray-50 rounded-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading categories...
              </div>
            )}

            {!loading && !adminSecret && (
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                You are not signed in as an Admin. Add adminSecret to localStorage to enable add / delete.
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
            {cats.map(c => (
              <div key={c._id || c.id} className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
                <div className="h-32 overflow-hidden">
                  <img
                    src={c.image || `https://placehold.co/400x150/f9fafb/374151?text=${encodeURIComponent(c.name || 'Category')}`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x150/f9fafb/374151?text=${encodeURIComponent(c.name || 'Category')}`; }}
                  />
                </div>
                <div className="p-3">
                  <div className="font-bold text-gray-800 truncate">{c.name}</div>
                  <div className="text-xs text-gray-500 truncate">Slug: /{c.slug || ''}</div>
                  <div className="text-xs text-gray-500 truncate">ID: {c._id || c.id}</div>

                  <div className="mt-3 flex gap-2">
                    <button onClick={() => startEdit(c)} className="flex-1 flex items-center justify-center px-3 py-1 border border-blue-500 text-blue-600 rounded-full text-sm hover:bg-blue-50 transition">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </button>

                    <button onClick={() => confirmDelete(c._id || c.id, c.name)} disabled={!adminSecret} className="flex-1 flex items-center justify-center px-3 py-1 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition disabled:opacity-50">
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* form */}
        <div className="lg:w-1/3 w-full">
          <div className="w-full bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <PlusCircle className="w-5 h-5 mr-2 text-red-600" /> Add New Category
            </h3>

            <form onSubmit={createCategory} className="space-y-4">
              <div>
                <label className="text-sm block font-medium text-gray-700 mb-1">Category Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="e.g. Electronics" />
              </div>

              <button disabled={busy || !newName.trim()} className={`w-full px-4 py-3 rounded-lg ${busy || !newName.trim() ? 'bg-red-400' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {busy ? 'Working...' : 'Add Category'}
              </button>
            </form>

            {/* inline edit form */}
            {editing && (
              <form onSubmit={saveEdit} className="mt-6 space-y-3">
                <div>
                  <label className="text-sm block font-medium text-gray-700 mb-1">Edit Name</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full p-3 border rounded-lg" />
                </div>
                <div className="flex gap-2">
                  <button disabled={busy} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                  <button type="button" onClick={() => setEditing(null)} className="flex-1 px-4 py-2 bg-gray-100 rounded">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <StatusMessage message={message?.text} type={message?.type} onClose={hide} />

      <ConfirmModal
        message={confirmState?.message}
        onConfirm={doDelete}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
