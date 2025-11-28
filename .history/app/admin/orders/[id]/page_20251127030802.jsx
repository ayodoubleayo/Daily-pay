import { useEffect, useState, useRef, useCallback } from "react";

// *** 🚨 USER ACTION REQUIRED: REPLACE THIS WITH YOUR ACTUAL API BASE URL ***
const API_BASE_URL = "http://localhost:3000/api"; 
// -------------------------------------------------------------------------

// Mock for ProtectedRoute and useAuth to ensure standalone compilation.
// In a real environment, you would import these from your auth context/library.
const ProtectedRoute = ({ children }) => <div className="p-4 bg-white rounded-xl shadow-lg">{children}</div>;
const useAuth = () => ({
    // Replace with actual user context hook (e.g., from Firebase or your session)
    token: "mock-user-token-123", // Must be a valid JWT or auth token
    authLoading: false, 
    userId: "mock-user-id-001"
});

// Since we cannot use next/navigation's useParams, we'll use a placeholder variable.
// *** 🚨 USER ACTION REQUIRED: This variable should be dynamically set by your router (e.g., useParams().orderId) ***
const PLACEHOLDER_ORDER_ID = "ORD-000-LIVE"; 
// -------------------------------------------------------------------------


// Simple Alert replacement (since alert() is forbidden)
const useMessage = () => {
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const showMessage = (msg, isErr = false) => {
        setIsError(isErr);
        setMessage(msg);
        setTimeout(() => setMessage(''), 5000);
    };

    return { message, isError, showMessage };
};


export default function UserOrderTrackingPage() {
  // Use the placeholder, instructing user to replace this in a real app
  const orderId = PLACEHOLDER_ORDER_ID; 
  const { token, authLoading } = useAuth(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyCancel, setBusyCancel] = useState(false);
  const pollRef = useRef(null);
  const { message, isError, showMessage } = useMessage();
  
  // Custom confirm replacement (since confirm() is forbidden)
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState("");


  // Function to fetch the real order data from the backend
  const fetchOrder = useCallback(async () => {
    if (!orderId || !token || authLoading) return; 

    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/track`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Securely pass the auth token
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to fetch order ${orderId}`);
      }
      
      const data = await res.json();
      setOrder(data); // Set the real order data from the API
      
    } catch (err) {
      console.error("fetchOrder error", err);
      // Only show error on the first load if nothing is displayed
      if (!order) {
          showMessage("Failed to load order tracking details. Please try again.", true);
      }
      // If order is already loaded, silently fail on polling
    } finally {
      setLoading(false);
    }
  }, [orderId, token, authLoading, showMessage, order]);

  // Wait for token + authLoading to finish and start polling
  useEffect(() => {
    if (!orderId || !token || authLoading) return; 
    
    // Initial fetch
    fetchOrder();

    // Set up polling (interval) to get real-time updates from backend
    // Stop polling if the order is completed, cancelled, or failed
    if (order && ["delivered", "successful", "cancelled", "failed"].includes(order.status)) {
         clearInterval(pollRef.current);
         return;
    }
    
    pollRef.current = setInterval(fetchOrder, 5000); // Poll every 5 seconds
    return () => clearInterval(pollRef.current);
  }, [orderId, token, authLoading, fetchOrder, order]); 

  // Function to initiate the custom confirmation dialog
  const handleCancelConfirmation = (orderIdToCancel) => {
    setConfirmMessage(
      "Cancel delivery?\n\nIf the rider has already picked up your package you may be charged and the rider receives compensation.\n\nContinue?"
    );
    setConfirmCallback(() => (confirmed) => {
        setShowConfirm(false);
        if (confirmed) {
            cancelOrder(orderIdToCancel);
        }
    });
    setShowConfirm(true);
  };
  
  async function cancelOrder(orderIdToCancel) {
    if (!token || authLoading) return;

    setBusyCancel(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderIdToCancel}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Cancellation failed for order ${orderIdToCancel}`);
      }

      const cancelledOrderData = await res.json();
      
      // Update state with the cancelled order data returned from the API
      setOrder(cancelledOrderData); 
      clearInterval(pollRef.current); // Stop polling after successful cancellation
      
      showMessage(
        `Order cancelled successfully.` + 
        (cancelledOrderData.riderCompensation ? ` Rider compensation: ₦${cancelledOrderData.riderCompensation.toLocaleString()}.` : '')
      );
      
    } catch (err) {
      console.error("cancel error", err);
      showMessage("Cancel failed: " + err.message, true);
    } finally {
      setBusyCancel(false);
    }
  }

  // --- Rendering Guards ---

  if (authLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Checking login…</span>
        </div>
      </div>
    );
  }
  
  if (!token) {
     return (
        <div className="p-6 text-center text-red-600">
            Authentication Required.
        </div>
    );
  }

  if (loading) {
    return (
        <ProtectedRoute>
            <div className="p-6 text-center text-gray-600">
                <svg className="animate-bounce h-6 w-6 text-green-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004 12 8.001 8.001 0 0019.356 5.292m-4.586-2.651l-1.071 1.071m1.071-1.071l1.071-1.071M7.414 4.146l-1.071-1.071m1.071 1.071L7.414 4.146"></path>
                </svg>
                Loading order…
            </div>
        </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center text-red-600 font-semibold">
            Order not found for ID: {orderId}. Check the URL parameter.
        </div>
      </ProtectedRoute>
    );
  }

  // Use the progress from the API (riderProgress.percent)
  const progress = order?.riderProgress?.percent ?? 0;
  const shippingStatus = order.shippingStatus || "not_assigned";
  // The order is cancellable if it hasn't been successfully completed, failed, or already cancelled.
  const isCancellable = shippingStatus !== "cancelled_with_fee" &&
                        shippingStatus !== "cancelled_no_fee" &&
                        !["failed", "successful", "delivered", "cancelled"].includes(order.status);


  // --- Helper Components ---

  const OrderSummary = () => (
    <div className="border rounded-xl p-6 mb-6 bg-white shadow-md">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">Order Details</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
            <DetailItem label="Order ID" value={order._id} />
            <DetailItem label="Status" value={order.status} isStatus={true} />
            <DetailItem label="Shipping Method" value={order.shipping?.method || "Pickup"} />
            <DetailItem label="Shipping Fee" value={`₦${(order.shipping?.fee || 0).toLocaleString()}`} />
            <DetailItem label="Shipping Status" value={shippingStatus} />
            <DetailItem label="Date Placed" value={new Date(order.createdAt).toLocaleDateString()} />
        </div>

        <h3 className="text-lg font-semibold text-gray-700 mt-4 pt-2 border-t">Items</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {(order.items || []).map((item, index) => (
                <li key={index} className="flex justify-between">
                    <span>{item.name} x {item.qty}</span>
                    <span className="font-medium">₦{(item.price * item.qty).toLocaleString()}</span>
                </li>
            ))}
        </ul>
    </div>
  );

  const DetailItem = ({ label, value, isStatus = false }) => (
    <div className="flex flex-col">
        <span className="font-medium text-gray-500 text-xs uppercase">{label}</span>
        <span className={`font-semibold ${isStatus ? statusColor(value) : 'text-gray-800'}`}>{value}</span>
    </div>
  );

  const statusColor = (status) => {
    switch (status) {
        case 'delivered':
        case 'successful':
            return 'text-green-600';
        case 'cancelled':
        case 'failed':
            return 'text-red-600';
        case 'processing':
        case 'rider_assigned':
            return 'text-yellow-600';
        default:
            return 'text-blue-600';
    }
  };


  // --- Main Render ---

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-[80vh] bg-gray-50 rounded-xl">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
            🚚 Order Tracking
        </h1>

        <OrderSummary />

        {/* Progress Bar */}
        <div className="mb-6 p-5 bg-white rounded-xl shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Delivery Progress</h3>
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                <div
                    className="h-4 bg-green-500 transition-all duration-1000 ease-out flex items-center justify-center"
                    style={{ width: `${progress}%` }}
                >
                    <span className="text-xs font-bold text-white mix-blend-difference">{progress}%</span>
                </div>
            </div>
            <div className="text-sm text-gray-600 mt-2 text-right font-medium">
                {shippingStatus.replace(/_/g, ' ')}
            </div>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
            {isCancellable && (
                <button
                    onClick={() => handleCancelConfirmation(order._id)}
                    disabled={busyCancel}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-200 disabled:bg-gray-400"
                >
                    {busyCancel ? "Cancelling…" : "Cancel Delivery"}
                </button>
            )}

            <a
                href="/products"
                className="flex-1 text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
            >
                Continue Shopping
            </a>
        </div>
        
        {/* Custom Confirmation Modal */}
        {showConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                    <h3 className="text-xl font-bold text-red-700 mb-4">Confirm Cancellation</h3>
                    <p className="text-gray-700 whitespace-pre-wrap mb-6">{confirmMessage}</p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => confirmCallback(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                            No, Keep Order
                        </button>
                        <button
                            onClick={() => confirmCallback(true)}
                            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Global Message Box */}
        {message && (
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-xl shadow-2xl transition-opacity duration-300 font-semibold text-center z-40 ${isError ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
                {message}
            </div>
        )}
      </div>
    </ProtectedRoute>
  );
}