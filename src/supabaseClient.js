// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Ambil URL dan Anon Key dari environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi bahwa environment variables sudah ada
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Make sure to set them in your .env.local file.");
}

// Buat dan ekspor Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
