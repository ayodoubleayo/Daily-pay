"use client";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { User, Lock, ExternalLink, Globe } from 'lucide-react'; // Using Lucide icons for visual polish

export default function ProfilePage() {
    const { user, token } = useAuth(); // Access the full user object if available

    // Mock User Data for display if 'user' object is not fully populated by useAuth
    const defaultUser = {
        name: "Daily-Pay User",
        email: user?.email || "user@marketplace.com",
        role: "Customer",
    };

    return (
        // ProtectedRoute handles the client-side redirection if not authenticated
        <ProtectedRoute>
            <div className="min-h-[80vh] flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
                
                {/* Profile Card Container */}
                <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
                    
                    {/* Header Section */}
                    <div className="bg-blue-600 p-8 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{user?.name || defaultUser.name}</h1>
                                <p className="text-sm font-light opacity-80">{user?.email || defaultUser.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 space-y-8">
                        
                        {/* Status/Role Section */}
                        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Lock className="w-5 h-5 mr-2 text-blue-500" />
                                Account Status
                            </h2>
                            <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                                Active
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Role */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="text-xs font-medium text-gray-500 uppercase flex items-center">
                                    <Globe className="w-4 h-4 mr-1" />
                                    User Role
                                </div>
                                <p className="mt-1 text-lg font-semibold text-gray-800">
                                    {user?.role || defaultUser.role}
                                </p>
                            </div>

                            {/* Email (Non-editable for security demo) */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="text-xs font-medium text-gray-500 uppercase">Primary Email</div>
                                <p className="mt-1 text-lg font-semibold text-gray-800 truncate">
                                    {user?.email || defaultUser.email}
                                </p>
                            </div>
                        </div>

                        {/* Auth Token (Kept for debugging/informational purposes) */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                                Authentication Token (Debug)
                            </h3>
                            <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600 overflow-x-auto break-all font-mono">
                                {token || "No token available (Check authentication flow)"}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                // This button would trigger a modal or a dedicated page for settings
                                onClick={() => console.log("Navigate to Settings")}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                            >
                                Manage Account Settings
                                <ExternalLink className="w-4 h-4 ml-2" />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}