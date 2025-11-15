'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Cost = {
  id: number;
  type: string;
  amount: number;
  date: string;
};

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCosts = async () => {
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

      if (!client) {
        setLoading(false);
        return;
      }

      const { data: props } = await supabase
        .from('Property')
        .select('id')
        .eq('clientId', client.id);

      const propertyIds = props?.map((p) => p.id) || [];

      if (propertyIds.length > 0) {
        const { data: csts } = await supabase
          .from('Cost')
          .select('*')
          .in('propertyId', propertyIds)
          .order('date', { ascending: false });

        setCosts(csts || []);
      }

      setLoading(false);
    };

    fetchCosts();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Costs</h1>
      <ul className="mt-4 space-y-3">
        {costs.map((cost) => (
          <li key={cost.id} className="border p-3 rounded">
            <strong>{cost.type.toUpperCase()}</strong> — €{cost.amount}
            <div className="text-sm text-gray-500">
              {new Date(cost.date).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}