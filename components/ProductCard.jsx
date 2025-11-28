// frontend/components/ProductCard.jsx
"use client";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import useUserLocation from "../hooks/useUserLocation";
import { calcDistance } from "../lib/calcDistance";

export default function ProductCard({ product }) {
  const userLocation = useUserLocation();
  let distanceText = null;

  if (userLocation && product?.location?.lat && product?.location?.lng) {
    const km = calcDistance(
      userLocation.lat,
      userLocation.lng,
      product.location.lat,
      product.location.lng
    );
    const minutes = Math.max(1, Math.round((km / 40) * 60)); // naive estimate
    distanceText = `${km.toFixed(1)} km • ${minutes} mins away`;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <Link href={`/products/${product._id || product.id}`}>
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="rounded mb-2 w-full h-48 object-cover"
        />
      </Link>

      {/* Small seller badge under image (Option B) */}
    {product.seller && (
  <div className="mb-3 flex items-center gap-3">
    <img
      src={product.seller.shopLogo || "/placeholder.png"}
      alt={product.seller.shopName || product.seller.name || "Seller"}
      className="w-8 h-8 rounded-full object-cover border"
    />
    <div className="text-sm">
      <div className="font-semibold leading-tight">
        {product.seller.shopName || product.seller.name}
      </div>
      <div className="text-xs text-gray-500">Seller Market</div>

      {/* ⭐ NEW — ADDRESS */}
      {product.seller.address && (
        <div className="text-xs text-gray-600">
          {product.seller.address}
        </div>
      )}
    </div>
  </div>
)}


      <h2 className="text-lg font-semibold mb-1">{product.name}</h2>

      {distanceText && <p className="text-sm text-gray-600 mb-2">{distanceText}</p>}

      <p className="text-blue-600 font-bold mb-3">
        ₦{Number(product.price).toLocaleString()}
      </p>

      <div className="flex gap-2">
        <AddToCartButton product={product} />
        <Link
          href={`/products/${product._id || product.id}`}
          className="flex-1 text-center py-2 border rounded hover:bg-gray-50"
        >
          View
        </Link>
      </div>
    </div>
  );
}
