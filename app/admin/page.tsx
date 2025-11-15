'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
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

      if (client?.role !== 'admin') {
        window.location.href = '/owner/dashboard';
      }
    };

    checkAdmin();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Here you’ll see an overview of all clients, properties, bookings, and revenues.
      </p>
    </div>
  );
}