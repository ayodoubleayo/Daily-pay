'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [secret, setSecret] = useState('');
  const [msg, setMsg] = useState('');
  const r = useRouter();

  function submit(e) {
    e.preventDefault();

    // Read admin secret from env
    const real = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'ayo$oya';
    console.log("ENV ADMIN:", process.env.NEXT_PUBLIC_ADMIN_SECRET);


    // Check secret
    if (secret === real) {
      // Store admin session
      localStorage.setItem('admin', 'true');
      localStorage.setItem('adminSecret', real);

      // No token needed - remove the broken line
      // localStorage.setItem("adminToken", data.token);

      r.push('/admin/dashboard');
    } else {
      setMsg('Invalid admin secret');
    }
  }

  return (
    <form onSubmit={submit} className='max-w-md mx-auto p-4'>
      <h1 className='text-xl font-bold mb-4'>Admin Login</h1>

      <input
        value={secret}
        onChange={e => setSecret(e.target.value)}
        placeholder='Enter Admin Secret'
        className='border p-2 rounded w-full'
      />

      <button className='bg-blue-600 p-2 text-white rounded w-full mt-2'>
        Login
      </button>

      {msg && <p className='text-red-500 mt-2'>{msg}</p>}
    </form>
  );
}
