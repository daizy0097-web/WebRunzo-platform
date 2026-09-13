import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that credentials exist and are non-placeholder
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  supabaseAnonKey.length > 20
);

// Fallback dummy URL for initial construction when not configured, preventing crash
const resolvedUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const resolvedKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name?: string;
  business_name?: string;
  role: 'admin' | 'client';
  client_tier: 'normal' | 'premium';
  customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Resolves the primary base URL of the running application.
 * Safely derives origin from the current window location in the browser,
 * ensuring the exact public origin is used regardless of build-time env vars.
 */
export function getAppBaseUrl(): string {
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.origin &&
    window.location.origin !== 'null' &&
    !window.location.origin.startsWith('about:')
  ) {
    return window.location.origin.replace(/\/+$/, '');
  }

  const envUrl = (import.meta.env.VITE_APP_URL as string) || '';
  if (
    envUrl &&
    typeof envUrl === 'string' &&
    envUrl.startsWith('http') &&
    !envUrl.includes('MY_APP_URL')
  ) {
    return envUrl.replace(/\/+$/, '');
  }

  return '';
}

/**
 * Fetch the authenticated user's profile and role from the `profiles` table.
 */
export async function getProfile(userId: string): Promise<SupabaseProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching Supabase user profile:', error.message);
      return null;
    }
    return data as SupabaseProfile;
  } catch (err) {
    console.error('Exception fetching profile:', err);
    return null;
  }
}
