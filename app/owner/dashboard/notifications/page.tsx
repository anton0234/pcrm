'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Find client record
      const { data: client } = await supabase
        .from('Client')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!client) return;

      // Fetch notifications for properties owned by this client
      const { data: props } = await supabase
        .from('Property')
        .select('id')
        .eq('clientId', client.id);

      const propertyIds = props?.map((p) => p.id) || [];

      if (propertyIds.length > 0) {
        const { data: notes } = await supabase
          .from('Notification')
          .select('*')
          .in('propertyId', propertyIds)
          .order('createdAt', { ascending: false });

        setNotifications(notes || []);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <ul className="mt-4 space-y-3">
        {notifications.map((note) => (
          <li key={note.id} className="border p-3 rounded">
            <strong>{note.type.toUpperCase()}</strong> — {note.description}
            {note.cost && <span className="ml-2 text-red-600">Cost: €{note.cost}</span>}
            <div className="text-sm text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}