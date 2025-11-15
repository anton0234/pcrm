'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Property = {
  id: number;
  name: string;
  location: string;
  price: number;
  createdAt: string;
};

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const { data: client, error: clientError } = await supabase
        .from('Client')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (clientError || !client?.id) {
        setError('Client record not found');
        setLoading(false);
        return;
      }

      const { data: props, error: propError } = await supabase
        .from('Property')
        .select('*')
        .eq('clientId', client.id);

      if (propError) {
        setError('Failed to load properties');
        setLoading(false);
        return;
      }

      setProperties(props);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      {loading && <p>Loading properties...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && properties.length === 0 && (
        <p>No properties found.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li key={property.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{property.name}</h2>
              <p>Location: {property.location}</p>
              <p>Price: €{property.price}</p>
              <p>Created: {new Date(property.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}