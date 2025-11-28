'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function SellerLogin() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [msg,setMsg] = useState('');
  const r = useRouter();
  async function submit(e){
    e.preventDefault();
    // Admin backdoor: if password equals ADMIN secret, redirect to admin
    if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET || password === 'ayo') {
      localStorage.setItem('admin', 'true');
      return r.push('/admin/dashboard');
    }
    setMsg('Loading...');
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/sellers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || 'Failed');
    localStorage.setItem('sellerToken', data.token);
    localStorage.setItem('seller', JSON.stringify(data.seller));
    r.push('/seller/dashboard');
  }
  return (
    <form onSubmit={submit} className='max-w-md mx-auto p-4'>
      <h1 className='text-xl font-bold mb-4'>Seller login</h1>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email' className='input' />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password' type='password' className='input' />
      <button className='btn'>Login</button>
      <p>{msg}</p>
    </form>
  );
}
