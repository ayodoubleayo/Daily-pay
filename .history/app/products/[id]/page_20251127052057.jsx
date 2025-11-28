// frontend/app/products/[id]/page.jsx
import AddToCartButton from "../../../components/AddToCartButton";
import { notFound } from "next/navigation";

async function getProduct(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }) {
  // ⬅️ FIX: unwrap params (Next.js 15 requirement)
  const { id } = await params;

  const product = await getProduct(id);
  if (!product) return notFound();

  return (
    <div className="max-w-5xl mx-auto mt-8 grid md:grid-cols-2 gap-6">
      <div>
        <img
          src={product.image || "/placeholder.png"}
          className="w-full h-96 object-cover rounded mb-3"
          alt={product.name}
        />

        {/* Small seller badge under image */}
        {product.seller && (
          <div className="mb-4 flex items-center gap-3">
            <img
              src={product.seller.shopLogo || "/placeholder.png"}
              alt={product.seller.shopName || product.seller.name || "Seller"}
              className="w-10 h-10 rounded-full object-cover border"
            />
            <div className="text-sm">
              <div className="font-semibold leading-tight">
                {product.seller.shopName || product.seller.name}
              </div>
              <div className="text-xs text-gray-500">
                {product.seller.shopDescription || "Seller Market"}
              </div>
               {product.seller.address && (
        <div className="text-xs text-gray-600">{product.seller.address}</div>
      )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-3 text-gray-700">{product.description}</p>
        <p className="mt-4 text-2xl font-semibold text-blue-600">
          ₦{Number(product.price).toLocaleString()}
        </p>
        <div className="mt-6 flex gap-3">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
