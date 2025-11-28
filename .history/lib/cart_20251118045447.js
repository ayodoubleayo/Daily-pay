// lib/cart.js
// Client-side cart helpers using localStorage

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
    // notify other listeners on same page
    window.dispatchEvent(new Event("cartUpdated"));
    // custom event also for frameworks
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: data }));
  } catch (e) {
    console.error("writeStorage error", e);
  }
}

export function getCart() {
  return readStorage().items;
}

export function getCartCount() {
  const items = getCart();
  return items.reduce((sum, it) => sum + (it.quantity || 1), 0);
}

export function addToCart(product, qty = 1) {
  const state = readStorage();
  const idx = state.items.findIndex((i) => i.id === product.id);
  if (idx === -1) {
    state.items.push({ ...product, quantity: qty });
  } else {
    state.items[idx].quantity = (state.items[idx].quantity || 0) + qty;
  }
  writeStorage(state);
  return state.items;
}

export function updateQuantity(productId, quantity) {
  const state = readStorage();
  const idx = state.items.findIndex((i) => i.id === Number(productId));
  if (idx !== -1) {
    state.items[idx].quantity = Number(quantity);
    if (state.items[idx].quantity <= 0) {
      state.items.splice(idx, 1);
    }
  }
  writeStorage(state);
  return state.items;
}

export function removeFromCart(productId) {
  const state = readStorage();
  state.items = state.items.filter((i) => i.id !== Number(productId));
  writeStorage(state);
  return state.items;
}

export function clearCart() {
  const data = { items: [] };
  writeStorage(data);
  return data.items;
}
