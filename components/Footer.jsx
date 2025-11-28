export default function Footer() {
  return (
    <footer className="
      fixed bottom-0 left-0 w-full
      bg-white
      py-6
      text-center
      text-sm
      font-bold
      text-gray-800
      shadow-lg
      border-t
      z-50
    ">
      <p>© {new Date().getFullYear()} Daily-Pay Marketplace</p>
      <p className="text-xs font-semibold mt-1">
        Fast Services • Trusted Sellers • Secure Payments
      </p>
    </footer>
  );
}
