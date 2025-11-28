// frontend/app/payment/release-animation/page.jsx
"use client";
import ChargeAnimation from "../../../components/ChargeAnimation";
import { useSearchParams } from "next/navigation";

export default function ReleaseAnimationPage() {
  const sp = useSearchParams();
  const amount = Number(sp.get("amount") || 0);
  const percent = Number(sp.get("percent") || 10);

  return (
    <div className="max-w-md mx-auto mt-12">
      <ChargeAnimation total={amount} percent={percent} />
    </div>
  );
}
