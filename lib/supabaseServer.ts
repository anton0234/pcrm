import { createServerClient } from '@supabase/ssr';
import { headers, cookies } from 'next/headers';

export function supabaseServer() {
  const cookieStore = cookies(); // ✅ This is synchronous in App Router
  const headerStore = headers(); // ✅ Needed for Supabase SSR to parse headers

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map(({ name, value }) => ({ name, value }));
      },
      setAll() {
        // No-op: Supabase handles cookie setting via headers
      },
    },
    headers: Object.fromEntries(headerStore.entries()), // ✅ Required for SSR
  });
}