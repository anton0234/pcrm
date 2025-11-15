'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // 1) Log in
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw new Error(loginError.message);

    // 2) Get the user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not found');

    // 3) Fetch role from Client table
    const { data: client, error: roleError } = await supabase
      .from('Client')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    if (roleError || !client?.role) throw new Error('Role not found or user not linked');

    // 4) Set role cookie
    document.cookie = `role=${client.role}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

    // 5) Redirect
    if (client.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/owner/dashboard');
    }
  } catch (err: any) {
    setError(err.message || 'Login failed');
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-semibold text-center">Prijava</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        <input
          type="password"
          placeholder="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Prijavljivanje...' : 'Prijavi se'}
        </button>
      </form>
    </div>
  );
}