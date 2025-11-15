'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: client } = await supabase
        .from('Client')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (client?.role === 'admin') {
        setAuthorized(true);
      } else {
        window.location.href = '/owner/dashboard';
      }
    };

    checkAdmin();
  }, []);

  if (authorized === null) {
    return <p>Checking permissions...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, Admin.</p>
    </div>
  );
}