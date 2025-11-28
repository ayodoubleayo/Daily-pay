"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "../../context/CartContext";

/**
 * Improved Checkout page
 * - safer sellerId extraction (prevents [object Object])
 * - clearer fallbacks when coords missing
 * - sends shipping.method, shipping.fee, shipping.details, and coords (if available)
 */

export default function CheckoutPage() {
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState("");
  const [shippingMethod, setShippingMethod] = useState("pickup");
  const [fees, setFees] = useState({ pickupFee: 0, deliveryFee: 0 });
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);

  const router = useRouter();
  const { cart, clearCart } = useContext(CartContext);

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    const tk = localStorage.getItem("token");
    const usr = localStorage.getItem("user");
    if (!tk || !usr) {
      alert("Please login to continue checkout");
      router.push("/login");
      return;
    }
    setToken(tk);
    setUser(JSON.parse(usr));
    fetchFees();
  }, [ready, router]);

  // get admin settings (fallback fees)
  async function fetchFees() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/public`);
      if (!res.ok) {
        console.warn("Could not load settings/public; using zeros");
        return;
      }
      const data = await res.json();
      setFees({
        pickupFee: Number(data.pickupFee ?? 0),
        deliveryFee: Number(data.deliveryFee ?? 0)
      });
    } catch (err) {
      console.error("Failed to load fees", err);
    }
  }

  // call backend shipping calc with coords
  async function fetchShippingByCoords(sellerLat, sellerLng, userLat, userLng) {
    try {
      // backend expects numbers
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shipping/calc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerLat: Number(sellerLat),
          sellerLng: Number(sellerLng),
          userLat: Number(userLat),
          userLng: Number(userLng),
        }),
      });
      if (!res.ok) throw new Error("Failed to calc shipping");
      const data = await res.json();
      if (data?.fare != null) {
        setFees(prev => ({ ...prev, deliveryFee: Number(data.fare) }));
        setEstimatedMinutes(data.estimatedMinutes || 0);
      }
      return data;
    } catch (err) {
      console.error("shipping calc error", err);
      return null;
    }
  }

  // when user selects delivery, try to get geolocation and calculate fare (if seller coords exist)
  async function onSelectDelivery() {
    const sellerCoords = cart[0]?.sellerLocation || cart[0]?.seller?.location;
    if (!sellerCoords || sellerCoords.lat == null || sellerCoords.lng == null) {
      console.warn("Seller coords missing: cannot calculate real delivery fee. Using admin/default fee.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation not supported. Using default delivery fee.");
      return;
    }

    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });

      await fetchShippingByCoords(sellerCoords.lat, sellerCoords.lng, pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      console.warn("Could not get user location for shipping calc, using default fees", err);
    }
  }

  // watch shippingMethod
  useEffect(() => {
    if (shippingMethod === "delivery") onSelectDelivery();
    else setEstimatedMinutes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod]);

  const subtotal = cart.reduce((s, it) => s + Number(it.price || 0) * (it.qty || 1), 0);
  const chosenFee = shippingMethod === "delivery" ? fees.deliveryFee : fees.pickupFee;
  const total = Math.round(subtotal + Number(chosenFee || 0));

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function uploadFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setPaymentProof(data.url);
      alert("Uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // final submit — ALWAYS send shipping.method + shipping.fee + shipping.details
  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) return alert("You must login before checkout.");
    if (cart.length === 0) return alert("Cart is empty");

    setLoading(true);

    try {
      const items = cart.map((it) => ({
        productId: it._id,
        name: it.name,
        price: Number(it.price || 0),
        qty: it.qty || 1,
      }));

      // SAFER sellerId extraction:
      // seller might be a plain id string, or an object { _id, ... } or a nested field
      let sellerId = null;
      const first = cart[0];
      if (first) {
        if (first.seller && typeof first.seller === "object") {
          sellerId = first.seller._id || first.seller.id || null;
        } else if (first.sellerId) {
          sellerId = first.sellerId;
        } else if (first.seller) {
          sellerId = first.seller; // could already be id string
        }
      }

      // If sellerId still an object, coerce to string if possible
      if (sellerId && typeof sellerId === "object") {
        sellerId = String(sellerId._id || sellerId.id || sellerId.toString());
      }

      const sellerCoords = first?.sellerLocation || first?.seller?.location || null;

      // build shipping object that backend expects
      const shipping = {
        method: shippingMethod,
        fee: chosenFee,
        details: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        // include seller coords so server can re-calc if needed
        sellerLat: sellerCoords?.lat ?? null,
        sellerLng: sellerCoords?.lng ?? null,
      };

      // include user coords if possible (allow server to re-calc)
      if (shippingMethod === "delivery" && navigator.geolocation) {
        try {
          const pos = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition((p) => resolve(p), () => resolve(null), { enableHighAccuracy: true, timeout: 8000 });
          });
          if (pos) {
            shipping.userLat = pos.coords.latitude;
            shipping.userLng = pos.coords.longitude;
          }
        } catch (err) {
          // swallow — server will fallback to admin fees
        }
      }

      // helpful debug in console (remove in production)
      console.debug("Checkout submit shipping:", shipping, "items:", items);

      const body = {
        orderType: "product",
        buyerId: user?.id || user?._id || null,
        sellerId,
        items,
        meta: { shipping },
        paymentMock: true,
        paymentProof,
        total,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }

      if (!res.ok) {
        throw new Error((data && data.error) || text || "Order failed");
      }

      const orderId = (data && data.order && data.order._id) || data.orderId || data._id;
      const txId = (data && data.transaction && data.transaction._id) || data.transaction?._id || data.txId;

      // success
      clearCart();
      const params = new URLSearchParams();
      if (sellerId) params.set("seller", sellerId);
      if (orderId) params.set("order", orderId);
      if (txId) params.set("tx", txId);
      params.set("amount", String(total || 0));

      router.push(`/checkout/transfer?${params.toString()}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Could not complete checkout");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm">Full name</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full mt-1 border rounded p-2" required />
          </div>

          <div>
            <label className="block text-sm">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full mt-1 border rounded p-2" required />
          </div>

          <div>
            <label className="block text-sm">City</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full mt-1 border rounded p-2" required />
          </div>

          <div>
            <label className="block text-sm">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full mt-1 border rounded p-2" required />
          </div>

          <div>
            <label className="block text-sm">Shipping method</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="shippingMethod" value="pickup" checked={shippingMethod === "pickup"} onChange={() => setShippingMethod("pickup")} />
                <span>Pickup (₦{Number(fees.pickupFee).toLocaleString()})</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="shippingMethod" value="delivery" checked={shippingMethod === "delivery"} onChange={() => setShippingMethod("delivery")} />
                <span>Delivery (₦{Number(fees.deliveryFee).toLocaleString()})</span>
              </label>
            </div>
            {shippingMethod === "delivery" && estimatedMinutes > 0 && (
              <div className="text-xs text-gray-600 mt-1">Estimated trip: {estimatedMinutes} minutes</div>
            )}
          </div>

          <div>
            <label className="block text-sm">Upload Payment Proof (optional)</label>
            <input type="file" onChange={uploadFile} className="w-full mt-1 border rounded p-2" />
            {uploading && <p className="text-sm text-blue-600">Uploading…</p>}
            {paymentProof && <p className="text-green-600 text-sm mt-1">Uploaded ✓</p>}
          </div>

          <button disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded">
            {loading ? "Processing…" : `Pay ₦${Number(total).toLocaleString()}`}
          </button>
        </form>

        <aside className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-4">Order summary</h2>
          {cart.map((it) => (
            <div key={it._id} className="flex justify-between mb-2">
              <div>{it.name} x {it.qty || 1}</div>
              <div>₦{Number(it.price * (it.qty || 1)).toLocaleString()}</div>
            </div>
          ))}
          <div className="mt-4 flex justify-between">
            <div>Subtotal</div>
            <div>₦{Number(subtotal).toLocaleString()}</div>
          </div>
          <div className="mt-2 flex justify-between">
            <div>Shipping ({shippingMethod})</div>
            <div>₦{Number(chosenFee).toLocaleString()}</div>
          </div>
          <div className="mt-4 font-semibold flex justify-between">
            <div>Total</div>
            <div>₦{Number(total).toLocaleString()}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
