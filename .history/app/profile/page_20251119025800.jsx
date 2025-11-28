"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { token } = useAuth();

  return (
    <ProtectedRoute>
      <div className="max-w-md mx-auto mt-20 p-6 shadow rounded bg-white">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>

        <p className="text-gray-600 mb-4">Welcome back! You are logged in.</p>

        <p className="text-sm text-gray-500">
          Your token: <span className="break-all">{token}</span>
        </p>
      </div>
    </ProtectedRoute>
  );
}
