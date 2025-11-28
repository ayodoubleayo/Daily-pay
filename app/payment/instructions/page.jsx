// frontend/app/payment/instructions/page.jsx
import { useEffect, useState } from "react";

export default function PaymentInstructions() {
  const [bank, setBank] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bank-details`);
        if (!res.ok) return setBank({ bankName: "N/A", accountName: "", accountNumber: "" });
        setBank(await res.json());
      } catch (err) {
        setBank({ bankName: "N/A", accountName: "", accountNumber: "" });
      }
    })();
  }, []);

  if (!bank) return <div>Loading bank instructions...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-3">Payment Instructions (Bank Transfer)</h1>

      <div className="mb-4">
        <div><strong>Bank:</strong> {bank.bankName}</div>
        <div><strong>Account Name:</strong> {bank.accountName}</div>
        <div><strong>Account Number:</strong> {bank.accountNumber}</div>
      </div>

      <div className="text-gray-700">
        <p>1. Make a bank transfer to the account above for the exact order amount.</p>
        <p>2. After transfer, go to <a className="text-blue-600" href="/payment/confirm">Confirm Payment</a> and upload proof (screenshot).</p>
        <p>3. Admin will verify and approve. 10% service charge will be applied before releasing funds to seller.</p>
      </div>
    </div>
  );
}
