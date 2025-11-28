'use client';
import { useEffect, useState, useCallback, useEffect as useUIEffect } from 'react';
import { Users, UserX, CheckCheck, Loader2 } from 'lucide-react';

// --- UI Helper Components (Reuses logic for better UX and avoiding alert/confirm) ---

/**
 * Custom Status Message component to replace alert()
 * Displays temporary feedback for success/error states.
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
 * Requires explicit user confirmation for sensitive actions.
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
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}


// --- Main Component ---

export default function AllUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }
  const [confirmState, setConfirmState] = useState(null); // { message, path, method, body, onComplete }

  // Custom alert handler
  const showAlert = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const resetMessage = useCallback(() => setMessage(null), []);

  /**
   * Fetches the list of all users, requiring the admin secret.
   * ⚠️ SECURITY FIX applied here. The original code was missing the admin secret 
   * header on the initial loadUsers fetch, which is crucial for an admin endpoint.
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const secret = localStorage.getItem('adminSecret');
      
      if (!secret) {
        showAlert('Admin Secret not found. Authorization failed. Please log in.', 'error');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/auth/users', {
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret // CRITICAL: Added security header
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(errorData.error || 'Failed to fetch user list. Authorization denied.', 'error');
        setUsers([]);
        return;
      }
      
      const data = await res.json();
      setUsers(data.users || data);
    } catch (err) {
      console.error('loadUsers error', err);
      showAlert('Network error or server connection failed.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Centralized function for all admin API calls.
   */
  const adminCall = useCallback(async (path, method = 'PUT', body = null) => {
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
          'x-admin-secret': secret // CRITICAL: Security header
        },
        body: body ? JSON.stringify(body) : undefined
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
  }, [showAlert]);

  /**
   * Sets up the confirmation modal state. Replaces confirm().
   */
  const confirmThen = useCallback((path, method, body, confirmMsg) => {
    setConfirmState({
      message: confirmMsg,
      path,
      method,
      body,
      onComplete: loadUsers
    });
  }, [loadUsers]);

  /**
   * Executes the API call once the modal is confirmed.
   */
  const handleConfirmAction = useCallback(async () => {
    const { path, method, body, onComplete } = confirmState;
    setConfirmState(null); // Close the modal immediately
    const result = await adminCall(path, method, body);
    if (result) {
      onComplete();
    }
  }, [confirmState, adminCall]);

  /**
   * Cancels the pending action and closes the modal.
   */
  const handleCancelAction = useCallback(() => {
    setConfirmState(null);
  }, []);

  const warnUser = useCallback((id) => {
    const confirmMsg = 'Are you sure you want to add a warning to this user?';
    confirmThen(`/api/admin/users/${id}/warn`, 'PUT', null, confirmMsg);
  }, [confirmThen]);

  // Helper for stats
  const getUserStats = (users) => ({
    total: users.length,
    active: users.filter(u => !u.banned && !u.suspended).length,
    banned: users.filter(u => u.banned).length,
    suspended: users.filter(u => u.suspended && !u.banned).length,
  });

  const stats = getUserStats(users);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2 flex items-center">
        <Users className="w-7 h-7 mr-3 text-red-600" />
        All Users Management
      </h1>
      
      {/* USER STATS */}
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
        <div className="p-6 text-center text-blue-500 bg-white rounded-lg shadow flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading users data...
        </div>
      )}

      {!loading && users.length === 0 && message?.type !== 'error' && (
         <div className="p-6 bg-yellow-100 text-yellow-800 rounded-lg flex items-center justify-center">
            <UserX className="w-5 h-5 mr-3" />
            No users found.
        </div>
      )}

      <div className="grid gap-3">
        {users.map(u => (
          <div key={u._id} className="p-4 bg-white shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center border-l-4 border-red-600">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{u.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{u.email}</p>
              <p className="text-sm mt-1">
                Status:
                {u.banned 
                    ? <span className="text-red-600 ml-2 font-medium">BANNED</span> 
                    : u.suspended 
                    ? <span className="text-yellow-600 ml-2 font-medium">SUSPENDED</span> 
                    : <span className="text-green-600 ml-2 font-medium">ACTIVE</span>
                }
              </p>
              <p className="text-xs text-gray-500 flex items-center">
                <CheckCheck className="w-3 h-3 mr-1 text-indigo-500" />
                Warnings: {u.warnings || 0}
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-3 md:mt-0">
              {/* Suspend/Unsuspend Toggle */}
              {!u.banned && !u.suspended && (
                <button 
                  onClick={() => confirmThen(`/api/admin/users/${u._id}/suspend`, 'PUT', null, 'Suspend this user? They will lose platform access.')} 
                  className="bg-yellow-500 hover:bg-yellow-600 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Suspend
                </button>
              )}

              {!u.banned && u.suspended && (
                <button 
                  onClick={() => confirmThen(`/api/admin/users/${u._id}/reactivate`, 'PUT', null, 'Unsuspend this user? They will regain platform access.')} 
                  className="bg-green-600 hover:bg-green-700 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Unsuspend
                </button>
              )}

              {/* Ban/Unban Toggle */}
              {!u.banned && (
                <button 
                  onClick={() => confirmThen(`/api/admin/users/${u._id}/ban`, 'PUT', null, 'WARNING: Permanently ban this user? This action is difficult to reverse.')} 
                  className="bg-red-700 hover:bg-red-800 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Ban
                </button>
              )}

              {u.banned && (
                <button 
                  onClick={() => confirmThen(`/api/admin/users/${u._id}/unban`, 'PUT', null, 'Unban this user?')} 
                  className="bg-blue-600 hover:bg-blue-700 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
                >
                  Unban
                </button>
              )}
              
              {/* Warn Action */}
              <button 
                onClick={() => warnUser(u._id)} 
                className="bg-indigo-600 hover:bg-indigo-700 transition px-3 py-1 text-white text-sm rounded-full shadow-md"
              >
                Warn
              </button>
            </div>
          </div>
        ))}
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
          onConfirm={handleConfirmAction} 
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
}