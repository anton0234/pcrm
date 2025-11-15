'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function RevenuePage() {
  const [revenues, setRevenues] = useState<any[]>([]);

  useEffect(() => {
    const fetchRevenue = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: client } = await supabase
        .from('Client')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!client) return;

      const { data: props } = await supabase
        .from('Property')
        .select('id')
        .eq('clientId', client.id);

      const propertyIds = props?.map((p) => p.id) || [];

      if (propertyIds.length > 0) {
        const { data: revs } = await supabase
          .from('Revenue')
          .select('*')
          .in('propertyId', propertyIds)
          .order('month', { ascending: false });

        setRevenues(revs || []);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Revenue</h1>
      <ul className="mt-4 space-y-3">
        {revenues.map((rev) => (
          <li key={rev.id} className="border p-3 rounded">
            <strong>{new Date(rev.month).toLocaleDateString()}</strong> — €{rev.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}