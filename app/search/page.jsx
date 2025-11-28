'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, DollarSign, AlertTriangle } from 'lucide-react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    // Retrieves the search query from the URL parameter 'q'
    const query = searchParams.get("q") || "";

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            setResults([]);
            return;
        }

        async function load() {
            setLoading(true);
            try {
                // *** IMPORTANT: RESTORING YOUR ORIGINAL API CALL ***
                // This assumes your Node/Express backend is running and serving this route
                const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/products/search?q=${query}`;
                
                const res = await fetch(apiUrl);

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setResults(data);

            } catch (err) {
                console.error("Search load failed, check if your backend is running:", err);
                setResults([]);
            }
            setLoading(false);
        }

        load();
    }, [query]); // Re-run effect whenever the search query changes

    const renderContent = () => {
        if (!query) {
            return (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                    <Search className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-lg text-gray-600">
                        Please enter a search query to find products in the marketplace.
                    </p>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-3 text-blue-600">Searching the marketplace...</p>
                </div>
            );
        }

        if (results.length === 0) {
            return (
                <div className="text-center py-10 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
                    <p className="mt-4 text-xl font-medium text-red-700">No items found.</p>
                    <p className="text-gray-600 mt-2">Try adjusting your search query or check for spelling mistakes.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {results.map((p) => (
                    // Use p._id for consistency with MongoDB structure
                    <Link
                        key={p._id} 
                        href={`/products/${p._id}`}
                        className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden group"
                    >
                        <div className="w-full h-40 overflow-hidden bg-gray-100">
                            <img
                                src={p.image || 'https://placehold.co/400x300/e5e7eb/4b5563?text=Product'}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-in-out"
                                onError={(e) => e.target.src = 'https://placehold.co/400x300/e5e7eb/4b5563?text=Image+Error'}
                            />
                        </div>
                        <div className="p-4">
                            <h2 className="font-semibold text-gray-900 truncate">{p.name || 'Unknown Product'}</h2>
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2 min-h-[40px]">{p.description || 'No description available.'}</p>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                <span className="flex items-center text-lg font-bold text-blue-600">
                                    <DollarSign className="w-4 h-4 mr-1 text-blue-500"/>
                                    {p.price ? `₦${p.price.toLocaleString()}` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="pb-6 border-b border-gray-200 mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <Search className="w-8 h-8 mr-2 text-blue-600" />
                        Search Results
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {query ? (
                            <>
                                Showing {results.length} item(s) for: 
                                <span className="font-semibold text-blue-700 ml-1">"{query}"</span>
                            </>
                        ) : (
                            "Enter a query to start searching."
                        )}
                    </p>
                </header>
                
                {renderContent()}
            </div>
        </div>
    );
}