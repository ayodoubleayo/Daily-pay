'use client';
import { useEffect, useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_SECRET_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SECRET;

// ---- FIXED useMessage() ----
const useMessage = () => {
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const showMessage = useCallback((msg, isErr = false) => {
        setIsError(isErr);
        setMessage(msg);
        setTimeout(() => setMessage(''), 5000);
    }, []);

    return { message, isError, showMessage };
};

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
    const [assigning, setAssigning] = useState({});
    const [selectedRider, setSelectedRider] = useState({});
    const { message, isError, showMessage } = useMessage();

    // ---- FIX: showMessage is now STABLE so callbacks stop looping ----
    const loadOrders = useCallback(async () => {
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/api/orders`, {
                headers: { "x-admin-secret": secret }
            });

            if (!res.ok) {
                showMessage(`Error loading orders: Status ${res.status}`, true);
                setOrders([]);
                return;
            }

            const data = await res.json();
            setOrders(Array.isArray(data) ? data : data.orders || []);
        } catch {
            showMessage('Network error loading orders.', true);
            setOrders([]);
        }
    }, [showMessage]);

    const loadRiders = useCallback(async () => {
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/api/riders`, {
                headers: { "x-admin-secret": secret }
            });

            if (!res.ok) {
                showMessage(`Error loading riders: Status ${res.status}`, true);
                setRiders([]);
                return;
            }

            const data = await res.json();
            setRiders(Array.isArray(data) ? data : data.riders || []);
        } catch {
            showMessage('Network error loading riders.', true);
            setRiders([]);
        }
    }, [showMessage]);

    useEffect(() => {
        async function loadAll() {
            setLoading(true);
            await Promise.all([loadOrders(), loadRiders()]);
            setLoading(false);
        }
        loadAll();
    }, [loadOrders, loadRiders]);

    async function markTransferred(id) {
        setLoading(true);
        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/api/orders/${id}/mark-transferred`, {
                method: "POST",
                headers: { "x-admin-secret": secret }
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed");
            }

            await loadOrders();
            showMessage(`Order ${id} marked as ready for pickup!`);
        } catch (err) {
            showMessage(`Failed: ${err.message}`, true);
        } finally {
            setLoading(false);
        }
    }

    async function assignRider(orderId) {
        const riderId = selectedRider[orderId];
        if (!riderId) return showMessage("Please select a rider first.", true);

        setAssigning(prev => ({ ...prev, [orderId]: true }));

        try {
            const secret = ADMIN_SECRET_TOKEN;
            const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/assign-rider`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-secret": secret
                },
                body: JSON.stringify({ riderId })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Assignment failed");
            }

            await Promise.all([loadOrders(), loadRiders()]);
            showMessage(`Rider assigned to Order ${orderId}!`);
        } catch (err) {
            showMessage(`Error: ${err.message}`, true);
        } finally {
            setAssigning(prev => ({ ...prev, [orderId]: false }));
        }
    }

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
                    {/* your card UI remains untouched */}
                </div>
            )}

            {message && (
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-xl shadow-2xl font-semibold z-50 ${
                    isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {message}
                </div>
            )}
        </div>
    );
}
