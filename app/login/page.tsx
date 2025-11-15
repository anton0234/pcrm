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
    console.log('🔐 Starting login...');

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) throw new Error(loginError.message);
    console.log('✅ Logged in via Supabase Auth');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not found');
    console.log('👤 Supabase user ID:', user.id);

    const { data: client, error: roleError } = await supabase
      .from('Client')
      .select('role')
      .eq('auth_user_id', user.id)
      .single();

    console.log('📦 Client query result:', client);
    if (roleError) console.error('❌ Role query error:', roleError);

    if (!client?.role) throw new Error('Role not found or user not linked');

    document.cookie = `role=${client.role}; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
    console.log('🍪 Role cookie set:', client.role);

    if (client.role === 'admin') {
      console.log('➡️ Redirecting to /admin/dashboard');
      router.push('/admin/dashboard');
    } else {
      console.log('➡️ Redirecting to /owner/dashboard');
      router.push('/owner/dashboard');
    }
  } catch (err: any) {
    console.error('⚠️ Login error:', err.message);
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