// File: app/admin/all-sellers/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import useMessage from '@/components/useMessage';
import StatusMessage from '@/components/StatusMessage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AllSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const { message, isError, showMessage, clearMessage } = useMessage();

  const loadSellers = useCallback(async () => {
    setLoading(true);
    try {
      const secret = localStorage.getItem('adminSecret');
      if (!secret) {
        showMessage('Admin Secret missing', true);
        setSellers([]);
        return;
      }
      const res = await fetch(`${API_BASE}/api/admin/sellers`, { headers: { 'x-admin-secret': secret } });
      if (!res.ok) {
        showMessage('Failed to fetch sellers', true);
        setSellers([]);
        return;
      }
      const data = await res.json();
      setSellers(Array.isArray(data) ? data : data.sellers || []);
    } catch (err) {
      console.error(err);
      showMessage('Network error fetching sellers', true);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => { loadSellers(); }, [loadSellers]);

  const confirmThen = useCallback((path, method, body, msg) => {
    setConfirmState({ path, method, body, message: msg, onComplete: loadSellers });
  }, [loadSellers]);

  const handleConfirmAction = useCallback(async () => {
    const { path, method, body, onComplete } = confirmState || {};
    setConfirmState(null);
    if (!path) return;
    const secret = localStorage.getItem('adminSecret');
    try {
      const res = await fetch(`${API_BASE}${path}`, { method, headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret }, body: body ? JSON.stringify(body) : undefined });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        showMessage(err.error || 'Action failed', true);
        return;
      }
      showMessage('Action successful', false);
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      showMessage('Network error performing action', true);
    }
  }, [confirmState, showMessage]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Sellers</h1>

      {loading && <div className="p-4">Loading…</div>}

      <div className="grid gap-3">
        {sellers.map(s => (
          <div key={s._id || s.id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{s.shopName || s.name}</div>
              <div className="text-sm text-gray-600">{s.email}</div>
            </div>
            <div className="flex gap-2">
              {!s.banned && <button onClick={() => confirmThen(`/api/admin/sellers/${s._id}/suspend`, 'PUT', null, 'Suspend seller?')} className="bg-yellow-500 text-white px-3 py-1 rounded">Suspend</button>}
              {!s.banned && <button onClick={() => confirmThen(`/api/admin/sellers/${s._id}/ban`, 'PUT', null, 'Ban seller?')} className="bg-red-700 text-white px-3 py-1 rounded">Ban</button>}
            </div>
          </div>
        ))}
      </div>

      <StatusMessage message={message} type={isError ? 'error' : 'success'} onClose={clearMessage} />

      {confirmState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded">
            <p className="mb-4">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmState(null)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleConfirmAction} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
