import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { shopEnv } from '../../config/env';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (!shopEnv.useSupabase || !shopEnv.supabaseUrl || !shopEnv.supabaseAnonKey) {
    throw new Error('Supabase n est pas configure.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(shopEnv.supabaseUrl, shopEnv.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
};
