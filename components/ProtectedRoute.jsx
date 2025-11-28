"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { token, authLoading } = useAuth();
  const router = useRouter();

  // WAIT until token is restored
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [authLoading, token]);

  // still loading token from localStorage → show nothing
  if (authLoading) return null;

  // final check
  if (!token) return null;

  return children;
}
