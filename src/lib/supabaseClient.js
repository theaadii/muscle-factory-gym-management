import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials are not set! Data fetched won't work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
