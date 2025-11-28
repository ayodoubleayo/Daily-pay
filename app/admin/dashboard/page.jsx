'use client';
import { useEffect, useState, useCallback } from "react";
import { ListChecks, ShoppingBag, MapPin, Save, Loader2, DollarSign } from 'lucide-react';
// REMOVED EXTERNAL IMPORT: The component "ProductForm" was causing a compilation error 
// because its file path was unresolvable. We define a minimal placeholder ProductForm 
// inside this file to ensure the application compiles and runs.

// Define the API base URL for robust connectivity.
// It defaults to an empty string ('') for relative API calls to the current host/backend.
const API_BASE_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) 
    ? process.env.NEXT_PUBLIC_API_URL 
    : '';

// Basic Component Styling (replacing missing global classes for readability)
const styles = {
    input: "w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition shadow-sm",
    btn: "px-4 py-2 font-semibold rounded-lg transition duration-300 shadow-md bg-red-600 hover:bg-red-700 text-white flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed",
    card: "p-6 bg-white rounded-xl shadow-lg border border-gray-100",
    header: "text-2xl font-bold mb-4 text-gray-800 flex items-center",
};

/**
 * PLACEHOLDER ProductForm Component
 * A functional component needs to be defined here to replace the missing import,
 * ensuring the SellerDashboard compiles and runs.
 * @param {object} props - Component props.
 * @param {function} props.onCreated - Callback function when a product is created.
 */
const ProductForm = ({ onCreated }) => {
    return (
        <div className={styles.card}>
            <h2 className={`${styles.header} text-xl mb-4`}>Add New Product</h2>
            <div className="text-sm text-gray-500">
                Product form logic is missing (placeholder only). 
                Please provide the actual `ProductForm` component code to enable product submission.
            </div>
            <button 
                onClick={onCreated} 
                className={styles.btn + " w-full mt-4 bg-gray-500 hover:bg-gray-600"}
            >
                Add Product (Placeholder)
            </button>
        </div>
    );
};


export default function SellerDashboard() {
  // -------------------
  // STATE: MARKET INFO
  // -------------------
  const [market, setMarket] = useState({
    shopName: "",
    shopDescription: "",
    shopLogo: "",
    phone: "",
    address: "",
    // local fields for coordinates
    location: {
      lat: null,
      lng: null,
      address: ""
    }
  });

  // -------------------
  // STATE: PRODUCTS + ORDERS
  // -------------------
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // -------------------
  // STATUS MESSAGE
  // -------------------
  const [msg, setMsg] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  // Helper to clear message after a few seconds
  useEffect(() => {
    if (msg) {
        const timer = setTimeout(() => setMsg(""), 5000);
        return () => clearTimeout(timer);
    }
  }, [msg]);


  // -------------------
  // LOAD MARKET + PRODUCTS + ORDERS
  // -------------------
  useEffect(() => {
    // Load local storage seller data first
    const s = JSON.parse(localStorage.getItem("seller"));

    if (s) {
      setMarket(prev => ({
        ...prev,
        shopName: s.shopName || "",
        shopDescription: s.shopDescription || "",
        shopLogo: s.shopLogo || "",
        phone: s.phone || "",
        address: s.address || "",
        location: s.location || prev.location
      }));
    }

    // Load data from API
    loadProducts();
    loadOrders();
  }, []);

  // -------------------
  // GET SELLER PRODUCTS
  // -------------------
  const loadProducts = useCallback(async () => {
    const token = localStorage.getItem("sellerToken");
    if (!token) return;

    try {
      // FIX: Use API_BASE_URL
      const res = await fetch(
        API_BASE_URL + "/api/sellers/me/products",
        { headers: { Authorization: "Bearer " + token } }
      );

      if (!res.ok) return;
      setProducts(await res.json());
    } catch (err) {
      console.error("loadProducts error", err);
      setMsg("Network error loading products.");
    }
  }, []);

  // -------------------
  // GET SELLER ORDERS (from transactions)
  // -------------------
  const loadOrders = useCallback(async () => {
    const token = localStorage.getItem("sellerToken");
    if (!token) return;

    try {
      // FIX: Use API_BASE_URL
      const res = await fetch(
        API_BASE_URL + "/api/sellers/me/orders",
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("loadOrders error", err);
      setMsg("Network error loading orders.");
    }
  }, []);

  // -------------------
  // Update order status (seller action)
  // -------------------
  async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem("sellerToken");
    // FIX: Replaced alert() with setMsg()
    if (!token) return setMsg("Error: Not authenticated (seller). Please log in.");

    try {
      // FIX: Use API_BASE_URL
      const res = await fetch(
        `${API_BASE_URL}/api/sellers/me/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        console.error("updateOrderStatus failed", j);
        // FIX: Replaced alert() with setMsg()
        setMsg(`Failed to update order status: ${j.error || "Server error"}`);
        return;
      }

      setMsg(`Order ${orderId} status updated to ${newStatus}.`);
      // reload orders after change
      loadOrders();

    } catch (err) {
      console.error("updateOrderStatus error", err);
      // FIX: Replaced alert() with setMsg()
      setMsg("Network error while updating status.");
    }
  }

  // -------------------
  // SAVE STORE INFO
  // -------------------
  async function saveMarket(e) {
    e.preventDefault();
    setMsg("Saving store info...");

    const token = localStorage.getItem("sellerToken");
    if (!token) {
      setMsg("No seller token. Please login.");
      return;
    }

    const bodyToSend = {
      shopName: market.shopName,
      shopDescription: market.shopDescription,
      shopLogo: market.shopLogo,
      phone: market.phone,
      address: market.address,
      location: market.location // { lat, lng, address }
    };

    try {
      // FIX: Use API_BASE_URL
      const res = await fetch(
        API_BASE_URL + "/api/sellers/me/store",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(bodyToSend)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return setMsg(data.error || "Failed to save store info");
      }

      // update localStorage seller object (persist location)
      localStorage.setItem("seller", JSON.stringify(data.seller || { ...bodyToSend }));

      setMsg("Store updated successfully!");
    } catch (err) {
      console.error("saveMarket error", err);
      setMsg("Network error saving store info");
    }
  }

  // -------------------
  // GEOLOCATION: get coords from browser
  // -------------------
  function getMyLocation() {
    if (!navigator.geolocation) {
      setMsg("Geolocation not supported by your browser");
      return;
    }

    setGettingLocation(true);
    setMsg("Getting current location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: market.address || "" // we keep any typed address
        };

        setMarket(prev => ({ ...prev, location: coords }));
        setGettingLocation(false);
        setMsg("Location captured — remember to Save Store Info to persist.");
      },
      (err) => {
        console.error("geolocation error", err);
        setMsg("Unable to get location: " + (err.message || "permission denied"));
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // -------------------
  // UI RENDER
  // -------------------
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className={`${styles.header} text-3xl`}>
        <ShoppingBag className="w-8 h-8 mr-3 text-red-600" />
        Seller Dashboard
      </h1>

      <a 
        href="/seller/bank-info" 
        className="text-blue-600 hover:text-blue-800 transition text-sm font-medium border-b border-blue-600 pb-1"
      >
        Update Bank Info
      </a>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Store Info Panel (Column 1) */}
        <div className="lg:col-span-1">
            <div className={styles.card}>
                <h2 className={`${styles.header} text-xl mb-4`}>
                    <MapPin className="w-5 h-5 mr-2" />
                    Your Store Info
                </h2>

                <form onSubmit={saveMarket} className="space-y-4">
                    <input
                        value={market.shopName}
                        onChange={(e) => setMarket({ ...market, shopName: e.target.value })}
                        placeholder="Shop Name"
                        className={styles.input}
                    />

                    <textarea
                        value={market.shopDescription}
                        onChange={(e) =>
                            setMarket({ ...market, shopDescription: e.target.value })
                        }
                        placeholder="Shop Description"
                        className={styles.input}
                        rows="3"
                    />

                    <input
                        value={market.shopLogo}
                        onChange={(e) => setMarket({ ...market, shopLogo: e.target.value })}
                        placeholder="Shop Logo URL (e.g., your-logo.png)"
                        className={styles.input}
                    />

                    <input
                        value={market.phone}
                        onChange={(e) => setMarket({ ...market, phone: e.target.value })}
                        placeholder="Phone Number"
                        className={styles.input}
                    />

                    <input
                        value={market.address}
                        onChange={(e) => setMarket({ ...market, address: e.target.value })}
                        placeholder="Shop Physical Address"
                        className={styles.input}
                    />

                    {/* LOCATION BUTTON + SHOW */}
                    <div className="pt-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Geolocation Coordinates:</p>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={getMyLocation}
                                className={styles.btn + " text-sm px-3 py-1.5 flex-grow"}
                                disabled={gettingLocation}
                            >
                                {gettingLocation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
                                {gettingLocation ? "Acquiring Location..." : "Use Browser Location"}
                            </button>
                        </div>

                        <div className="text-sm mt-2 p-2 border rounded bg-gray-50 break-words">
                            {market.location && market.location.lat
                                ? (
                                    <>
                                        <span className="font-mono text-xs">Lat: {market.location.lat.toFixed(6)}, Lng: {market.location.lng.toFixed(6)}</span>
                                        <p className="text-xs text-gray-500 mt-1">Status: Captured. Click 'Save' to persist.</p>
                                    </>
                                )
                                : "No coordinates captured (Needed for proximity searches)"}
                        </div>
                    </div>

                    <button className={styles.btn + " w-full mt-4"}>
                        <Save className="w-5 h-5 mr-2" />
                        Save Store Info
                    </button>
                </form>
            </div>
            
            {/* Product Form (Column 1 - below store info) */}
            <div className="mt-6">
                {/* Now using the local placeholder component */}
                <ProductForm onCreated={() => loadProducts()} />
            </div>
        </div>
        
        {/* Products and Orders (Columns 2 & 3) */}
        <div className="lg:col-span-2">
            
            {/* ORDERS LIST (NEW) */}
            <div className={styles.card + " mb-6"}>
                <h2 className={`${styles.header} text-xl border-b pb-2 mb-4`}>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Pending Orders ({orders.length})
                </h2>
                
                {orders.length === 0 && <div className="text-base text-gray-600 p-4 bg-gray-50 rounded-lg">No new orders yet.</div>}

                <div className="space-y-4">
                    {orders.map((tx) => {
                        const orderId = tx.orderId?._id || tx.orderId || tx._id; // fallback handling
                        const currentStatus = tx.orderStatus || tx.status || (tx.orderId && tx.orderId.status) || "pending";

                        return (
                            <div key={tx._id} className="p-4 border border-red-100 rounded-lg bg-red-50 hover:shadow-md transition duration-200">
                                <div className="flex justify-between items-start border-b pb-2 mb-2">
                                    <div>
                                        <div className="font-bold text-lg text-gray-800">Order: {orderId ? orderId.substring(0, 8) + '...' : 'N/A'}</div>
                                        <div className="text-sm text-gray-600">Buyer: {tx.userId?.name || tx.userId?.email || 'N/A'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-green-700">Total: ₦{Number(tx.totalAmount).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                                    <div className="flex items-center gap-2">
                                        <label htmlFor={`status-${tx._id}`} className="text-sm font-medium">Status:</label>
                                        <select
                                            id={`status-${tx._id}`}
                                            value={currentStatus}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value;
                                                const finalOrderId = orderId;
                                                // FIX: Replaced alert() with setMsg()
                                                if (!finalOrderId) return setMsg("Error: Order ID is missing for status update."); 
                                                await updateOrderStatus(finalOrderId, newStatus);
                                            }}
                                            className="border p-1 rounded-lg text-sm bg-white"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="transferred">Transferred</option>
                                            <option value="payment_confirmed">Payment Confirmed</option>
                                            <option value="approved">Approved</option>
                                            <option value="out for delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="successful">Successful</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                    
                                    {tx.paymentProof && (
                                        <a href={tx.paymentProof} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline font-medium">
                                            View Payment Proof
                                        </a>
                                    )}
                                </div>

                                <div className="mt-3 p-2 bg-white rounded border">
                                    <div className="font-bold text-sm mb-1">Order Items</div>
                                    <ul className="list-disc ml-5 text-xs text-gray-600 space-y-0.5">
                                        {(tx.items || []).map((it, i) => (
                                            <li key={i}>
                                                {it.name || (it.product && it.product.name) || 'Item'} x {it.qty || 1} — ₦{Number(it.price || 0).toLocaleString()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* PRODUCT LIST */}
            <div className={styles.card}>
                <h2 className={`${styles.header} text-xl border-b pb-2 mb-4`}>
                    <ListChecks className="w-5 h-5 mr-2" />
                    Your Products ({products.length})
                </h2>
                
                {products.length === 0 && <div className="text-base text-gray-600 p-4 bg-gray-50 rounded-lg">No products have been added yet.</div>}

                <div className="grid grid-cols-1 gap-4">
                    {products.map((p) => (
                        <div key={p._id} className="p-3 border rounded-lg bg-gray-50 flex items-center gap-4 hover:shadow-sm transition">
                            <img
                                src={p.image || "/placeholder.png"}
                                alt={p.name}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="flex-grow">
                                <div className="font-semibold text-gray-800">{p.name}</div>
                                <div className="text-sm text-green-700 font-medium">₦{Number(p.price).toLocaleString()}</div>
                            </div>
                            {/* You would add Edit/Delete buttons here if needed */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Global Status Message */}
      <p className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-3 rounded-xl shadow-2xl transition-opacity duration-300 font-semibold ${msg ? 'opacity-100 bg-green-100 text-green-800 border border-green-300' : 'opacity-0 pointer-events-none'}`}>
        {msg}
      </p>
    </div>
  );
}