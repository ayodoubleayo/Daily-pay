"use client";
import { useState } from "react";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function AddToCartButton({ product }) {
  const [loading, setLoading] = useState(false);
  const { addToCart } = useContext(CartContext);
  const { token } = useAuth();
  const router = useRouter();

  async function handleAdd() {
    // If not logged in, prompt to login/register
    if (!token) {
      const go = confirm("You must be signed in to add items to cart. Go to login?");
      if (go) {
        router.push("/login");
      }
      return;
    }

    setLoading(true);
    try {
      addToCart({
        ...product,
        _id: product._id || product.id,
      });

      // little toast
      const el = document.createElement("div");
      el.textContent = "Added to cart";
      el.style =
        "position:fixed;right:20px;bottom:20px;background:#111;color:#fff;padding:8px 12px;border-radius:6px;z-index:9999";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    } catch (e) {
      console.error(e);
      alert("Could not add to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      title={!token ? "Sign in to add to cart" : "Add to cart"}
    >
      {loading ? "Adding…" : "Add to Cart"}
    </button>
  );
}
