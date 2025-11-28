// app/categories/page.jsx
import Categories from "../../components/Categories";

export default async function CategoriesPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { cache: "no-store" });
  const categories = res.ok ? await res.json() : [];

  return (
    <div className="mt-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">All Categories</h1>
      <Categories categories={categories} />
    </div>
  );
}
