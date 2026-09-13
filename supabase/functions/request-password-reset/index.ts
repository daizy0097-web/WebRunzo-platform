import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = body.email || '';
    const redirectTo = body.redirectTo || '';

    const normalizedEmail = String(rawEmail).trim().toLowerCase();

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'INVALID_EMAIL',
          message: 'Please provide a valid email address.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Server configuration error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
      return new Response(
        JSON.stringify({
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Authentication service is not properly configured on the server.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Initialize privileged admin client with service role key (NEVER exposed to frontend)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Authoritative check: Search Supabase Auth users via Admin API
    let userExists = false;

    try {
      // List users through Admin API to check if an auth.users record exists
      let page = 1;
      const perPage = 1000;
      let hasMore = true;

      while (!userExists && hasMore) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (listError) {
          console.error('Error listing auth users:', listError);
          break;
        }

        const users = listData?.users || [];
        if (users.some((u) => u.email?.toLowerCase() === normalizedEmail)) {
          userExists = true;
          break;
        }

        if (users.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    } catch (authErr) {
      console.error('Exception querying auth admin listUsers:', authErr);
    }

    // 2. Database check: Verify public.profiles table
    if (!userExists) {
      try {
        const { data: profile, error: profileErr } = await supabaseAdmin
          .from('profiles')
          .select('id, email, role')
          .ilike('email', normalizedEmail)
          .maybeSingle();

        if (!profileErr && profile) {
          userExists = true;
        }
      } catch (profileLookupErr) {
        console.error('Exception querying profiles:', profileLookupErr);
      }
    }

    // 3. Database check: Verify public.customers table
    if (!userExists) {
      try {
        const { data: customer, error: customerErr } = await supabaseAdmin
          .from('customers')
          .select('id, email')
          .ilike('email', normalizedEmail)
          .maybeSingle();

        if (!customerErr && customer) {
          userExists = true;
        }
      } catch (custLookupErr) {
        console.error('Exception querying customers:', custLookupErr);
      }
    }

    // If account not found across Auth and Database, reject with ACCOUNT_NOT_FOUND
    if (!userExists) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'This email is not associated with a WebRunzo account.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // If account exists, trigger the official Supabase password reset
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: redirectTo || undefined,
      }
    );

    if (resetError) {
      console.error('Supabase resetPasswordForEmail error:', resetError);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'RESET_FAILED',
          message: resetError.message || 'Unable to send password reset email.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Return success indicating reset instructions dispatched
    return new Response(
      JSON.stringify({
        success: true,
        code: 'RESET_SENT',
        message: 'Password reset link has been sent to your email. Please check your inbox and spam folder.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error('Unhandled Edge Function error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        message: err?.message || 'An unexpected error occurred while processing your request.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
