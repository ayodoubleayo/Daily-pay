"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getToken, saveToken, removeToken } from "../lib/clientAuth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // NEW

  useEffect(() => {
    const t = getToken();
    setToken(t || null);
    setAuthLoading(false); // NOW WE KNOW TOKEN STATUS
  }, []);

  function login(tokenValue) {
    saveToken(tokenValue);
    setToken(tokenValue);
  }

  function logout() {
    removeToken();
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
