import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set: listings cannot be loaded.');
}

// The anon key is public by design: access is limited by the RLS rules in supabase/migrations.
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'missing-anon-key');
