import ProductCard from "../../components/ProductCard";

// Function to fetch product data from your API
async function getProducts() {
  // Ensure the fetch call is configured correctly for your environment
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, { 
    cache: "no-store" // Always get fresh data on navigation
  });
  if (!res.ok) return [];
  return res.json();
}

// Simple Skeleton Loader component for perceived speed
const ProductSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg animate-pulse p-4 h-80 border border-gray-100">
        {/* Image Placeholder */}
        <div className="w-full h-40 bg-gray-200 rounded-lg"></div>
        {/* Text Placeholders */}
        <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-blue-100 rounded w-full"></div>
        </div>
    </div>
);


export default async function ProductsPage() {
    // Note: The loading state is automatically handled by Next.js if you create a loading.jsx file.
    // However, if fetching takes time, you can show a brief message here.
    
    let products = [];
    let error = null;
    
    try {
        products = await getProducts();
    } catch (e) {
        // Log error and set a user-friendly message
        console.error("Failed to fetch products:", e);
        error = "Could not load products at this time. Please try again.";
    }


  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="pb-6 border-b border-gray-200 mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
            Featured Products
        </h1>
        <p className="mt-2 text-lg text-gray-500">
            Browse our latest and most popular items available on the marketplace.
        </p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}
      
      {products.length === 0 && !error ? (
        <div className="text-gray-600 text-center py-10">
            <p className="text-xl font-medium">No products available yet.</p>
            <p className="text-sm mt-2">Check back soon for new listings!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id || p.id} product={p} />
          ))}
          
          {/* OPTIONAL: Uncomment the lines below to see how the skeleton loader looks */}
          {/* Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={`skeleton-${i}`} />) */}

        </div>
      )}
    </div>
  );
}