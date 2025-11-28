'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function SellerRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const r = useRouter();
  async function submit(e) {
    e.preventDefault();
    setMsg('Loading...');
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/sellers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, shopName })
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || 'Failed');
    localStorage.setItem('sellerToken', data.token);
    localStorage.setItem('seller', JSON.stringify(data.seller));
    r.push('/seller/dashboard');
  }
  return (
    <form onSubmit={submit} className='max-w-md mx-auto p-4'>
      <h1 className='text-xl font-bold mb-4'>Seller Register</h1>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder='Full name' className='input' />
      <input value={shopName} onChange={e=>setShopName(e.target.value)} placeholder='Shop name' className='input' />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='Email' className='input' />
      <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Password' className='input' />
      <button className='btn'>Create account</button>
      <p>{msg}</p>
    </form>
  );
}
