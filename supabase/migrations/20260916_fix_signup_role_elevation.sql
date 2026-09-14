-- ==============================================================================
-- Migration: 20260916_fix_signup_role_elevation.sql
-- Description: Fix self-signup role elevation by ensuring public.handle_new_user()
-- never trusts NEW.raw_user_meta_data->>'role'. All new signups default to 'client',
-- while preserving the legitimate master admin account (hello.webrunzo@gmail.com).
-- Customer email linking behavior is preserved without alteration.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id TEXT;
  v_client_tier TEXT;
  v_business_name TEXT;
  v_role TEXT;
BEGIN
  -- Look for an existing customer record matching this user's email
  SELECT id, client_tier, business_name INTO v_customer_id, v_client_tier, v_business_name
  FROM public.customers
  WHERE LOWER(email) = LOWER(NEW.email)
  LIMIT 1;

  -- Enforce server-authoritative role assignment:
  -- NEVER trust raw_user_meta_data->>'role'. Default to 'client' for all signups,
  -- while preserving the legitimate master admin account.
  IF LOWER(TRIM(COALESCE(NEW.email, ''))) = 'hello.webrunzo@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, client_tier, customer_id, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    v_role,
    COALESCE(v_client_tier, NEW.raw_user_meta_data->>'client_tier', 'normal'),
    v_customer_id,
    v_business_name
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      customer_id = COALESCE(public.profiles.customer_id, EXCLUDED.customer_id),
      business_name = COALESCE(public.profiles.business_name, EXCLUDED.business_name);

  -- Link user_id on customer record if matched (preserved customer-linking behavior)
  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET user_id = NEW.id
    WHERE id = v_customer_id AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the trigger is properly bound to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
