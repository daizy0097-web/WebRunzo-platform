-- ==============================================================================
-- Migration: 20260919_harden_client_notifications_rls.sql
-- Description: Harden public.client_notifications RLS.
-- Replaces overly broad FOR ALL policy with granular SELECT and UPDATE policies.
-- Prevents clients from deleting notifications or injecting arbitrary messages.
-- Restricts client INSERT strictly to the automated support query receipt flow.
-- ==============================================================================

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.client_notifications;
DROP POLICY IF EXISTS "Clients can view and update own notifications" ON public.client_notifications;
DROP POLICY IF EXISTS "Clients can view own notifications" ON public.client_notifications;
DROP POLICY IF EXISTS "Clients can update own notifications" ON public.client_notifications;
DROP POLICY IF EXISTS "Clients can insert own support receipts" ON public.client_notifications;

-- 2. Admin full management
CREATE POLICY "Admin can manage all notifications"
  ON public.client_notifications FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Clients can SELECT own notifications
CREATE POLICY "Clients can view own notifications"
  ON public.client_notifications FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- 4. Clients can UPDATE (mark read) own notifications
CREATE POLICY "Clients can update own notifications"
  ON public.client_notifications FOR UPDATE
  TO authenticated
  USING (customer_id = public.get_auth_customer_id())
  WITH CHECK (customer_id = public.get_auth_customer_id());

-- 5. Clients can only INSERT legitimate automatic support receipts
CREATE POLICY "Clients can insert own support receipts"
  ON public.client_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = public.get_auth_customer_id()
    AND title IN ('Support Query Received', 'Assistance Request Received')
    AND message = 'Your query has been logged. Our engineering specialist will review it promptly.'
    AND type = 'info'
  );
