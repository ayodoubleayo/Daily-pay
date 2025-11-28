import ProductCard from "../../../components/ProductCard";

export default async function CategoryPage(props) {
  const params = await props.params;
  const slug = params.slug;

  const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}/products`,
  { cache: "no-store" }
);

  if (!res.ok) {
    return (
      <div className="max-w-5xl mx-auto mt-10">
        <h1 className="text-2xl font-semibold">Category not found</h1>
      </div>
    );
  }

  const { category, products } = await res.json();

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-gray-600">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
