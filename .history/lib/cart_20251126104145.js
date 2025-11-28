// lib/cart.js (cleaned excerpts)
const STORAGE_KEY = "yisa_cart_v1";

function readStorage() {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch (e) {
    console.error("readStorage error", e);
    return { items: [] };
  }
}

function writeStorage(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: data }));
  } catch (e) {
    console.error("writeStorage error", e);
  }
}

export function addToCart(product, qty = 1) {
  const state = readStorage();
  const idx = state.items.findIndex((i) => i._id === (product._id || product.id));
  if (idx === -1) {
    state.items.push({ ...product, _id: product._id || product.id, quantity: qty });
  } else {
    state.items[idx].quantity = (state.items[idx].quantity || 0) + qty;
  }
  writeStorage(state);
  return state.items;
}
