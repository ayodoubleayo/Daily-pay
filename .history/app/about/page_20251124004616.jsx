// File: app/about/page.jsx
import React from "react";

export const metadata = {
  title: "About — Daily-Pay Marketplace",
  description: "About Daily-Pay — our mission, vision and what visitors should expect.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-start justify-center py-16 px-4">
      {/* Centered content card with semi-opaque background so text is readable on your bg image */}
      <div className="w-full max-w-4xl bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg shadow-lg p-8">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            About $DAILY-PAY
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Connecting buyers, sellers and service professionals in one safe, trusted marketplace.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Our Mission</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              At <span className="font-semibold">$DAILY-PAY</span>, our mission is to make commerce and
              hiring local services simple, fast and secure. We enable people to buy great products,
              hire trusted professionals, and run small businesses with confidence.
            </p>

            <h3 className="mt-4 text-sm font-semibold text-gray-800 dark:text-white">What you can expect</h3>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>Easy browsing and powerful search to find products and service providers.</li>
              <li>Secure checkout and transparent transaction records.</li>
              <li>Seller dashboards and payout tools for merchants.</li>
              <li>Admin moderation to keep the marketplace safe and fair.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Our Vision</h2>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              We envision thriving local economies where buyers access quality goods and services,
              and small sellers & freelancers grow their businesses without friction. Over time we
              aim to provide tools, analytics and payout infrastructure that help sellers scale.
            </p>

            <h3 className="mt-4 text-sm font-semibold text-gray-800 dark:text-white">Core values</h3>
            <div className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Trust:</span> Verified sellers & transparent reviews.</p>
              <p><span className="font-medium">Simplicity:</span> Easy flows for buying, selling and hiring.</p>
              <p><span className="font-medium">Safety:</span> Admin moderation and secure payments.</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">How it works — quick guide</h2>
          <ol className="mt-3 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>Browse</strong> categories or search for products & services.</li>
            <li><strong>Choose</strong> items or contact a service provider and add to cart.</li>
            <li><strong>Pay</strong> securely and upload proof if required.</li>
            <li><strong>Track</strong> orders in your history and communicate with sellers.</li>
          </ol>
        </section>

        <section className="mt-8 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Want to join as a seller or offer services?{" "}
            <a href="/seller/register" className="text-red-600 font-semibold underline">
              Register as a seller
            </a>{" "}
            or{" "}
            <a href="/suggestions" className="text-red-600 font-semibold underline">
              send us feedback
            </a>.
          </p>
        </section>

        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p className="text-center">
            © {new Date().getFullYear()} <span className="font-medium">$DAILY-PAY</span> — Fast services • Trusted sellers • Secure payments
          </p>
        </footer>
      </div>
    </div>
  );
}
