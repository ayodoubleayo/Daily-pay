// File: app/admin/all-users/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, UserX, CheckCheck, Loader2 } from 'lucide-react';
import useMessage from '@/components/useMessage';
import StatusMessage from '@/components/StatusMessage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const { message, isError, showMessage, clearMessage } = useMessage();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const secret = localStorage.getItem('adminSecret');
      if (!secret) {
        showMessage('Admin Secret not found. Authorization failed. Please log in.', true);
        setUsers([]);
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/users`, {
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        showMessage(err.error || 'Failed to fetch user list. Authorization denied.', true);
        setUsers([]);
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error('loadUsers', err);
      showMessage('Network error or server connection failed.', true);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const adminCall = useCallback(
    async (path, method = 'PUT', body = null) => {
      const secret = localStorage.getItem('adminSecret');
      if (!secret) {
        showMessage('Not authorized. Admin secret missing.', true);
        return null;
      }
      try {
        const res = await fetch(`${API_BASE}${path}`, {
          method,
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
          body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          showMessage(data.error || 'Action failed', true);
          return null;
        }
        showMessage('Action successful!', false);
        return data;
      } catch (err) {
        console.error('adminCall', err);
        showMessage('Network error while performing action.', true);
        return null;
      }
    },
    [showMessage]
  );

  const confirmThen = useCallback((path, method, body, confirmMsg) => {
    setConfirmState({ path, method, body, message: confirmMsg, onComplete: loadUsers });
  }, [loadUsers]);

  const handleConfirmAction = useCallback(async () => {
    const { path, method, body, onComplete } = confirmState || {};
    setConfirmState(null);
    if (!path) return;
    const result = await adminCall(path, method, body);
    if (result && onComplete) onComplete();
  }, [confirmState, adminCall]);

  const handleCancelAction = useCallback(() => setConfirmState(null), []);

  const warnUser = useCallback((id) => {
    confirmThen(`/api/admin/users/${id}/warn`, 'PUT', null, 'Are you sure you want to add a warning to this user?');
  }, [confirmThen]);

  const getStats = (list) => ({
    total: list.length,
    active: list.filter(u => !u.banned && !u.suspended).length,
    banned: list.filter(u => u.banned).length,
    suspended: list.filter(u => u.suspended && !u.banned).length,
  });

  const stats = getStats(users);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center">
        <Users className="w-7 h-7 mr-3 text-red-600" />
        All Users Management
      </h1>

      {/* Stats (same UI) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded-lg text-center">
          <p className="text-gray-500 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="p-4 bg-green-50 shadow rounded-lg text-center">
          <p className="text-green-600 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="p-4 bg-yellow-50 shadow rounded-lg text-center">
          <p className="text-yellow-600 text-sm">Suspended</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.suspended}</p>
        </div>
        <div className="p-4 bg-red-50 shadow rounded-lg text-center">
          <p className="text-red-600 text-sm">Banned</p>
          <p className="text-2xl font-bold text-red-700">{stats.banned}</p>
        </div>
      </div>

      {loading && (
        <div className="p-6 text-center text-blue-500">
          <Loader2 className="w-5 h-5 mr-2 animate-spin inline" /> Loading users...
        </div>
      )}

      <div className="grid gap-3">
        {users.map(u => (
          <div key={u._id || u.id} className="p-4 bg-white rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 border-red-600">
            <div>
              <p className="font-semibold text-gray-900">{u.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{u.email}</p>
              <p className="text-sm mt-1">
                Status: {u.banned ? <span className="text-red-600 ml-2 font-medium">BANNED</span> : u.suspended ? <span className="text-yellow-600 ml-2 font-medium">SUSPENDED</span> : <span className="text-green-600 ml-2 font-medium">ACTIVE</span>}
              </p>
              <p className="text-xs text-gray-500 flex items-center">
                <CheckCheck className="w-3 h-3 mr-1 text-indigo-500" />
                Warnings: {u.warnings || 0}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap mt-3 md:mt-0">
              {!u.banned && !u.suspended && <button onClick={() => confirmThen(`/api/admin/users/${u._id}/suspend`, 'PUT', null, 'Suspend this user?')} className="bg-yellow-500 text-white px-3 py-1 rounded-full">Suspend</button>}
              {!u.banned && u.suspended && <button onClick={() => confirmThen(`/api/admin/users/${u._id}/reactivate`, 'PUT', null, 'Unsuspend this user?')} className="bg-green-600 text-white px-3 py-1 rounded-full">Unsuspend</button>}
              {!u.banned && <button onClick={() => confirmThen(`/api/admin/users/${u._id}/ban`, 'PUT', null, 'Permanently ban this user?')} className="bg-red-700 text-white px-3 py-1 rounded-full">Ban</button>}
              {u.banned && <button onClick={() => confirmThen(`/api/admin/users/${u._id}/unban`, 'PUT', null, 'Unban this user?')} className="bg-blue-600 text-white px-3 py-1 rounded-full">Unban</button>}
              <button onClick={() => warnUser(u._id)} className="bg-indigo-600 text-white px-3 py-1 rounded-full">Warn</button>
            </div>
          </div>
        ))}
      </div>

      <StatusMessage message={message} type={isError ? 'error' : 'success'} onClose={clearMessage} />

      {confirmState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
            <p className="text-lg font-semibold mb-4">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCancelAction} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleConfirmAction} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
