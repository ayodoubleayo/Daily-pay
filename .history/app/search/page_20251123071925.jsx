'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    async function load() {
      try {
        const res = await fetch(
`${process.env.NEXT_PUBLIC_API_URL}/api/products/search?q=${query}`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search load failed", err);
      }
      setLoading(false);
    }

    load();
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-4">
        Search results for: "{query}"
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-600">No items found.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-4">
        {results.map((p) => (
          <Link
            key={p._id}
            href={`/products/${p._id}`}
            className="border p-3 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <img
              src={p.image || '/placeholder.png'}
              className="w-full h-40 object-cover rounded"
            />
            <h2 className="font-semibold mt-2 text-sm">{p.name}</h2>
            <p className="text-blue-600 font-bold">
              ₦{p.price?.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
