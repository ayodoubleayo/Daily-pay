"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

export default function ClientLayout({ children }) {
  // 🔥 Track whether mobile menu is open
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <CartProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-transparent">

          {/* 🔥 Connect Navbar with layout */}
          <Navbar onMenuToggle={setMenuOpen} />

          {/* MAIN CONTENT */}
          <main className="flex-1 max-w-5xl mx-auto p-4 pb-40 sm:pb-28">
            {children}
          </main>

          {/* 🔥 AUTO-HIDE FOOTER WHEN MOBILE MENU OPENS */}
          {!menuOpen && <Footer />}
        </div>
      </AuthProvider>
    </CartProvider>
  );
}
