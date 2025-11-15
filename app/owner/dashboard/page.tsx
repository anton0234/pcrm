'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Property = {
  id: number;
  name: string;
  location: string;
  price: number;
};

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Step 1: Find the Client record linked to this user
      const { data: client, error: clientError } = await supabase
        .from('Client')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (clientError || !client) {
        console.error('Client not found:', clientError?.message);
        setLoading(false);
        return;
      }

      // Step 2: Fetch properties for this client
      const { data: props, error: propError } = await supabase
        .from('Property')
        .select('*')
        .eq('clientId', client.id);

      if (propError) {
        console.error('Error fetching properties:', propError.message);
      } else {
        setProperties(props || []);
      }

      setLoading(false);
    };

    fetchProperties();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Properties</h1>
      <ul className="space-y-2">
        {properties.map((property) => (
          <li key={property.id} className="border p-3 rounded">
            <strong>{property.name}</strong> — {property.location} — €{property.price}
          </li>
        ))}
      </ul>
    </div>
  );
}