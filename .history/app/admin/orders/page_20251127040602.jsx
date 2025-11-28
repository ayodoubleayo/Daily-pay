'use client';
import { useEffect, useState, useCallback } from 'react';

// *** 🚨 USER ACTION REQUIRED: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL VALUES ***
const API_BASE_URL = "http://localhost:3000/api"; 
const ADMIN_SECRET_TOKEN = "your-very-secure-admin-secret-token-here";
// ---------------------------------------------------------------------------------

// Simple Alert replacement (since alert() is forbidden)
const useMessage = () => {
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const showMessage = (msg, isErr = false) => {
        setIsError(isErr);
        setMessage(msg);
        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000); 
    };

    return { message, isError, showMessage };
};

// Component for rendering a loading spinner
const LoadingSpinner = ({ text = "Loading..." }) => (
    <div className="flex items-center justify-center space-x-2 text-gray-600">
        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
    </div>
);


export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState({}); // { [orderId]: boolean }
    const [selectedRider, setSelectedRider] = useState({}); // { [orderId]: riderId }
    const { message, isError, showMessage } = useMessage();


    // Fetches all orders from the backend
    const loadOrders = useCallback(async () => {
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/orders`, { 
                headers: { 'x-admin-secret': secret }
            });
            if (!res.ok) {
                console.warn('Could not load orders', res.status);
                showMessage(`Error loading orders: Status ${res.status}`, true);
                setOrders([]);
                return;
            }
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : (data.orders || []));
        } catch (err) {
            console.error('loadOrders error', err);
            showMessage('Network error loading orders.', true);
            setOrders([]);
        }
    }, [showMessage]);

    // Fetches all riders from the backend
    const loadRiders = useCallback(async () => {
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/riders`, { 
                headers: { 'x-admin-secret': secret }
            });
            if (!res.ok) {
                console.warn('Could not load riders', res.status);
                showMessage(`Error loading riders: Status ${res.status}`, true);
                setRiders([]);
                return;
            }
            const data = await res.json();
            setRiders(Array.isArray(data) ? data : (data.riders || []));
        } catch (err) {
            console.error('loadRiders error', err);
            showMessage('Network error loading riders.', true);
            setRiders([]);
        }
    }, [showMessage]);

    // Loads both orders and riders concurrently on initial mount
    useEffect(() => { 
        async function loadAll() {
            setLoading(true);
            await Promise.all([loadOrders(), loadRiders()]);
            setLoading(false);
        }
        loadAll();
    }, [loadOrders, loadRiders]);

    // Marks an order as transferred (ready for rider pickup)
    async function markTransferred(id) {
        setLoading(true);
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/orders/${id}/mark-transferred`, {
                method: 'POST',
                headers: { 'x-admin-secret': secret }
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Mark transferred failed');
            }

            // Reload orders to reflect the status change
            await loadOrders();
            showMessage(`Order ${id} marked as ready for pickup!`);
        } catch (err) {
            console.error('markTransferred', err);
            showMessage(`Failed to mark order: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    }

    // Assigns a selected rider to an order
    async function assignRider(orderId) {
        const riderId = selectedRider[orderId];
        if (!riderId) {
            return showMessage('Please select a rider first.', true);
        }
        
        setAssigning(prev => ({ ...prev, [orderId]: true }));
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/orders/${orderId}/assign-rider`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
                body: JSON.stringify({ riderId })
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMessage = errorData.error || 'Assignment failed due to server error.';
                throw new Error(errorMessage);
            }

            // Reload all data (orders and riders) to reflect the new assignment and potentially rider status change
            await Promise.all([loadOrders(), loadRiders()]);
            showMessage(`Rider assigned successfully to Order ${orderId}!`);
        } catch (err) {
            console.error('assignRider', err);
            showMessage(`Could not assign rider: ${err.message}`, true);
        } finally {
            setAssigning(prev => ({ ...prev, [orderId]: false }));
        }
    }

    // Helper to determine badge color based on order status
    const getStatusColor = (status) => {
        switch (status) {
            case 'successful':
            case 'delivered':
                return 'bg-green-500 text-white';
            case 'processing':
            case 'pending':
                return 'bg-yellow-500 text-yellow-900';
            case 'rider_assigned':
            case 'transferred':
                return 'bg-blue-500 text-white';
            case 'cancelled':
            case 'failed':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-300 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Orders Management</h1>
            
            {loading && <LoadingSpinner text="Loading orders and riders..." />}

            {!loading && (
                <div className="grid gap-4">
                    {orders.map(o => (
                        <div key={o._id} className="p-4 bg-white rounded-xl shadow-lg border-l-4 border-blue-500 transition hover:shadow-xl">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="font-bold text-lg text-gray-800">Order #{o._id}</div>
                                    <div className={`text-xs font-semibold px-2 py-0.5 inline-block rounded-full mt-1 ${getStatusColor(o.status)}`}>
                                        {o.status.toUpperCase().replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-sm mt-2">
                                        Total: <span className="font-bold text-green-700">₦{Number(o.total).toLocaleString()}</span>
                                    </div>

                                    {o.rider?.name ? (
                                        <div className="text-sm mt-2 p-2 bg-blue-50 rounded">
                                            <strong className="text-blue-700">Rider Assigned:</strong> {o.rider.name} ({o.rider.phone})
                                        </div>
                                    ) : (
                                        <div className="text-sm mt-2 p-2 bg-yellow-50 rounded text-yellow-800">No rider assigned yet.</div>
                                    )}

                                    {/* Shipping summary */}
                                    {o.meta?.shipping && (
                                        <div className="mt-3 text-xs bg-gray-50 p-3 rounded border">
                                            <div className="font-semibold text-gray-700">Shipping Details:</div>
                                            <div className="text-gray-600">Method: {o.meta.shipping.method || 'Pickup'} | Fee: ₦{Number(o.meta.shipping.fee || 0).toLocaleString()}</div>
                                            {o.meta.shipping.details && (
                                                <div className="mt-1">
                                                    <div><span className="font-medium">Recipient:</span> {o.meta.shipping.details.name} ({o.meta.shipping.details.phone})</div>
                                                    <div><span className="font-medium">Address:</span> {o.meta.shipping.details.address}, {o.meta.shipping.details.city}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                                    {/* Rider Assignment Controls */}
                                    <div className="flex flex-col gap-1 w-full">
                                        <select
                                            value={selectedRider[o._id] || ''}
                                            onChange={(e) => setSelectedRider(prev => ({ ...prev, [o._id]: e.target.value }))}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full"
                                            disabled={assigning[o._id] || o.status !== 'processing'}
                                        >
                                            <option value="">-- Assign Rider --</option>
                                            {riders.map(r => (
                                                <option key={r._id} value={r._id}>
                                                    {r.name} {r.status === 'busy' ? ' (BUSY)' : ' (Ready)'}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={() => assignRider(o._id)}
                                            className="w-full px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:shadow-none text-sm"
                                            disabled={assigning[o._id] || !selectedRider[o._id] || o.status !== 'processing'}
                                        >
                                            {assigning[o._id] ? 'Assigning…' : 'Assign Rider'}
                                        </button>
                                    </div>

                                    {/* Mark Transferred Button */}
                                    {(o.status === 'processing' || o.status === 'pending') && (
                                        <button 
                                            onClick={() => markTransferred(o._id)} 
                                            className="w-full px-3 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 text-sm"
                                            disabled={loading}
                                        >
                                            Mark Transferred
                                        </button>
                                    )}
                                    
                                    <div className="text-xs text-gray-500 mt-2">Placed: {new Date(o.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && !loading && (
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg text-gray-500">
                            No orders found.
                        </div>
                    )}
                </div>
            )}
            
            {/* Global Message Box */}
            {message && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl transition-opacity duration-300 font-semibold text-center z-50 max-w-lg w-full ${isError ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-green-100 text-green-800 border border-green-300'}`}>
                    {message}
                </div>
            )}
        </div>
    );
}