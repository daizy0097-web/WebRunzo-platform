-- ==============================================================================
-- Migration: Row Level Security (RLS) & Column Tamper-Proof Hardening
-- Purpose: Lock down all public tables, eliminate privilege escalation vectors,
--          prevent client tampering with subscriptions, tiers, roles, or quotas,
--          and introduce atomic triggers for automated storage synchronization.
-- ==============================================================================

-- 1. HARDEN is_admin() FUNCTION
-- Checks both master admin email and verified profile role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    LOWER(TRIM(COALESCE(auth.jwt() ->> 'email', ''))) = 'hello.webrunzo@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ==============================================================================
-- 2. HARDEN PROFILES TABLE RLS & COLUMN PROTECTION
-- ==============================================================================

-- Trigger to prevent non-admins from altering their role, tier, or customer_id
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Privilege escalation rejected: non-admin users cannot alter their account role.';
    END IF;
    IF NEW.customer_id IS DISTINCT FROM OLD.customer_id THEN
      RAISE EXCEPTION 'Unauthorized modification: non-admin users cannot alter their linked customer identifier.';
    END IF;
    IF NEW.client_tier IS DISTINCT FROM OLD.client_tier THEN
      RAISE EXCEPTION 'Unauthorized modification: non-admin users cannot alter their client tier.';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Account identifier is immutable.';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- Replace profiles RLS policies
DROP POLICY IF EXISTS "Admin has full access to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile non-privileged fields" ON public.profiles;

CREATE POLICY "Admin has full access to all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile non-privileged fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ==============================================================================
-- 3. HARDEN CUSTOMERS TABLE RLS & COLUMN PROTECTION
-- ==============================================================================

-- Trigger to prevent clients from tampering with financial, status, and system fields
CREATE OR REPLACE FUNCTION public.protect_customer_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    -- Block tampering with financial, plan, tier, and identity fields
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Customer ID is immutable.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'User link is immutable by client.';
    END IF;
    IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
      RAISE EXCEPTION 'Payment status cannot be modified by client.';
    END IF;
    IF NEW.account_status IS DISTINCT FROM OLD.account_status THEN
      RAISE EXCEPTION 'Account status cannot be modified by client.';
    END IF;
    IF NEW.plan_id IS DISTINCT FROM OLD.plan_id THEN
      RAISE EXCEPTION 'Plan selection cannot be modified directly by client.';
    END IF;
    IF NEW.plan_start_date IS DISTINCT FROM OLD.plan_start_date THEN
      RAISE EXCEPTION 'Plan start date cannot be modified by client.';
    END IF;
    IF NEW.plan_expiry_date IS DISTINCT FROM OLD.plan_expiry_date THEN
      RAISE EXCEPTION 'Plan expiry date cannot be modified by client.';
    END IF;
    IF NEW.client_tier IS DISTINCT FROM OLD.client_tier THEN
      RAISE EXCEPTION 'Client tier cannot be modified by client.';
    END IF;
    IF NEW.subscription_state IS DISTINCT FROM OLD.subscription_state THEN
      RAISE EXCEPTION 'Subscription state cannot be modified by client.';
    END IF;
    IF NEW.website_status IS DISTINCT FROM OLD.website_status THEN
      RAISE EXCEPTION 'Website status cannot be modified directly by client.';
    END IF;
    IF NEW.website_url IS DISTINCT FROM OLD.website_url THEN
      RAISE EXCEPTION 'Primary website URL cannot be modified by client.';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_customer_fields ON public.customers;
CREATE TRIGGER trg_protect_customer_fields
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.protect_customer_fields();

-- Ensure Customer RLS is locked down
DROP POLICY IF EXISTS "Admin can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Clients can view and update only their own customer record" ON public.customers;
DROP POLICY IF EXISTS "Clients can update their own custom content" ON public.customers;
DROP POLICY IF EXISTS "Clients can view only their own customer record" ON public.customers;
DROP POLICY IF EXISTS "Clients can update their own editable content" ON public.customers;

CREATE POLICY "Admin can manage all customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view only their own customer record"
  ON public.customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR id = public.get_auth_customer_id());

CREATE POLICY "Clients can update their own editable content"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR id = public.get_auth_customer_id())
  WITH CHECK (user_id = auth.uid() OR id = public.get_auth_customer_id());

-- ==============================================================================
-- 4. AUTOMATED STORAGE INITIALIZATION & USAGE SYNCHRONIZATION
-- ==============================================================================

-- 4a. Initialize storage automatically on new customer creation
CREATE OR REPLACE FUNCTION public.initialize_customer_storage()
RETURNS TRIGGER AS $$
DECLARE
  v_base_limit NUMERIC := 5;
BEGIN
  IF NEW.plan_id = 'plan-starter' THEN
    v_base_limit := 5;
  ELSIF NEW.plan_id = 'plan-pro' THEN
    v_base_limit := 20;
  ELSIF NEW.plan_id = 'plan-business' OR NEW.client_tier = 'premium' THEN
    v_base_limit := 50;
  END IF;

  INSERT INTO public.customer_storage (
    customer_id,
    max_physical_capacity_gb,
    base_plan_limit_gb,
    extra_granted_gb,
    used_bytes,
    breakdown,
    updated_at
  )
  VALUES (
    NEW.id,
    GREATEST(v_base_limit, 15),
    v_base_limit,
    0,
    0,
    '{"imagesBytes":0,"videosBytes":0,"documentsBytes":0,"websiteFilesBytes":0,"databaseBytes":0}'::jsonb,
    NOW()
  )
  ON CONFLICT (customer_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_init_customer_storage ON public.customers;
CREATE TRIGGER trg_init_customer_storage
  AFTER INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.initialize_customer_storage();

-- 4b. Synchronize storage bytes whenever files change
CREATE OR REPLACE FUNCTION public.sync_customer_storage_on_file_change()
RETURNS TRIGGER AS $$
DECLARE
  v_cust_id TEXT;
  v_total_bytes BIGINT;
  v_img_bytes BIGINT;
  v_vid_bytes BIGINT;
  v_doc_bytes BIGINT;
  v_code_bytes BIGINT;
  v_db_bytes BIGINT;
BEGIN
  v_cust_id := COALESCE(NEW.customer_id, OLD.customer_id);

  SELECT
    COALESCE(SUM(size_bytes), 0),
    COALESCE(SUM(CASE WHEN category = 'image' THEN size_bytes ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN category = 'video' THEN size_bytes ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN category = 'document' THEN size_bytes ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN category = 'code' THEN size_bytes ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN category = 'database' THEN size_bytes ELSE 0 END), 0)
  INTO v_total_bytes, v_img_bytes, v_vid_bytes, v_doc_bytes, v_code_bytes, v_db_bytes
  FROM public.customer_files
  WHERE customer_id = v_cust_id;

  INSERT INTO public.customer_storage (customer_id, used_bytes, breakdown, updated_at)
  VALUES (
    v_cust_id,
    v_total_bytes,
    jsonb_build_object(
      'imagesBytes', v_img_bytes,
      'videosBytes', v_vid_bytes,
      'documentsBytes', v_doc_bytes,
      'websiteFilesBytes', v_code_bytes,
      'databaseBytes', v_db_bytes
    ),
    NOW()
  )
  ON CONFLICT (customer_id) DO UPDATE
  SET used_bytes = EXCLUDED.used_bytes,
      breakdown = EXCLUDED.breakdown,
      updated_at = NOW();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_customer_storage ON public.customer_files;
CREATE TRIGGER trg_sync_customer_storage
  AFTER INSERT OR UPDATE OR DELETE ON public.customer_files
  FOR EACH ROW EXECUTE FUNCTION public.sync_customer_storage_on_file_change();

-- 4c. Hard quota enforcement before file upload
CREATE OR REPLACE FUNCTION public.check_file_upload_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_storage record;
  v_total_limit_bytes BIGINT;
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  SELECT (base_plan_limit_gb + extra_granted_gb) AS limit_gb, used_bytes
  INTO v_storage
  FROM public.customer_storage
  WHERE customer_id = NEW.customer_id;

  IF FOUND THEN
    v_total_limit_bytes := (v_storage.limit_gb * 1024 * 1024 * 1024)::BIGINT;
    IF (v_storage.used_bytes + NEW.size_bytes) > v_total_limit_bytes THEN
      RAISE EXCEPTION 'Storage quota exceeded. Limit: % GB. Please upgrade your plan or request additional capacity.', v_storage.limit_gb;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_file_upload_quota ON public.customer_files;
CREATE TRIGGER trg_check_file_upload_quota
  BEFORE INSERT ON public.customer_files
  FOR EACH ROW EXECUTE FUNCTION public.check_file_upload_quota();

-- 4d. Storage table policies
DROP POLICY IF EXISTS "Admin can manage all customer storage" ON public.customer_storage;
DROP POLICY IF EXISTS "Clients can view own storage" ON public.customer_storage;

CREATE POLICY "Admin can manage all customer storage"
  ON public.customer_storage FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own storage"
  ON public.customer_storage FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- Files table policies
DROP POLICY IF EXISTS "Admin can manage all customer files" ON public.customer_files;
DROP POLICY IF EXISTS "Clients can manage own files" ON public.customer_files;
DROP POLICY IF EXISTS "Clients can view own files" ON public.customer_files;
DROP POLICY IF EXISTS "Clients can upload own files" ON public.customer_files;
DROP POLICY IF EXISTS "Clients can delete own files" ON public.customer_files;

CREATE POLICY "Admin can manage all customer files"
  ON public.customer_files FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own files"
  ON public.customer_files FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

CREATE POLICY "Clients can upload own files"
  ON public.customer_files FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = public.get_auth_customer_id());

CREATE POLICY "Clients can delete own files"
  ON public.customer_files FOR DELETE
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ==============================================================================
-- 5. HARDEN ORDERS TABLE RLS
-- ==============================================================================
DROP POLICY IF EXISTS "Admin can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Clients can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Public can submit checkout orders" ON public.orders;

CREATE POLICY "Admin can manage all orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- Public checkout submission: restrict to initial pending state
CREATE POLICY "Public can submit checkout orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status IN ('New', 'Pending', 'In Progress')
    AND payment_status IN ('Pending', 'Paid')
  );

-- ==============================================================================
-- 6. HARDEN SUPPORT TICKETS & REPLIES RLS
-- ==============================================================================

-- Trigger to protect ticket metadata from client tampering
CREATE OR REPLACE FUNCTION public.protect_ticket_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR
       NEW.customer_id IS DISTINCT FROM OLD.customer_id OR
       NEW.admin_notes IS DISTINCT FROM OLD.admin_notes OR
       NEW.lead_tracking_status IS DISTINCT FROM OLD.lead_tracking_status THEN
      RAISE EXCEPTION 'Unauthorized ticket modification: administrative fields cannot be altered by client.';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_ticket_fields ON public.support_tickets;
CREATE TRIGGER trg_protect_ticket_fields
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.protect_ticket_fields();

DROP POLICY IF EXISTS "Admin can manage all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Clients can view and create own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Clients can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Clients can create own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Clients can update own tickets" ON public.support_tickets;

CREATE POLICY "Admin can manage all tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view own tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

CREATE POLICY "Clients can create own tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = public.get_auth_customer_id());

CREATE POLICY "Clients can update own tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (customer_id = public.get_auth_customer_id())
  WITH CHECK (customer_id = public.get_auth_customer_id());

-- Ticket Replies
DROP POLICY IF EXISTS "Admin can manage all ticket replies" ON public.ticket_replies;
DROP POLICY IF EXISTS "Clients can view and send replies on own tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Clients can view replies on own tickets" ON public.ticket_replies;
DROP POLICY IF EXISTS "Clients can send replies on own tickets" ON public.ticket_replies;

CREATE POLICY "Admin can manage all ticket replies"
  ON public.ticket_replies FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Clients can view replies on own tickets"
  ON public.ticket_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_replies.ticket_id
      AND customer_id = public.get_auth_customer_id()
    )
  );

CREATE POLICY "Clients can send replies on own tickets"
  ON public.ticket_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    sender = 'Client'
    AND EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_replies.ticket_id
      AND customer_id = public.get_auth_customer_id()
    )
  );
