-- ==============================================================================
-- Migration: 20260917_remove_unverified_customer_linking.sql
-- Description: Fix Pre-Verification Customer Account Hijack.
-- Removes automatic customer lookup and customers.user_id linkage from
-- public.handle_new_user(). Newly created users receive a profile with:
--   - role set server-side ('admin' for hello.webrunzo@gmail.com, 'client' for others)
--   - client_tier initialized to 'normal'
--   - customer_id and business_name initialized to NULL
-- Preserves existing profile data on conflict without overwriting role.
-- Legitimate customer linking is deferred strictly to:
--   1) convert_enquiry_to_customer_atomic() (admin lead conversion)
--   2) link_authenticated_client_customer() (authenticated client portal sign-in)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Enforce server-authoritative role assignment:
  -- NEVER trust raw_user_meta_data->>'role'. Default to 'client' for all signups,
  -- while preserving the legitimate master admin account.
  IF LOWER(TRIM(COALESCE(NEW.email, ''))) = 'hello.webrunzo@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'client';
  END IF;

  -- Create initial profile row without unverified customer binding.
  INSERT INTO public.profiles (id, email, full_name, role, client_tier, customer_id, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role,
    'normal',
    NULL,
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
