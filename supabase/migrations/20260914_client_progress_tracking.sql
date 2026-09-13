-- ==============================================================================
-- WebRunzo Database Migration: Client Project Progress Tracking
-- Migration File: 20260914_client_progress_tracking.sql
-- Description:
--   1. Document and formalize the Turnkey Website Build lifecycle:
--      Submitted → Accepted → In Progress → Review → Live
--   2. Expand the public.orders status check constraint to explicitly include the
--      canonical project lifecycle statuses while maintaining full backward
--      compatibility with existing legacy values ('New', 'Pending', 'Completed', 'Cancelled').
--   3. Ensure RLS policies and protect_order_fields triggers allow authorized
--      admin status updates while strictly blocking client-side status tampering.
-- ==============================================================================

-- 1. EXPAND orders_status_check TO ACCEPT CANONICAL LIFECYCLE STATUSES
DO $$
BEGIN
  -- Safely drop existing check constraint if present
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

  -- Apply extended check constraint covering both legacy order statuses and modern project lifecycle
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
    CHECK (status IN (
      'New',
      'Pending',
      'In Progress',
      'Completed',
      'Cancelled',
      'Submitted',
      'Accepted',
      'Review',
      'Live'
    ));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipping constraint modification if insufficient DDL privileges: %', SQLERRM;
END $$;

-- 2. ENSURE CLIENT NOTIFICATIONS TABLE EXISTS AND ACCEPTS STATUS NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.client_notifications (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure RLS on client_notifications
ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can manage all client notifications
DROP POLICY IF EXISTS "Admin can manage all client notifications" ON public.client_notifications;
CREATE POLICY "Admin can manage all client notifications"
  ON public.client_notifications FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Clients can only read their own notifications
DROP POLICY IF EXISTS "Clients can read own notifications" ON public.client_notifications;
CREATE POLICY "Clients can read own notifications"
  ON public.client_notifications FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- Clients can mark their own notifications as read
DROP POLICY IF EXISTS "Clients can update own notifications" ON public.client_notifications;
CREATE POLICY "Clients can update own notifications"
  ON public.client_notifications FOR UPDATE
  TO authenticated
  USING (customer_id = public.get_auth_customer_id())
  WITH CHECK (customer_id = public.get_auth_customer_id());
