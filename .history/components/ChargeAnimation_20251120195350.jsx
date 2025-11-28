// frontend/components/ChargeAnimation.jsx
"use client";
import { useEffect, useState } from "react";

export default function ChargeAnimation({ total, percent = 10 }) {
  const charge = Math.round((total * percent) / 100);
  const toSeller = total - charge;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep(s => Math.min(s + 1, 3)), 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <div className="text-lg font-semibold">Payment Received</div>

      <div className="mt-3">
        <div className={`transition-opacity ${step>0 ? 'opacity-100' : 'opacity-0'}`}>
          <div>Total: ₦{Number(total).toLocaleString()}</div>
        </div>

        <div className={`transition-opacity ${step>1 ? 'opacity-100' : 'opacity-0'} mt-2`}>
          <div>Service charge ({percent}%): ₦{Number(charge).toLocaleString()}</div>
        </div>

        <div className={`transition-opacity ${step>2 ? 'opacity-100' : 'opacity-0'} mt-3`}>
          <div className="font-bold">Releasing ₦{Number(toSeller).toLocaleString()} to Seller...</div>
        </div>
      </div>
    </div>
  );
}
