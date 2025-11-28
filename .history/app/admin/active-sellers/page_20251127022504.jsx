'use client';
import { useEffect, useState, useCallback, useEffect as useUIEffect } from 'react';
import { Clock, UserCheck, Zap, XCircle } from 'lucide-react';

// --- UI Helper Components (Reuses logic for better UX and avoiding alert/confirm) ---

/**
 * Custom Status Message component to replace alert() for showing errors/successes
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

// --- Main Component ---

export default function ActiveSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { text, type }

  // Custom alert handler
  const showAlert = useCallback((text, type = 'info') => {
    setMessage({ text, type });
  }, []);

  const resetMessage = useCallback(() => setMessage(null), []);

  /**
   * Fetches the list of active sellers, ensuring the admin secret header is included.
   * ⚠️ SECURITY FIX applied here.
   */
  const loadSellers = useCallback(async () => {
    setLoading(true);
    try {
      const secret = localStorage.getItem('adminSecret');
      
      if (!secret) {
        showAlert('Admin Secret not found. Authorization failed. Please log in.', 'error');
        setSellers([]);
        setLoading(false);
        return;
      }
      
      const headers = { 
        'Content-Type': 'application/json',
        'x-admin-secret': secret 
      };

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + '/api/admin/active-sellers',
        { headers }
      );

      if (!res.ok) {
        const errorData = await res.json();
        showAlert(errorData.error || 'Failed to fetch sellers. Authorization denied.', 'error');
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


  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2 flex items-center">
        <UserCheck className="w-6 h-6 mr-2 text-red-600" />
        Active Sellers Today
      </h1>
      
      <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg mb-6 flex items-center">
        <Zap className="w-5 h-5 mr-3" />
        <p className="text-sm">
          This panel shows sellers who have interacted with the platform within the last hour.
        </p>
      </div>

      {loading && (
        <div className="p-6 text-center text-blue-500 bg-white rounded-lg shadow">
            Loading active sellers data...
        </div>
      )}

      {!loading && sellers.length === 0 && message?.type !== 'error' && (
         <div className="p-6 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 mr-3" />
            No sellers detected as active currently.
        </div>
      )}

      <div className="grid gap-3">
        {sellers.map(s => (
          <div key={s._id} className="p-4 bg-white shadow-lg rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-4 border-red-600">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{s.shopName || s.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{s.email}</p>
            </div>
            
            <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-red-600" />
                <p>Last Active: <span className="font-medium">{new Date(s.lastActive).toLocaleString()}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Status Message */}
      <StatusMessage 
        message={message?.text} 
        type={message?.type} 
        onClose={resetMessage} 
      />
    </div>
  );
}