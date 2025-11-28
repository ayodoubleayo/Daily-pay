// components/Categories.jsx
"use client";
import Link from "next/link";

export default function Categories({ categories = [] }) {
  // categories is an array passed from server page; fallback to empty array for client usage
  if (!categories || categories.length === 0) {
    return <div className="text-sm text-gray-500">No categories yet.</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/categories/${cat.slug}`}
          className="block bg-white shadow rounded overflow-hidden hover:shadow-lg transition"
        >
          <img src={cat.image || "/placeholder.png"} alt={cat.name} className="w-full h-32 object-cover" />
          <div className="p-3 text-center font-medium">{cat.name}</div>
        </Link>
      ))}
    </div>
  );
}
