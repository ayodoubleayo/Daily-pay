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
  // MESSAGES
  // -------------------
  const [msg, setMsg] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  // -------------------
  // LOAD DATA
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
    loadOrders();
  }, []);

  // -------------------
  // GET PRODUCTS
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
  // GET ORDERS
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
  // SAVE STORE INFO
  // -------------------
  async function saveMarket(e) {
    e.preventDefault();
    setMsg("Saving store info...");

    const token = localStorage.getItem("sellerToken");
    if (!token) return setMsg("No seller token. Please login.");

    const bodyToSend = {
      shopName: market.shopName,
      shopDescription: market.shopDescription,
      shopLogo: market.shopLogo,
      phone: market.phone,
      address: market.address,
      location: market.location
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
      if (!res.ok) return setMsg(data.error || "Failed to save store info");

      localStorage.setItem("seller", JSON.stringify(data.seller || { ...bodyToSend }));
      setMsg("Store updated successfully!");
    } catch (err) {
      console.error("saveMarket error", err);
      setMsg("Network error saving store info");
    }
  }

  // -------------------
  // GEOLOCATION
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
          address: market.address || ""
        };

        setMarket(prev => ({ ...prev, location: coords }));
        setGettingLocation(false);
        setMsg("Location captured — remember to Save Store Info.");
      },
      (err) => {
        console.error(err);
        setMsg("Unable to get location: " + err.message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // -------------------
  // UI
  // -------------------
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 bg-transparent">

        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>

        <a href="/seller/bank-info" className="underline text-blue-600">
          Update Bank Info
        </a>

        {/* STORE INFO */}
        <div className="p-4 border rounded mb-8">
          <h2 className="text-xl font-bold mb-2">Your Store / office Info</h2>

          <form onSubmit={saveMarket} className="space-y-2">
            <input
              value={market.shopName}
              onChange={(e) => setMarket({ ...market, shopName: e.target.value })}
              placeholder="office /Shop Name"
              className="input"
            />

            <textarea
              value={market.shopDescription}
              onChange={(e) =>
                setMarket({ ...market, shopDescription: e.target.value })
              }
              placeholder="office /Shop Description"
              className="input"
            />

            <input
              value={market.shopLogo}
              onChange={(e) => setMarket({ ...market, shopLogo: e.target.value })}
              placeholder="office /Shop Logo URL"
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
              placeholder="office /Shop Address"
              className="input"
            />

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
                {market.location?.lat
                  ? `Lat: ${market.location.lat.toFixed(6)}, Lng: ${market.location.lng.toFixed(6)}`
                  : "No coordinates captured"}
              </div>
            </div>

            <button className="btn">Save office/Store Info</button>
          </form>
        </div>

        {/* PRODUCT FORM */}
        <ProductForm onCreated={loadProducts} />

        {/* PRODUCT LIST */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <h2 className="text-xl font-bold">Your Products/ jobs</h2>
          {products.length === 0 && (
            <div className="text-sm text-gray-600">No products / jobs yet</div>
          )}

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

        {/* ORDERS */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">Orders Purchases/ hired</h2>

          {orders.length === 0 && (
            <div className="text-sm text-gray-600">No orders /hired yet</div>
          )}

          <div className="space-y-3">
            {orders.map((tx) => (
              <div key={tx._id} className="p-3 border rounded bg-white">

                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">
                      Order: {tx.orderId?._id || "N/A"}
                    </div>
                    <div className="text-sm">
                      Buyer: {tx.userId?.name || tx.userId?.email || "N/A"}
                    </div>
                    <div className="text-sm">Status: {tx.status}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm">
                      Total: ₦{Number(tx.totalAmount).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      To seller: ₦{Number(tx.amountToSeller).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="mt-2">
                  <div className="font-medium">Items</div>
                  <ul className="list-disc ml-5 text-sm">
                    {(tx.items || []).map((it, i) => (
                      <li key={i}>
                        {it.name ||
                          (it.product && it.product.name) ||
                          "Item"}{" "}
                        x {it.qty || 1} — ₦
                        {Number(it.price || 0).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ⭐⭐⭐ SHIPPING DETAILS (ADDED HERE) ⭐⭐⭐ */}
                {((tx.shipping) ||
                  (tx.orderId?.meta?.shipping)) && (
                  <div className="mt-3 text-sm border-t pt-2">

                    <div className="font-medium">Shipping Details</div>

                    <div>
                      Method:{" "}
                      <strong>
                        {tx.shipping?.method ||
                          tx.orderId?.meta?.shipping?.method ||
                          "pickup"}
                      </strong>
                    </div>

                    <div>
                      Fee: ₦
                      {Number(
                        tx.shipping?.fee ||
                        tx.orderId?.meta?.shipping?.fee ||
                        0
                      ).toLocaleString()}
                    </div>

                    {/* SHIPPING ADDRESS */}
                    {(tx.shipping?.details ||
                      tx.orderId?.meta?.shipping?.details) && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div>
                          {tx.shipping?.details?.name ||
                            tx.orderId?.meta?.shipping?.details?.name}
                        </div>
                        <div>
                          {tx.shipping?.details?.phone ||
                            tx.orderId?.meta?.shipping?.details?.phone}
                        </div>
                        <div>
                          {tx.shipping?.details?.address ||
                            tx.orderId?.meta?.shipping?.details?.address}{" "}
                          {tx.shipping?.details?.city ||
                            tx.orderId?.meta?.shipping?.details?.city ||
                            ""}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STATUS SELECT */}
                <div className="mt-3">
                  <label className="text-sm font-semibold mr-2">
                    Update status:
                  </label>

                  <select
                    value={tx.status}
                    onChange={async (e) => {
                      const token = localStorage.getItem("sellerToken");
                      await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/sellers/me/orders/${tx.orderId?._id}/status`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + token
                          },
                          body: JSON.stringify({ status: e.target.value })
                        }
                      );
                      loadOrders();
                    }}
                    className="border p-1 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="out for delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {tx.paymentProof && (
                  <div className="mt-2 text-sm">
                    Proof:{" "}
                    <a
                      href={tx.paymentProof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600"
                    >
                      View
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-green-700">{msg}</p>
      </div>
    </div>
  );
}
