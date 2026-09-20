import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || 
  '';
const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || 
  '';

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
 * Safely derives origin from the running browser location or injected environment URL.
 * Never uses the AI Studio platform host (aistudio.google.com) as the app base URL,
 * ensuring password reset and authentication links open the actual WebRunzo application.
 */
export function getAppBaseUrl(): string {
  // Injected environment URL (e.g. Cloud Run service URL or custom deployment domain)
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_APP_URL as string)) ||
    (typeof process !== 'undefined' && (process.env?.VITE_APP_URL || process.env?.APP_URL)) || 
    '';
  const cleanEnvUrl =
    envUrl && typeof envUrl === 'string' && envUrl.startsWith('http') && !envUrl.includes('MY_APP_URL')
      ? envUrl.replace(/\/+$/, '')
      : '';

  // Browser location origin check
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.origin &&
    window.location.origin !== 'null' &&
    !window.location.origin.startsWith('about:')
  ) {
    const origin = window.location.origin.replace(/\/+$/, '');
    const hostname = (window.location.hostname || '').toLowerCase();

    // Prevent AI Studio platform frame origin from masquerading as the app's public URL
    const isAiStudioPlatform =
      hostname.includes('aistudio.google.com') ||
      origin.includes('aistudio.google.com');

    if (!isAiStudioPlatform) {
      return origin;
    }
  }

  // Fallback to real injected application host when running inside AI Studio
  if (cleanEnvUrl) {
    return cleanEnvUrl;
  }

  if (
    typeof window !== 'undefined' &&
    window.location?.origin &&
    window.location.origin !== 'null' &&
    !window.location.origin.includes('aistudio.google.com')
  ) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return '';
}

/**
 * Extract auth error description from the URL hash or search params if an auth callback failed
 * (e.g. invalid or expired password reset link).
 */
export function getAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    if (hash.includes('error=')) {
      const cleanHash = hash.replace(/^#\/?/, '').replace(/^\?/, '');
      const params = new URLSearchParams(cleanHash);
      const desc = params.get('error_description') || params.get('error');
      if (desc) return decodeURIComponent(desc.replace(/\+/g, ' '));
    }

    if (search.includes('error=')) {
      const cleanSearch = search.replace(/^\?/, '');
      const params = new URLSearchParams(cleanSearch);
      const desc = params.get('error_description') || params.get('error');
      if (desc) return decodeURIComponent(desc.replace(/\+/g, ' '));
    }
  } catch (err) {
    console.debug('Error parsing URL auth error:', err);
  }
  return null;
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
