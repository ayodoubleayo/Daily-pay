// app/page.jsx
import Categories from "../components/Categories";

export default async function Home() {
  // server fetch categories
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { cache: "no-store" });
  const categories = res.ok ? await res.json() : [];

  return (
<div
  className="mt-5 max-w-6xl mx-auto text-white p-5 rounded-xl"
  style={{
    backgroundImage: "url('/bg.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "500px",
    opacity: "0.95"

  }}
>

      {/* MAIN TITLE */}
      <h1 className="text-4xl font-bold mb-6 text-center
">
        $DAILY-PAID
      </h1>

      {/* FULL DESCRIPTION */}
      <p className="mb-10 text-lg max-w-3xl mx-auto leading-relaxed">
        Welcome to $DAILY-PAY  — your all-in-one marketplace for quality products
        and trusted services. Whether you're shopping for top items, hiring skilled
        professionals, or offering your own services, we connect buyers, sellers,
        and service providers in a safe and reliable environment. Explore everything
        you need with confidence.
      </p>

      {/* SECOND INTRO LINE */}
      <p className="mb-16 text-lg">
        Your perfect shopping & hiring experience begins here.

      </p>
      
      {/* SHORT INTRO */}
      <p className="mb-6 text-lg">
        Browse categories and discover amazing products & services near you.
      </p>


      

      {/* BUTTON SECTION */}
      <section className="mt-50">
   
        <a
          href="/products"
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Browse All Products
        </a>
      </section>
    </div>
  );
}
