"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from 'next/link';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';

// Get Firebase config from the global variable
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    // Firebase uses 'oobCode' for the action code (token)
    const oobCode = searchParams.get("oobCode") || ""; 
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        // We only check for the presence of oobCode here. 
        // Firebase handles the validity check when we call confirmPasswordReset.
        if (!oobCode) {
            setMessage("Invalid or missing password reset link.");
        } else {
            setIsVerified(true);
        }
    }, [oobCode]);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        if (!oobCode) {
            setMessage("Error: Reset code is missing.");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        if (password !== confirm) {
            setMessage("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            // Use Firebase's confirmPasswordReset with the oobCode and the new password
            await confirmPasswordReset(auth, oobCode, password);

            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => router.push("/login"), 1500);

        } catch (error) {
            console.error("Password reset failed:", error);
            let errorMessage = "Password reset failed. The link may have expired or been used.";
            
            // Translate common Firebase errors
            if (error.code === 'auth/invalid-action-code') {
                errorMessage = "The reset link is invalid or has expired.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Please use a stronger password.";
            } else if (error.code === 'auth/expired-action-code') {
                errorMessage = "The reset link has expired. Please request a new one.";
            }

            setMessage(errorMessage);

        } finally {
            setIsLoading(false);
        }
    }

    const isFormDisabled = isLoading || !isVerified;

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            {/* Reset Password Card */}
            <div className="w-full max-w-md bg-white p-8 space-y-8 rounded-xl shadow-2xl border border-gray-200">
                <div className="text-center">
                    <KeyRound className="w-12 h-12 mx-auto text-blue-600" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        Set New Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isVerified ? "Enter and confirm your new password below." : "Validating reset link..."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {/* Error/Message Display */}
                    {message && (
                        <div className={`text-sm p-3 rounded-md flex items-center ${
                            message.includes("successful") ? 'bg-green-100 text-green-700' : 
                            message.includes("Saving...") ? 'bg-blue-100 text-blue-700' : 
                            'bg-red-100 text-red-700'
                        }`}>
                            {message.includes("successful") ? <CheckCircle className="w-4 h-4 mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                            {message}
                        </div>
                    )}

                    <div className="space-y-4" aria-live="polite">
                        <div>
                            <label htmlFor="password" className="sr-only">New Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="New Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isFormDisabled}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="sr-only">Confirm Password</label>
                            <input
                                id="confirm"
                                name="confirm"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Confirm Password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                disabled={isFormDisabled}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition duration-150 ease-in-out ${
                            isFormDisabled 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                        }`}
                        disabled={isFormDisabled}
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Save New Password'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Remember your password? 
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                            Go to login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}