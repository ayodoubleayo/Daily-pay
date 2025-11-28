// app/cart/page.jsx
"use client";
import { useContext } from "react";
import { CartContext } from "../../context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQty } = useContext(CartContext);
  const total = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0);

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link href="/products" className="px-4 py-2 bg-blue-600 text-white rounded">Browse products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="flex items-center gap-4 bg-white p-4 rounded shadow">
                <img src={item.image || "/placeholder.png"} className="w-24 h-24 object-cover rounded" alt={item.name} />
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-600">₦{Number(item.price).toLocaleString()}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateQty(item._id, (item.qty || 1) - 1)} className="px-2 py-1 border rounded">-</button>
                    <div className="px-3">{item.qty || 1}</div>
                    <button onClick={() => updateQty(item._id, (item.qty || 1) + 1)} className="px-2 py-1 border rounded">+</button>
                    <button onClick={() => removeFromCart(item._id)} className="ml-4 text-sm text-red-600">Remove</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <button onClick={() => { if (confirm("Clear cart?")) { window.dispatchEvent(new CustomEvent("clearCart")); } }} className="px-4 py-2 bg-gray-200 rounded">Clear Cart</button>
            </div>
          </div>

          <aside className="bg-white p-6 rounded shadow">
            <div className="font-semibold mb-4">Order summary</div>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₦{Number(total).toLocaleString()}</span>
            </div>
            <div className="mb-4 text-sm text-gray-600">Shipping and taxes calculated at checkout</div>
            <Link href="/checkout" className="block text-center px-4 py-2 bg-blue-600 text-white rounded">Proceed to checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
