"use client";

import Link from 'next/link';
import { useContext, useEffect, useState, useRef } from 'react';
import { CartContext } from '../context/CartContext';

export default function Navbar({ onMenuToggle }) {
  const { cart } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [sellerDropdown, setSellerDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isShrunk, setIsShrunk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef();
  const sellerRef = useRef();

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    try {
      const data = localStorage.getItem("user");
      const adminFlag = localStorage.getItem("isAdminUser");
      if (data) setUser(JSON.parse(data));
      if (adminFlag === "true") setIsAdminUser(true);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  function handleLogout() {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/login";
    }, 500);
  }

  function toggleMenu() {
    const newState = !menuOpen;
    setMenuOpen(newState);
    if (onMenuToggle) onMenuToggle(newState);
  }

  function closeMenu() {
    setMenuOpen(false);
    if (onMenuToggle) onMenuToggle(false);
    setUserDropdown(false);
    setSellerDropdown(false);
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        sellerRef.current &&
        !sellerRef.current.contains(e.target)
      ) {
        setUserDropdown(false);
        setSellerDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shrink navbar on scroll
  useEffect(() => {
    function handleScroll() {
      setIsShrunk(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        bg-white sticky top-0 z-50 
        transition-all duration-300
        ${isShrunk ? "py-2 shadow-md" : "py-4 shadow-sm"}
      `}
    >
      <div className="w-full px-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 pl-1 whitespace-nowrap focus:outline-blue-600"
        >
          <div
            className="
              w-0 h-0
              border-l-[12px] border-r-[12px] border-b-[20px]
              border-l-transparent border-r-transparent border-b-blue-600
              drop-shadow-lg
            "
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            $DAILY-PAY
          </span>
        </Link>

        {/* Hamburger */}
        <button
          className="md:hidden text-3xl active:scale-90 transition"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Mobile/Desktop Menu */}
        <div
          className={`
            flex flex-col md:flex-row md:items-center gap-5
            absolute md:static bg-white left-0 right-0 
            top-16 md:top-auto p-5 md:p-0
            transition-all duration-300 shadow-md md:shadow-none
            ${menuOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-5 md:opacity-100 md:visible md:translate-y-0"
            }
          `}
        >
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.searchInput.value.trim();
              if (q.length > 0) window.location.href = `/search?q=${encodeURIComponent(q)}`;
              closeMenu();
            }}
            className="flex items-center bg-gray-100 px-3 py-1 rounded-full w-full md:w-auto focus-within:ring-2 focus-within:ring-blue-400"
          >
            <input
              type="text"
              name="searchInput"
              placeholder="Search products..."
              className="bg-transparent outline-none px-2 text-sm w-full md:w-40"
            />
            <button type="submit" className="text-blue-700 font-semibold" aria-label="Search">
              🔍
            </button>
          </form>

          {/* Main Nav Links */}
          <Link className="hover:text-blue-600 active:scale-95" href="/" onClick={closeMenu}>Home</Link>
          <Link className="hover:text-blue-600 active:scale-95" href="/categories" onClick={closeMenu}>Categories</Link>
          <Link className="hover:text-blue-600 active:scale-95" href="/products" onClick={closeMenu}>Products</Link>
          <Link className="hover:text-blue-600 active:scale-95" href="/about" onClick={closeMenu}>About</Link>
          <Link className="hover:text-blue-600 active:scale-95" href="/suggestions" onClick={closeMenu}>Suggestion</Link>
          <Link className="hover:text-blue-600 active:scale-95" href="/complaints" onClick={closeMenu}>Complaint</Link>

          {/* Not Logged In */}
          {!user && (
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setUserDropdown(!userDropdown);
                    setSellerDropdown(false);
                  }}
                  className="text-blue-600 text-sm whitespace-nowrap hover:text-blue-800 active:scale-95"
                >
                  User / Want to hire? ⬇
                </button>
                {userDropdown && (
                  <div className="absolute bg-white shadow-md p-3 rounded w-40 flex flex-col gap-2 z-50">
                    <Link href="/register" onClick={closeMenu}>User Register</Link>
                    <Link href="/login" onClick={closeMenu}>User Login</Link>
                    <Link href="/forgot-password" onClick={closeMenu}>Forgot Password</Link>
                  </div>
                )}
              </div>

              {/* Seller Dropdown */}
              <div className="relative" ref={sellerRef}>
                <button
                  onClick={() => {
                    setSellerDropdown(!sellerDropdown);
                    setUserDropdown(false);
                  }}
                  className="text-purple-600 text-sm whitespace-nowrap hover:text-purple-800 active:scale-95"
                >
                  Seller / Want to work? ⬇
                </button>
                {sellerDropdown && (
                  <div className="absolute bg-white shadow-md p-3 rounded w-40 flex flex-col gap-2 z-50">
                    <Link href="/seller/register" onClick={closeMenu}>Seller Register</Link>
                    <Link href="/seller/login" onClick={closeMenu}>Seller Login</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logged In */}
          {user && (
            <div className="flex flex-col md:flex-row gap-4 md:gap-5">
              <span className="font-semibold">Hi, {user.name}</span>
              <Link className="hover:text-blue-600 active:scale-95" href="/account" onClick={closeMenu}>My Account</Link>
              <Link className="text-blue-600 hover:text-blue-800 active:scale-95" href="/user/history" onClick={closeMenu}>
                My History
              </Link>
              {isAdminUser && (
                <Link className="text-red-600 font-bold hover:text-red-800 active:scale-95" href="/admin/dashboard" onClick={closeMenu}>
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 active:scale-95"
                disabled={isLoading}
              >
                {isLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}

          {/* Cart */}
          <Link
            href={user ? "/cart" : "/login"}
            onClick={closeMenu}
            className="relative hover:text-blue-600 active:scale-95"
          >
            Cart
            {isClient && cart.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-700 text-white rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}