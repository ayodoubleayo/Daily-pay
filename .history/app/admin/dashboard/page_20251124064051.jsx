// app/seller/dashboard/page.jsx
'use client';
import { useEffect, useState } from "react";
import ProductForm from "../../../components/ProductForm";

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
  const [orders, setOrders] = useState([]); // NEW

  // -------------------
  // STATUS MESSAGE
  // -------------------
  const [msg, setMsg] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  // -------------------
  // LOAD MARKET + PRODUCTS + ORDERS
  // -------------------
  useEffect(() => {
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

    loadProducts();
    loadOrders(); // NEW
  }, []);

  // -------------------
  // GET SELLER PRODUCTS
  // -------------------
  async function loadProducts() {
    const token = localStorage.getItem("sellerToken");
    if (!token) return;

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/sellers/me/products",
        { headers: { Authorization: "Bearer " + token } }
      );

      if (!res.ok) return;
      setProducts(await res.json());
    } catch (err) {
      console.error("loadProducts error", err);
    }
  }

  // -------------------
  // GET SELLER ORDERS (from transactions)
  // -------------------
  async function loadOrders() {
    const token = localStorage.getItem("sellerToken");
    if (!token) return;

    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/sellers/me/orders",
        { headers: { Authorization: "Bearer " + token } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("loadOrders error", err);
    }
  }

  // -------------------
  // Update order status (seller action)
  // -------------------
  async function updateOrderStatus(orderId, newStatus) {
    const token = localStorage.getItem("sellerToken");
    if (!token) return alert("Not authenticated (seller).");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sellers/me/orders/${orderId}/status`,
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
        alert(j.error || "Failed to update order status");
        return;
      }

      // reload orders after change
      loadOrders();

    } catch (err) {
      console.error("updateOrderStatus error", err);
      alert("Network error while updating status");
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
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/sellers/me/store",
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>

      <a href="/seller/bank-info" className="underline text-blue-600">
        Update Bank Info
      </a>

      {/* STORE / MARKET INFO */}
      <div className="p-4 border rounded mb-8">
        <h2 className="text-xl font-bold mb-2">Your Store / Market Info</h2>

        <form onSubmit={saveMarket} className="space-y-2">
          <input
            value={market.shopName}
            onChange={(e) => setMarket({ ...market, shopName: e.target.value })}
            placeholder="Shop Name"
            className="input"
          />

          <textarea
            value={market.shopDescription}
            onChange={(e) =>
              setMarket({ ...market, shopDescription: e.target.value })
            }
            placeholder="Shop Description"
            className="input"
          />

          <input
            value={market.shopLogo}
            onChange={(e) => setMarket({ ...market, shopLogo: e.target.value })}
            placeholder="Shop Logo URL"
            className="input"
          />

          <input
            value={market.phone}
            onChange={(e) => setMarket({ ...market, phone: e.target.value })}
            placeholder="Phone Number"
            className="input"
          />

          <input
            value={market.address}
            onChange={(e) => setMarket({ ...market, address: e.target.value })}
            placeholder="Shop Address"
            className="input"
          />

          {/* LOCATION BUTTON + SHOW */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={getMyLocation}
              className="btn"
              disabled={gettingLocation}
            >
              {gettingLocation ? "Getting…" : "Get my location"}
            </button>

            <div className="text-sm">
              {market.location && market.location.lat
                ? `Lat: ${market.location.lat.toFixed(6)}, Lng: ${market.location.lng.toFixed(6)}`
                : "No coordinates captured"}
            </div>
          </div>

          <button className="btn">Save Store Info</button>
        </form>
      </div>

      {/* PRODUCT FORM (ONLY ONE) */}
      <ProductForm onCreated={() => loadProducts()} />

      {/* PRODUCT LIST */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <h2 className="text-xl font-bold">Your Products</h2>
        {products.length === 0 && <div className="text-sm text-gray-600">No products yet</div>}
        {products.map((p) => (
          <div key={p._id} className="p-3 border rounded">
            <div className="flex items-center gap-4">
              <img
                src={p.image || "/placeholder.png"}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{p.name}</div>
                <div>₦{p.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ORDERS LIST (NEW) */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Orders / Purchases (for your store)</h2>
        {orders.length === 0 && <div className="text-sm text-gray-600">No orders yet</div>}

        <div className="space-y-3">
          {orders.map((tx) => {
            const orderId = tx.orderId?._id || tx.orderId || tx._id; // fallback handling
            const currentStatus = tx.orderStatus || tx.status || (tx.orderId && tx.orderId.status) || "pending";

            return (
              <div key={tx._id} className="p-3 border rounded bg-white">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">Order: {orderId || 'N/A'}</div>
                    <div className="text-sm">Buyer: {tx.userId?.name || tx.userId?.email || 'N/A'}</div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm">Status:</div>

                      {/* <-- SELECT inserted here (STEP 3) */}
                      <select
                        value={currentStatus}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          // pick the real order id (orderId._id if available)
                          const finalOrderId = orderId;
                          if (!finalOrderId) return alert("Order id missing");
                          await updateOrderStatus(finalOrderId, newStatus);
                        }}
                        className="border p-1 rounded"
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

                  </div>
                  <div className="text-right">
                    <div className="text-sm">Total: ₦{Number(tx.totalAmount).toLocaleString()}</div>
                    <div className="text-sm">To seller: ₦{Number(tx.amountToSeller).toLocaleString()}</div>
                    <div className="text-sm">{new Date(tx.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="font-medium">Items</div>
                  <ul className="list-disc ml-5 text-sm">
                    {(tx.items || []).map((it, i) => (
                      <li key={i}>
                        {it.name || (it.product && it.product.name) || 'Item'} x {it.qty || 1} — ₦{Number(it.price || 0).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>

                {tx.paymentProof && (
                  <div className="mt-2 text-sm">
                    Proof: <a href={tx.paymentProof} target="_blank" rel="noreferrer" className="text-blue-600">View</a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm text-green-700">{msg}</p>
    </div>
  );
}
