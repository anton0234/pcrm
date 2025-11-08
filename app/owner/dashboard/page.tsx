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

      const { data, error } = await supabase
        .from('Property')
        .select('*')
        .eq('clientId', user.id); // Adjust if you're using a different ID system

      if (error) console.error(error);
      else setProperties(data || []);

      setLoading(false);
    };

    fetchProperties();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Your Properties</h1>
      <ul>
        {properties.map((property) => (
          <li key={property.id}>
            <strong>{property.name}</strong> — {property.location} — €{property.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
