// File: app/admin/active-sellers/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, UserCheck, Zap, XCircle } from 'lucide-react';
import useMessage from '@/components/useMessage';
import StatusMessage from '@/components/StatusMessage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ActiveSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { message, isError, showMessage, clearMessage } = useMessage();

  const loadSellers = useCallback(async () => {
    setLoading(true);
    try {
      const secret = localStorage.getItem('adminSecret');
      if (!secret) {
        showMessage('Admin Secret not found. Please log in.', true);
        setSellers([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/admin/active-sellers`, { headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showMessage(err.error || 'Failed to fetch sellers. Authorization denied.', true);
        setSellers([]);
        return;
      }

      const data = await res.json();
      setSellers(Array.isArray(data) ? data : data.sellers || []);
    } catch (err) {
      console.error(err);
      showMessage('Network error or server connection failed.', true);
      setSellers([]);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => { loadSellers(); }, [loadSellers]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center"><UserCheck className="w-6 h-6 mr-2 text-red-600" /> Active Sellers Today</h1>

      <div className="p-4 bg-blue-50 rounded mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-3" />
        <p className="text-sm">This panel shows sellers who interacted within the last hour.</p>
      </div>

      {loading && <div className="p-6">Loading active sellers data...</div>}

      {!loading && sellers.length === 0 && <div className="p-6 bg-yellow-100">No sellers detected as active currently.</div>}

      <div className="grid gap-3">
        {sellers.map(s => (
          <div key={s._id || s.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
            <div>
              <div className="font-semibold text-gray-900">{s.shopName || s.name || 'N/A'}</div>
              <div className="text-sm text-gray-600">{s.email}</div>
            </div>

            <div className="text-sm text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-red-600" />
              <div>Last Active: <span className="font-medium">{s.lastActive ? new Date(s.lastActive).toLocaleString() : 'N/A'}</span></div>
            </div>
          </div>
        ))}
      </div>

      <StatusMessage message={message} type={isError ? 'error' : 'success'} onClose={clearMessage} />
    </div>
  );
}
