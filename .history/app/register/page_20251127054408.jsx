"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { LogIn, UserPlus } from 'lucide-react';

// Get Firebase config from the global variable (provided by the environment)
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    /**
     * Handles user registration using Firebase Authentication.
     * Firebase automatically manages the user session (token) internally.
     */
    async function handleRegister(e) {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            setIsLoading(false);
            return;
        }

        try {
            // 1. Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update the user's display name
            await updateProfile(user, { displayName: name });
            
            // 3. Success message and redirect
            setMessage("Account created successfully! Redirecting...");
            
            // The AuthContext (not visible here) should be listening for onAuthStateChanged
            // and will automatically update the global user state.
            
            // Give a moment for AuthContext to register the change, then redirect.
            setTimeout(() => {
                router.push("/");
            }, 500);

        } catch (error) {
            console.error("Registration failed:", error);
            // Translate Firebase error codes to user-friendly messages
            let errorMessage = "Registration failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already associated with an account.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "The email address is not valid.";
            }
            setMessage(errorMessage);

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            {/* Form Card */}
            <div className="w-full max-w-md bg-white p-8 space-y-8 rounded-xl shadow-2xl border border-gray-200">
                <div className="text-center">
                    <UserPlus className="w-12 h-12 mx-auto text-blue-600" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join the marketplace in just a few steps.
                    </p>
                </div>

                <form onSubmit={handleRegister} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="name" className="sr-only">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {message && (
                        <div className={`text-sm p-3 rounded-md ${isLoading ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                            isLoading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out'
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account? 
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 ml-1 flex items-center justify-center pt-2">
                            <LogIn className="w-4 h-4 mr-1"/> 
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}