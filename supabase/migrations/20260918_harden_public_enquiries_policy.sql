-- ==============================================================================
-- Migration: 20260918_harden_public_enquiries_policy.sql
-- Description: Harden public.enquiries INSERT policy.
-- Ensures anonymous and public users can only submit enquiries with initial
-- status 'New' (or NULL which defaults to 'New') and prevents injection of
-- admin_notes, while preserving full administrative control for admins.
-- ==============================================================================

-- Drop existing permissive public insertion policy
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;

-- Recreate with strict status and admin_notes validation
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (
      (status IS NULL OR status = 'New')
      AND (admin_notes IS NULL OR TRIM(admin_notes) = '')
    )
    OR public.is_admin()
  );
