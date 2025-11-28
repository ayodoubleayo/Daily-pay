'use client';

import { useEffect, useState, useCallback } from 'react';

// Rename UI effect cleanly
import { useEffect as useUIEffect } from 'react';

// --- UI Helper Components ---

function StatusMessage({ message, type, onClose }) {
  if (!message) return null;

  const baseClasses =
    "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white max-w-sm z-50 transition-transform duration-300";
  const typeClasses =
    type === 'error'
      ? 'bg-red-600'
      : type === 'success'
      ? 'bg-green-600'
      : 'bg-blue-500';

  // Auto-hide after timeout
  useUIEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, type, onClose]);

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex justify-between items-start">
        <p className="font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
        <p className="text-lg font-semibold mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function AllSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }
  const [confirmState, setConfirmState] = useState(null);

  const showAlert = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const resetMessage = useCallback(() => setMessage(null), []);

  const loadSellers = useCallback(async () => {
    setLoading(true);
    try {
      const secret = localStorage.getItem('adminSecret');

      if (!secret) {
        showAlert(
          'Admin Secret not found. Authorization failed. Please log in.',
          'error'
        );
        setSellers([]);
        return;
      }

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/api/admin/active-sellers',
        {
          headers: {
            'x-admin-secret': secret,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(
          errorData.error ||
            'Failed to fetch sellers data. Authorization denied.',
          'error'
        );
        setSellers([]);
        return;
      }

      const data = await res.json();
      setSellers(data.sellers || data);
    } catch (err) {
      console.error('loadSellers error', err);
      showAlert('Network error or server connection failed.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  const adminCall = useCallback(
    async (path, method = 'PUT', body = null) => {
      const secret = localStorage.getItem('adminSecret');
      if (!secret) {
        showAlert('Not authorized. Admin secret missing.', 'error');
        return null;
      }

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + path, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': secret,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await res.json();

        if (!res.ok) {
          showAlert(data.error || 'Action failed', 'error');
          return null;
        }

        showAlert('Action successful!', 'success');
        return data;
      } catch (err) {
        console.error('adminCall error', err);
        showAlert('Network error while performing action.', 'error');
        return null;
      }
    },
    [showAlert]
  );

  const confirmThen = useCallback(
    (path, method, body, confirmMsg) => {
      setConfirmState({
        message: confirmMsg,
        path,
        method,
        body,
        onComplete: loadSellers,
      });
    },
    [loadSellers]
  );

  const handleConfirmAction = useCallback(async () => {
    const { path, method, body, onComplete } = confirmState;
    setConfirmState(null);
    const result = await adminCall(path, method, body);
    if (result) onComplete();
  }, [confirmState, adminCall]);

  const handleCancelAction = useCallback(() => {
    setConfirmState(null);
  }, []);

  const warnSeller = useCallback(
    (id) => {
      confirmThen(
        `/api/admin/sellers/${id}/warn`,
        'PUT',
        null,
        'Are you sure you want to add a warning to this seller?'
      );
    },
    [confirmThen]
  );

  const getStats = (list) => ({
    total: list.length,
    approved: list.filter((s) => s.approved === true).length,
    pending: list.filter((s) => s.approved === false).length,
    suspendedOrBanned: list.filter(
      (s) => s.status === 'banned' || s.status === 'suspended'
    ).length,
  });

  const stats = getStats(sellers);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2">
        All Sellers Management
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded-lg">
          <p className="text-gray-500 text-sm">Total Sellers</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 bg-green-100 shadow rounded-lg">
          <p className="text-gray-600 text-sm">Approved</p>
          <p className="text-2xl font-bold">{stats.approved}</p>
        </div>

        <div className="p-4 bg-yellow-100 shadow rounded-lg">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>

        <div className="p-4 bg-red-100 shadow rounded-lg">
          <p className="text-gray-600 text-sm">Suspended / Banned</p>
          <p className="text-2xl font-bold">{stats.suspendedOrBanned}</p>
        </div>
      </div>

      {loading && (
        <div className="p-4 text-center text-blue-500">Loading sellers…</div>
      )}

      {!loading && sellers.length === 0 && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          No sellers found or unauthorized access.
        </div>
      )}

      <div className="grid gap-3">
        {sellers.map((s) => (
          <div
            key={s._id}
            className="p-3 bg-white shadow rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div>
              <p className="font-semibold text-gray-900">
                Shop: {s.shopName || s.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Email: {s.email}</p>

              <p className="text-sm mt-1">
                Status:{' '}
                {s.banned ? (
                  <span className="text-red-600 font-medium">BANNED</span>
                ) : s.suspended ? (
                  <span className="text-yellow-600 font-medium">SUSPENDED</span>
                ) : (
                  <span className="text-green-600 font-medium">ACTIVE</span>
                )}
              </p>

              <p className="text-xs text-gray-500">
                Warnings: {s.warnings || 0}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-3 md:mt-0">
              {!s.banned && !s.suspended && (
                <button
                  onClick={() =>
                    confirmThen(
                      `/api/admin/sellers/${s._id}/suspend`,
                      'PUT',
                      null,
                      'Suspend this seller? They will not be able to sell products.'
                    )
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Suspend
                </button>
              )}

              {!s.banned && s.suspended && (
                <button
                  onClick={() =>
                    confirmThen(
                      `/api/admin/sellers/${s._id}/reactivate`,
                      'PUT',
                      null,
                      'Unsuspend this seller?'
                    )
                  }
                  className="bg-green-600 hover:bg-green-700 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Unsuspend
                </button>
              )}

              {!s.banned && (
                <button
                  onClick={() =>
                    confirmThen(
                      `/api/admin/sellers/${s._id}/ban`,
                      'PUT',
                      null,
                      'WARNING: Permanently ban this seller? This action is hard to reverse.'
                    )
                  }
                  className="bg-red-700 hover:bg-red-800 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Ban
                </button>
              )}

              {s.banned && (
                <button
                  onClick={() =>
                    confirmThen(
                      `/api/admin/sellers/${s._id}/unban`,
                      'PUT',
                      null,
                      'Unban this seller?'
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Unban
                </button>
              )}

              <button
                onClick={() => warnSeller(s._id)}
                className="bg-indigo-600 hover:bg-indigo-700 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
              >
                Warn
              </button>
            </div>
          </div>
        ))}
      </div>

      <StatusMessage
        message={message?.text}
        type={message?.type}
        onClose={resetMessage}
      />

      {confirmState && (
        <ConfirmationModal
          message={confirmState.message}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
}
