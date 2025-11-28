import { useState } from 'react';

// Custom hook replacement for next/navigation's useRouter to ensure compatibility.
// It uses standard window location for redirection.
const useSimpleRouter = () => {
    return {
        push: (path) => {
            window.location.href = path;
        }
    };
};

export default function AdminLogin() {
  const [secret, setSecret] = useState('');
  const [msg, setMsg] = useState('');
  const router = useSimpleRouter(); 

  function submit(e) {
    e.preventDefault();

    // Read admin secret ONLY from environment variable. 
    // The hardcoded fallback has been removed for security.
    const real = process.env.NEXT_PUBLIC_ADMIN_SECRET;
    
    // Check if the environment variable is actually set
    if (!real) {
        setMsg('Error: Admin secret environment variable not configured.');
        setSecret('');
        return;
    }
    
    // Check secret
    if (secret === real) {
      // Store admin session state
      localStorage.setItem('admin', 'true');
      localStorage.setItem('adminSecret', real);

      // Redirect to the dashboard
      router.push('/admin/dashboard');
    } else {
      setMsg('Invalid admin secret');
      setSecret(''); // Clear the secret on failure
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className='w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200'>
            <h1 className='text-3xl font-extrabold text-gray-900 mb-6 text-center'>
                🔒 Admin Portal Login
            </h1>

            <form onSubmit={submit} className='space-y-4'>
                <input
                    type="password"
                    value={secret}
                    onChange={e => setSecret(e.target.value)}
                    placeholder='Enter Admin Secret'
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition shadow-sm text-lg'
                    required
                />

                <button 
                    type="submit"
                    className='bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition duration-300 p-3 text-white rounded-lg w-full font-semibold text-lg shadow-md hover:shadow-lg'
                >
                    Login
                </button>

                {msg && (
                    <p className='text-red-600 bg-red-50 p-3 rounded-lg text-center font-medium mt-4'>
                        {msg}
                    </p>
                )}
                
                {/* The test secret hint has been removed */}
            </form>
        </div>
    </div>
  );
}