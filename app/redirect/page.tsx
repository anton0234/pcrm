'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RedirectPage() {
  useEffect(() => {
    const redirectUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: client, error } = await supabase
        .from('Client')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (error || !client) {
        console.error('Role not found:', error?.message);
        window.location.href = '/login';
        return;
      }

      if (client.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/owner/dashboard';
      }
    };

    redirectUser();
  }, []);

  return <p>Redirecting based on role...</p>;
}