'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: ''
  });

  const [categories, setCategories] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // -------------------
  // LOAD CATEGORIES
  // -------------------
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        cache: 'no-store'
      });

      const data = await res.json();

      if (!res.ok) {
        console.warn('Category load failed', data);
        setCategories([]);
        return;
      }

      setCategories(data);
    } catch (err) {
      console.error('loadCategories error', err);
      setCategories([]);
    }
  }

  // -------------------
  // FORM ONCHANGE
  // -------------------
  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // -------------------
  // CREATE PRODUCT
  // -------------------
  async function submit(e) {
    e.preventDefault();
    setMsg('');

    if (!form.name.trim()) return setMsg('Product name is required');
    if (!form.price.trim()) return setMsg('Price is required');

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < 0)
      return setMsg('Price must be a valid number');

    const token = localStorage.getItem('sellerToken');
    if (!token) {
      const go = confirm('You are not logged in. Go to seller login?');
      if (go) router.push('/seller/login');
      return;
    }

    setLoading(true);
    setMsg('Creating product...');
// inside submit() in ProductForm.jsx - replace existing `const body = { ... }` with:
    const savedSeller = JSON.parse(localStorage.getItem('seller')) || {};
    const body = {
      name: form.name.trim(),
      price: priceNum,
      description: form.description.trim(),
      image: form.image.trim(),
      category: form.category || null,
      // include location if seller saved it
      location: savedSeller.location || null
    };


    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sellers/me/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || `Failed (${res.status})`);
        setLoading(false);
        return;
      }

      setMsg('Product created successfully!');
      setForm({ name: '', price: '', description: '', image: '', category: '' });

      if (typeof onCreated === 'function') onCreated(data);

    } catch (err) {
      console.error('submit error', err);
      setMsg('Network error');
    }

    setLoading(false);
  }

  // -------------------
  // UI
  // -------------------
  return (
    <form onSubmit={submit} className="space-y-3 mb-8 p-4 border rounded">
      <h2 className="text-xl font-bold mb-3">Add Product/ Your job</h2>

      <input
        name="name"
        value={form.name}
        onChange={onChange}
        placeholder="Product name / job title"
        className="input"
        disabled={loading}
      />

      <input
        name="price"
        value={form.price}
        onChange={onChange}
        placeholder="Price /your charges (numbers only)"
        className="input"
        disabled={loading}
      />

      <input
        name="image"
        value={form.image}
        onChange={onChange}
        placeholder="Image URL (optional)"
        className="input"
        disabled={loading}
      />

      <select
        name="category"
        value={form.category}
        onChange={onChange}
        className="input"
        disabled={loading || categories.length === 0}
      >
        <option value="">Select category (optional)</option>

        {categories.map(cat => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <textarea
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="Description of your product or job(optional)"
        className="input"
        disabled={loading}
      />

      <button type="submit" className="btn w-full" disabled={loading}>
        {loading ? 'Creating…' : 'Create Product/job'}
      </button>

      {msg && <p className="text-sm mt-2 text-green-700">{msg}</p>}
    </form>
  );
}
