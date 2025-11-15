'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError('');

      // 1) Get the logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // 2) Get the Client row linked to this user
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

      // 3) Fetch properties owned by this client
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

    fetchProperties();
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
          {properties.map((property: any) => (
            <li key={property.id} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{property.name}</h2>
              <p>{property.address}</p>
              <p>Status: {property.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}