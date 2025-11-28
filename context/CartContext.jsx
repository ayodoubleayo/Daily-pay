"use client";
import { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

function normalizeItem(raw) {
  // raw can be a product or already an item saved in cart
  const product = raw || {};

  // id normalization
  const _id = product._id || product.id || null;

  // seller normalization (may be string id, an object, or missing)
  let sellerObj = null;
  let sellerId = null;

  if (typeof product.seller === "string") {
    sellerId = product.seller;
  } else if (product.seller && typeof product.seller === "object") {
    sellerObj = product.seller;
    sellerId = product.seller._id || product.seller.id || sellerId;
  } else if (product.sellerId) {
    sellerId = product.sellerId;
  }

  // location normalization: check multiple possible places
  const sellerLocation =
    product.sellerLocation ||
    (product.seller && product.seller.location) ||
    product.location ||
    { lat: null, lng: null, address: "" };

  // if sellerLocation fields might be nested differently, be safe:
  const loc = {
    lat:
      (sellerLocation && (sellerLocation.lat ?? sellerLocation.latitude ?? sellerLocation[0])) ??
      null,
    lng:
      (sellerLocation && (sellerLocation.lng ?? sellerLocation.longitude ?? sellerLocation[1])) ??
      null,
    address: (sellerLocation && sellerLocation.address) || sellerLocation?.addr || ""
  };

  // quantity - if already stored as item
  const qty = product.qty || 1;

  // preserve other product fields (name, price, image, etc.)
  const base = {
    _id,
    name: product.name || product.title || "",
    price: Number(product.price || 0),
    image: product.image || product.img || product.thumbnail || "",
    qty,
    // keep original product snapshot so future code can read other fields
    productSnapshot: product,
  };

  return {
    ...base,
    sellerId: sellerId || null,
    seller: sellerObj || product.seller || null,
    sellerLocation: {
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address || ""
    }
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // migrate/normalize stored items so old carts still work
      return parsed.map(item => {
        // if item already looks normalized (has sellerId and sellerLocation) keep but ensure fields types
        if (item && (item.sellerId || item.sellerLocation)) {
          // normalize minimal fields
          return {
            _id: item._id || item.id || null,
            name: item.name || (item.productSnapshot && item.productSnapshot.name) || "",
            price: Number(item.price || (item.productSnapshot && item.productSnapshot.price) || 0),
            qty: item.qty || 1,
            sellerId: item.sellerId || (item.seller && (item.seller._id || item.seller.id)) || null,
            seller: item.seller || null,
            sellerLocation: {
              lat: item.sellerLocation?.lat ?? (item.seller?.location?.lat ?? null),
              lng: item.sellerLocation?.lng ?? (item.seller?.location?.lng ?? null),
              address: item.sellerLocation?.address ?? (item.seller?.location?.address ?? "")
            },
            productSnapshot: item.productSnapshot || item
          };
        }

        // otherwise normalize from raw product
        return normalizeItem(item);
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart_v1", JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not persist cart to localStorage", e);
    }
  }, [cart]);

  useEffect(() => {
    function handleClear() {
      setCart([]);
    }
    window.addEventListener("clearCart", handleClear);
    return () => window.removeEventListener("clearCart", handleClear);
  }, []);

  function addToCart(product) {
    setCart(prev => {
      const id = product._id || product.id;
      const exists = prev.find(p => p._id === id);

      if (exists) {
        return prev.map(p =>
          p._id === id
            ? { ...p, qty: (p.qty || 1) + 1 }
            : p
        );
      }

      // Normalize incoming product and attach seller fields
      const item = normalizeItem({
        ...product,
        _id: product._id || product.id
      });

      // Ensure qty is 1
      item.qty = 1;

      return [
        ...prev,
        item
      ];
    });

    window.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p._id !== id));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  function updateQty(id, qty) {
    setCart(prev =>
      prev.map(p =>
        p._id === id
          ? { ...p, qty: Math.max(1, qty) }
          : p
      )
    );
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  function clearCart() {
    setCart([]);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
