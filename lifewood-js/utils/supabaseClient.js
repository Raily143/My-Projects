import { createClient } from '@supabase/supabase-js';

const readSupabaseEnv = (keys) => {
  for (const key of keys) {
    const fromImportMeta = import.meta?.env?.[key];
    if (typeof fromImportMeta === 'string' && fromImportMeta.trim()) {
      return fromImportMeta.trim();
    }

    const fromProcess = process?.env?.[key];
    if (typeof fromProcess === 'string' && fromProcess.trim()) {
      return fromProcess.trim();
    }
  }
  return '';
};

const supabaseUrl = readSupabaseEnv([
  'VITE_SUPABASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
]);

const supabaseAnonKey = readSupabaseEnv([
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;
