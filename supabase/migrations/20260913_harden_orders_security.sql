-- ==============================================================================
-- WebRunzo Database Security Migration: Orders Hardening & Server Authority
-- Migration File: 20260913_harden_orders_security.sql
-- Description:
--   1. Revoke/Drop anonymous INSERT capability on public.orders table.
--   2. Restrict direct order INSERT strictly to authenticated clients for their
--      own customer_id and enforce payment_status = 'Pending'.
--   3. Change default payment_status from 'Paid' to 'Pending'.
--   4. Attach protect_order_fields trigger to prevent non-admins from changing
--      payment_status to 'Paid', or altering customer_id/amount.
--   5. Retain full administrative management for WebRunzo admins.
--   6. Preserve public enquiry/lead submission on public.enquiries.
-- ==============================================================================

-- 1. DROP THE VULNERABLE ANONYMOUS INSERT POLICY ON public.orders
DROP POLICY IF EXISTS "Public can submit checkout orders" ON public.orders;

-- 2. ALTER payment_status COLUMN DEFAULT TO 'Pending' (NEVER default to 'Paid')
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'Pending';

-- 3. ENSURE ADMIN FULL ACCESS POLICY
DROP POLICY IF EXISTS "Admin can manage all orders" ON public.orders;
CREATE POLICY "Admin can manage all orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. ENSURE CLIENT SELECT POLICY (Clients view only their own orders)
DROP POLICY IF EXISTS "Clients can view own orders" ON public.orders;
CREATE POLICY "Clients can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- 5. CREATE RESTRICTED CLIENT INSERT POLICY (Authenticated clients only)
--    Anonymous users CANNOT insert into public.orders.
--    Clients can ONLY insert orders for their own customer_id.
--    Clients CANNOT set payment_status to 'Paid' (strictly 'Pending').
DROP POLICY IF EXISTS "Clients can create own orders" ON public.orders;
CREATE POLICY "Clients can create own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = public.get_auth_customer_id()
    AND payment_status = 'Pending'
    AND status IN ('New', 'Pending')
  );

-- 6. PREVENT CLIENT TAMPERING WITH PAYMENT STATUS, PRICING, OR OWNERSHIP
CREATE OR REPLACE FUNCTION public.protect_order_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    -- Non-admins cannot alter payment_status to 'Paid'
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND NEW.payment_status = 'Paid' THEN
      RAISE EXCEPTION 'Unauthorized order modification: payment_status cannot be set to Paid by client. Payment verification must be server-authoritative.';
    END IF;

    -- Non-admins cannot alter order ownership
    IF NEW.customer_id IS DISTINCT FROM OLD.customer_id THEN
      RAISE EXCEPTION 'Unauthorized order modification: customer_id cannot be altered.';
    END IF;

    -- Non-admins cannot alter order pricing
    IF NEW.amount IS DISTINCT FROM OLD.amount THEN
      RAISE EXCEPTION 'Unauthorized order modification: order amount cannot be altered.';
    END IF;

    -- Non-admins cannot alter order number
    IF NEW.order_number IS DISTINCT FROM OLD.order_number THEN
      RAISE EXCEPTION 'Unauthorized order modification: order_number cannot be altered.';
    END IF;
  END IF;

  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_order_fields ON public.orders;
CREATE TRIGGER trg_protect_order_fields
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.protect_order_fields();

-- 7. PRESERVE PUBLIC ENQUIRY / LEAD SUBMISSION
--    Ensure public prospective clients can submit contact leads without error
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
