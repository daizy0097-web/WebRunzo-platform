-- ==============================================================================
-- WebRunzo Database Security Migration: Strict Admin Role Authorization
-- Migration File: 20260920_strict_admin_role_authorization.sql
-- Description:
--   Harden public.is_admin() to strictly verify caller role in public.profiles.
--   Eliminates reliance on email string matching in JWT metadata to satisfy
--   server-authoritative role verification across all RLS policies.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
