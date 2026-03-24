/**
 * Browser-side Supabase client
 * Used in client components and browser contexts
 */

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // In production, fail loudly so the issue is caught immediately
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      throw new Error(
        'Supabase environment variables are missing. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
    }
    // During build/SSG, log a warning and return a placeholder
    if (typeof window !== 'undefined') {
      console.error(
        'Supabase environment variables are missing. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      );
    }
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};
