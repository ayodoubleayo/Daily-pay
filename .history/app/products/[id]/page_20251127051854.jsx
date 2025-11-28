/ MOCK: Simulates Next.js Server Component fetching data
async function getProduct(id) {
  console.log(`[MOCK] Fetching product ID: ${id}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const product = mockProducts[id];
  // In a real app, you might fetch from your actual API here:
  // const res = await fetch(`${process.env.API_URL}/products/${id}`);
  // if (!res.ok) return null;
  // return res.json();
  
  if (!product) return null;
  return product;
}

// Client Component to handle interactivity (e.g., button click, state)
const AddToCartButton = ({ product }) => {
    // This part requires 'use client' in a real Next.js app, 
    // but in this single-file preview, it's fine.
    const [quantity, setQuantity] = React.useState(1);
    
    const handleAddToCart = () => {
        console.log(`ACTION: Added ${quantity} x ${product.name} to cart! (Simulated)`);
        // We use alert() here instead of a custom modal for simplicity in the self-contained preview
        alert(`Added ${quantity} x ${product.name} to cart! (Simulated)`);
    };

    return (
        <div className="flex items-center gap-4">
            <input 
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-20 p-2 border border-gray-300 rounded text-center focus:ring-blue-500 focus:border-blue-500"
            />
            <button
                onClick={handleAddToCart}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-150 shadow-md transform hover:scale-[1.01]"
            >
                Add to Cart
            </button>
        </div>
    );
};

// MOCK: Replace 'notFound' dependency with local logic for error handling.
const notFoundComponent = (id) => {
    return (
        <div className="text-center p-10 mt-20">
            <h1 className="text-4xl font-extrabold text-red-700">404 - Product Not Found</h1>
            <p className="mt-4 text-lg text-gray-600">The product you are looking for with ID: <span className="font-mono bg-gray-100 p-1 rounded">{id}</span> could not be found in our catalog.</p>
            <p className="text-sm text-gray-500 mt-2">Please check the ID.</p>
        </div>
    );
}

// --- SERVER COMPONENT ---
export default async function ProductPage({ params }) {
    // In a real Next.js app, params is guaranteed to exist.
    const { id } = params;

    const product = await getProduct(id);
    
    // In a real Next.js app, you would import and use:
    // if (!product) return notFound(); 

    if (!product) {
        // Since we cannot use the imported `notFound` function in this environment, 
        // we return a custom 404 component.
        return notFoundComponent(id); 
    }

    // Standard Next.js practice for client components needed inside a server component
    // In a real project, this component would be marked 'use client'
    const CartButton = typeof React !== 'undefined' ? AddToCartButton : () => null;

    return (
        <div className="max-w-5xl mx-auto mt-8 grid md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
            {/* Image and Seller Info Column */}
            <div className="flex flex-col">
                <img
                    src={product.image || "https://placehold.co/800x600/e5e7eb/4b5563?text=Product+Image"}
                    className="w-full h-96 object-cover rounded-xl shadow-lg mb-6 border border-gray-200"
                    alt={product.name}
                    // Handle image load failure
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/e5e7eb/4b5563?text=Product+Image" }}
                />

                {/* Small seller badge under image */}
                {product.seller && (
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center gap-4 shadow-md transition duration-300 hover:shadow-lg">
                        <img
                            src={product.seller.shopLogo || "https://placehold.co/40x40/4b5563/ffffff?text=S"}
                            alt={product.seller.shopName || product.seller.name || "Seller"}
                            className="w-14 h-14 rounded-full object-cover border-4 border-indigo-400 p-0.5"
                            // Handle image load failure
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/4b5563/ffffff?text=S" }}
                        />
                        <div className="flex flex-col justify-center">
                            <div className="font-bold text-xl text-gray-900 leading-snug">
                                {product.seller.shopName || product.seller.name}
                            </div>
                            <div className="text-sm text-indigo-700 leading-snug font-medium">
                                {product.seller.shopDescription || "Marketplace Vendor"}
                            </div>
                            {product.seller.address && (
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    {product.seller.address}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details Column */}
            <div>
                <h1 className="text-5xl font-extrabold text-gray-900 mb-6 border-b pb-3">{product.name}</h1>
                
                <div className="bg-blue-50 p-6 rounded-xl my-6 inline-block w-full">
                    <p className="text-xl text-blue-800 font-medium">Price:</p>
                    <p className="text-5xl font-bold text-blue-600">
                        ₦{Number(product.price).toLocaleString()}
                    </p>
                </div>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-3">Product Description</h2>
                <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-indigo-300 pl-4 py-1">
                    {product.description}
                </p>

                <div className="mt-10 flex gap-4 items-center">
                    {/* Render the client component */}
                    <CartButton product={product} />
                </div>
                
                <p className="mt-8 text-sm text-gray-500">
                    SKU / Product ID: <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">{product.id}</span>
                </p>
            </div>
        </div>
    );
}