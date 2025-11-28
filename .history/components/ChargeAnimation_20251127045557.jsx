const ChargeAnimation = ({ total, percent = 10, onReleaseConfirm }) => {
    const totalAmount = Number(total);
    const releasePercent = Number(percent);
    const charge = Math.round((totalAmount * releasePercent) / 100);
    // Note: The logic assumes 'toSeller' is the remaining balance, but the prompt's previous
    // component defined 'toSeller' as the amount being released (Total - Charge).
    // Sticking to the previous definition where 'toSeller' = amount to release.
    const amountToRelease = totalAmount - charge; 

    // Step 0: Confirmation Screen (API Call)
    // Step 1-3: Animation steps
    const [step, setStep] = useState(0); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [releaseError, setReleaseError] = useState(null);

    // Start the visual animation once the API call is successful (step is set to 1)
    useEffect(() => {
        if (step > 0 && step < 3) {
            const timer = setInterval(() => setStep(s => Math.min(s + 1, 3)), 400);
            return () => clearInterval(timer);
        }
    }, [step]);

    // Helper to format currency
    const formatCurrency = (amount) => `₦${Number(amount).toLocaleString()}`;


    // Handles the user click and calls the API function passed from the parent.
    const handleConfirm = async () => {
        setReleaseError(null);
        setIsProcessing(true);

        try {
            // Call the API function provided by the page controller
            await onReleaseConfirm(amountToRelease);
            
            // If the API call succeeds, start the visual animation
            setIsProcessing(false);
            setStep(1); // Move to the first animation step

        } catch (error) {
            setIsProcessing(false);
            setReleaseError(`Release failed: ${error.message || 'Unknown error'}`);
            // Keep step at 0 to show confirmation screen again
        }
    };

    const isComplete = step === 3;
    const isPending = isProcessing || (step > 0 && step < 3);

    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl border border-gray-200 max-w-sm mx-auto">
            <h1 className="text-2xl font-extrabold text-center mb-6 text-gray-800">
                {isComplete ? "Payment Released" : "Confirm Payment Release"}
            </h1>

            {/* Error Message */}
            {releaseError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-sm font-medium">{releaseError}</div>
            )}

            {/* Confirmation Screen (Step 0) */}
            {step === 0 && !isProcessing && (
                <div className="text-center">
                    <p className="text-xl font-semibold text-gray-700 mb-4">
                        Total Funds in Escrow: {formatCurrency(totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                        Confirming this action will release the remaining balance, 
                        <span className="font-bold text-green-600 ml-1">{formatCurrency(amountToRelease)}</span>, to the seller immediately.
                    </p>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition duration-150 ease-in-out disabled:opacity-50"
                    >
                        Confirm Release
                    </button>
                </div>
            )}

            {/* Processing State */}
            {isProcessing && (
                <div className="flex flex-col items-center justify-center p-6 bg-blue-100 text-blue-700 rounded-lg">
                    <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-semibold mt-3">Processing payment release...</span>
                </div>
            )}

            {/* Animation Steps (Step 1-3) */}
            {step > 0 && !isProcessing && (
                <div className="mt-3 space-y-3">
                    <div className={`transition-opacity duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0'} p-2 bg-gray-50 rounded`}>
                        <div className="text-sm text-gray-500">Total transaction amount:</div>
                        <div className="font-semibold text-base">{formatCurrency(totalAmount)}</div>
                    </div>

                    <div className={`transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-0'} p-2 bg-yellow-50 rounded border border-yellow-200`}>
                        <div className="text-sm text-yellow-700">Service Charge ({releasePercent}%):</div>
                        <div className="font-semibold text-base text-yellow-800">{formatCurrency(charge)}</div>
                    </div>

                    <div className={`transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-0'} p-3 bg-green-100 rounded border border-green-300`}>
                        <div className="text-sm text-green-700 font-bold">Funds Released to Seller:</div>
                        <div className="font-extrabold text-xl text-green-800">{formatCurrency(amountToRelease)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

// =======================================================
// --- MAIN PAGE CONTROLLER ---

export default function ReleaseAnimationPage() {
    // 1. Use the mocked search params (for this environment)
    const sp = useSearchParams();
    const amount = Number(sp.get("amount") || 100000); // Default to 100000
    const percent = Number(sp.get("percent") || 10);     // Default to 10

    // 2. Define the API call function
    // This is the function that will run when the user clicks 'Confirm Release'
    const handleRelease = async (amountToRelease) => {
        console.log(`Attempting to release ${amountToRelease} via API...`);
        const apiUrl = "/api/payments/release"; // Replace with your actual backend endpoint
        
        // --- REAL FETCH LOGIC ---
        // You will use this in your local Next.js environment:
        /*
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: amountToRelease, 
                totalAmount: amount, 
                releasePercent: percent 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API release failed.');
        }
        return await response.json(); 
        */

        // --- SIMULATED FETCH FOR PREVIEW ---
        // Simulating network delay and success
        await new Promise(resolve => setTimeout(resolve, 800)); 
        console.log("API simulation successful.");
        return { success: true }; 
    };

    return (
        <div className="max-w-md mx-auto mt-12">
            <ChargeAnimation 
                total={amount} 
                percent={percent} 
                onReleaseConfirm={handleRelease} 
            />
        </div>
    );
}