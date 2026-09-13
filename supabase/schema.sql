-- ==============================================================================
-- WEBRUNZO - PRODUCTION-READY SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this script in your Supabase project's SQL Editor (https://supabase.com/dashboard)
-- This script creates:
--   1. Custom Profile & Role Management linked to auth.users
--   2. Tables for Customers, Websites, Plans, Templates, Storage, Orders, Payments, Tickets, Backups, Settings
--   3. Helper functions for Role-Based Access Control (is_admin, get_user_customer_id)
--   4. Row Level Security (RLS) policies on every table
--   5. Initial seeds for Master Plans and System Settings
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES & ROLES (1:1 with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  business_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  client_tier TEXT NOT NULL DEFAULT 'normal' CHECK (client_tier IN ('normal', 'premium')),
  customer_id TEXT, -- References customers.id for clients
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PLANS & TIERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_price NUMERIC NOT NULL,
  annual_price NUMERIC NOT NULL,
  description TEXT,
  popular_badge BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]'::jsonb,
  max_pages INT DEFAULT 5,
  storage TEXT DEFAULT '5 GB',
  support_level TEXT,
  revisions TEXT,
  domain_included BOOLEAN DEFAULT TRUE,
  turnaround_days INT DEFAULT 3,
  tier TEXT NOT NULL CHECK (tier IN ('normal', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TEMPLATES MARKETPLACE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_image TEXT,
  description TEXT,
  long_description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  price NUMERIC DEFAULT 0,
  popular BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'Published' CHECK (status IN ('Published', 'Draft', 'Archived')),
  tags TEXT[] DEFAULT '{}',
  demo_slug TEXT,
  is_master_template BOOLEAN DEFAULT FALSE,
  ownership_status TEXT DEFAULT 'WebRunzo',
  license_status TEXT DEFAULT 'Proprietary',
  copyright_notice TEXT,
  color_scheme JSONB,
  sample_sections JSONB,
  import_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. CUSTOMERS & WEBSITES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  client_tier TEXT NOT NULL DEFAULT 'normal' CHECK (client_tier IN ('normal', 'premium')),
  plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL,
  template_id TEXT REFERENCES public.templates(id) ON DELETE SET NULL,
  payment_status TEXT DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
  plan_start_date DATE,
  plan_expiry_date DATE,
  website_url TEXT,
  custom_domain TEXT,
  dns_status TEXT DEFAULT 'Active',
  ssl_status TEXT DEFAULT 'Active',
  website_status TEXT DEFAULT 'Live' CHECK (website_status IN ('Draft', 'In Progress', 'Live', 'Suspended', 'Expired')),
  maintenance_notice TEXT,
  account_status TEXT DEFAULT 'Active' CHECK (account_status IN ('Active', 'Pending', 'Expired')),
  notes TEXT,
  internal_notes TEXT,
  seo_score INT DEFAULT 95,
  speed_score INT DEFAULT 98,
  uptime_percent NUMERIC DEFAULT 99.98,
  auto_renew BOOLEAN DEFAULT TRUE,
  sla_level TEXT DEFAULT 'Standard 24h',
  header_scripts TEXT,
  footer_scripts TEXT,
  subscription_state TEXT DEFAULT 'ACTIVE',
  grace_period_end_date TIMESTAMPTZ,
  custom_content JSONB DEFAULT '{}'::jsonb,
  deployment JSONB DEFAULT '{}'::jsonb,
  activity_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. CUSTOMER STORAGE & FILE SYSTEM
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customer_storage (
  customer_id TEXT PRIMARY KEY REFERENCES public.customers(id) ON DELETE CASCADE,
  max_physical_capacity_gb NUMERIC DEFAULT 15,
  base_plan_limit_gb NUMERIC DEFAULT 5,
  extra_granted_gb NUMERIC DEFAULT 0,
  used_bytes BIGINT DEFAULT 0,
  breakdown JSONB DEFAULT '{"imagesBytes":0,"videosBytes":0,"documentsBytes":0,"websiteFilesBytes":0,"databaseBytes":0}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_files (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('image', 'video', 'document', 'code', 'database')),
  size_bytes BIGINT NOT NULL,
  size_formatted TEXT NOT NULL,
  mime_type TEXT,
  url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.storage_history (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  previous_limit_gb NUMERIC NOT NULL,
  new_limit_gb NUMERIC NOT NULL,
  change_amount_gb NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  expiry_date DATE,
  is_permanent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. ORDERS & PAYMENTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES public.plans(id) ON DELETE SET NULL,
  template_id TEXT REFERENCES public.templates(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Pending', 'In Progress', 'Completed', 'Cancelled')),
  payment_status TEXT DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
  date TIMESTAMPTZ DEFAULT NOW(),
  delivery_due_date DATE,
  requirements TEXT,
  internal_notes TEXT,
  client_tier TEXT DEFAULT 'normal',
  milestones JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  plan_name TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
  method TEXT DEFAULT 'Razorpay / Online',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. SUPPORT TICKETS & REPLIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  email TEXT,
  business_name TEXT,
  website_url TEXT,
  client_tier TEXT DEFAULT 'normal',
  plan_id TEXT,
  plan_name TEXT,
  query_type TEXT DEFAULT 'Free Query',
  request_type TEXT,
  subject TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'Normal',
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'In Review', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed')),
  lead_tracking_status TEXT,
  message TEXT NOT NULL,
  attachment_name TEXT,
  attachment_size TEXT,
  preferred_completion_date DATE,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('Client', 'Admin')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. NOTIFICATIONS, ENQUIRIES, BACKUPS, SETTINGS, AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.client_notifications (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'info'
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  selected_template_id TEXT,
  selected_plan_id TEXT,
  message TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Converted', 'Closed')),
  admin_notes TEXT
);

CREATE TABLE IF NOT EXISTS public.website_backups (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  website_url TEXT,
  custom_domain TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  size_formatted TEXT,
  size_bytes BIGINT,
  storage_location TEXT,
  status TEXT DEFAULT 'Success',
  type TEXT NOT NULL,
  version_tag TEXT,
  checksum TEXT,
  components_included JSONB,
  snapshot_data JSONB,
  notes TEXT,
  retention_days INT DEFAULT 30,
  expires_at TIMESTAMPTZ,
  is_staging_preview_ready BOOLEAN DEFAULT FALSE,
  staging_preview_url TEXT
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "user" TEXT NOT NULL,
  customer_id TEXT
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  business_name TEXT DEFAULT 'WebRunzo',
  brand_name TEXT DEFAULT 'WebRunzo Technologies',
  support_email TEXT DEFAULT 'support@webrunzo.com',
  support_phone TEXT DEFAULT '+1 (800) 555-0199',
  whatsapp_number TEXT DEFAULT '+18005550199',
  whatsapp_default_message TEXT,
  currency TEXT DEFAULT 'USD',
  currency_symbol TEXT DEFAULT '$',
  notify_new_enquiries BOOLEAN DEFAULT TRUE,
  notify_expiring_plans BOOLEAN DEFAULT TRUE,
  auto_welcome_email BOOLEAN DEFAULT TRUE,
  brand_tagline TEXT,
  agent_availability_mode TEXT DEFAULT 'auto',
  settings_json JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. SECURITY HELPER FUNCTIONS
-- ==============================================================================
-- Checks if currently authenticated user is an Admin
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

-- Gets the customer_id associated with the authenticated user
CREATE OR REPLACE FUNCTION public.get_auth_customer_id()
RETURNS TEXT AS $$
DECLARE
  v_cust_id TEXT;
BEGIN
  SELECT customer_id INTO v_cust_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF v_cust_id IS NULL THEN
    SELECT id INTO v_cust_id
    FROM public.customers
    WHERE user_id = auth.uid()
    LIMIT 1;
  END IF;

  RETURN v_cust_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Synonym for client row checks
CREATE OR REPLACE FUNCTION public.get_user_customer_id()
RETURNS TEXT AS $$
BEGIN
  RETURN public.get_auth_customer_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id TEXT;
  v_client_tier TEXT;
  v_business_name TEXT;
BEGIN
  -- Look for an existing customer record matching this user's email
  SELECT id, client_tier, business_name INTO v_customer_id, v_client_tier, v_business_name
  FROM public.customers
  WHERE LOWER(email) = LOWER(NEW.email)
  LIMIT 1;

  INSERT INTO public.profiles (id, email, full_name, role, client_tier, customer_id, business_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(v_client_tier, NEW.raw_user_meta_data->>'client_tier', 'normal'),
    v_customer_id,
    v_business_name
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      customer_id = COALESCE(public.profiles.customer_id, EXCLUDED.customer_id),
      business_name = COALESCE(public.profiles.business_name, EXCLUDED.business_name);

  -- Link user_id on customer record if matched
  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET user_id = NEW.id
    WHERE id = v_customer_id AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if an email exists across auth.users, profiles, or customers
CREATE OR REPLACE FUNCTION public.check_account_exists(email_input text)
RETURNS boolean AS $$
DECLARE
  v_exists boolean := false;
  v_clean_email text;
BEGIN
  v_clean_email := LOWER(TRIM(COALESCE(email_input, '')));
  IF v_clean_email = '' THEN
    RETURN false;
  END IF;

  -- 1. Check in auth.users
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE LOWER(email) = v_clean_email
  ) INTO v_exists;

  IF v_exists THEN
    RETURN true;
  END IF;

  -- 2. Check in public.profiles
  SELECT EXISTS(
    SELECT 1 FROM public.profiles WHERE LOWER(email) = v_clean_email
  ) INTO v_exists;

  IF v_exists THEN
    RETURN true;
  END IF;

  -- 3. Check in public.customers
  SELECT EXISTS(
    SELECT 1 FROM public.customers WHERE LOWER(email) = v_clean_email
  ) INTO v_exists;

  RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

GRANT EXECUTE ON FUNCTION public.check_account_exists(text) TO anon, authenticated;

-- ==============================================================================
-- 11. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_storage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES & INTEGRITY TRIGGERS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. PROFILES TABLE PROTECTION & RLS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- B. PLANS (Public viewable, Admin editable)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admin can manage plans" ON public.plans;
CREATE POLICY "Admin can manage plans"
  ON public.plans FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. TEMPLATES (Published templates are public, Admin manages all)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view published templates" ON public.templates;
CREATE POLICY "Public can view published templates"
  ON public.templates FOR SELECT
  TO anon, authenticated
  USING (status = 'Published' OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage templates" ON public.templates;
CREATE POLICY "Admin can manage templates"
  ON public.templates FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- D. CUSTOMERS & WEBSITES PROTECTION & RLS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_customer_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_admin() THEN
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

-- ------------------------------------------------------------------------------
-- E. AUTOMATED STORAGE INITIALIZATION & SYNCHRONIZATION
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- F. STORAGE HISTORY
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin can manage storage history" ON public.storage_history;
CREATE POLICY "Admin can manage storage history"
  ON public.storage_history FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own storage history" ON public.storage_history;
CREATE POLICY "Clients can view own storage history"
  ON public.storage_history FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ------------------------------------------------------------------------------
-- G. ORDERS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin can manage all orders" ON public.orders;
CREATE POLICY "Admin can manage all orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own orders" ON public.orders;
CREATE POLICY "Clients can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

DROP POLICY IF EXISTS "Public can submit checkout orders" ON public.orders;
CREATE POLICY "Public can submit checkout orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status IN ('New', 'Pending', 'In Progress')
    AND payment_status IN ('Pending', 'Paid')
  );

-- ------------------------------------------------------------------------------
-- H. PAYMENTS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin can manage all payments" ON public.payments;
CREATE POLICY "Admin can manage all payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own payments" ON public.payments;
CREATE POLICY "Clients can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ------------------------------------------------------------------------------
-- I. SUPPORT TICKETS & REPLIES
-- ------------------------------------------------------------------------------
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

-- CLIENT NOTIFICATIONS
DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.client_notifications;
CREATE POLICY "Admin can manage all notifications"
  ON public.client_notifications FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view and update own notifications" ON public.client_notifications;
CREATE POLICY "Clients can view and update own notifications"
  ON public.client_notifications FOR ALL
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ENQUIRIES (Public submission, Admin full control)
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admin can manage enquiries" ON public.enquiries;
CREATE POLICY "Admin can manage enquiries"
  ON public.enquiries FOR ALL
  TO authenticated
  USING (public.is_admin());

-- WEBSITE BACKUPS
DROP POLICY IF EXISTS "Admin can manage all backups" ON public.website_backups;
CREATE POLICY "Admin can manage all backups"
  ON public.website_backups FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own backups" ON public.website_backups;
CREATE POLICY "Clients can view own backups"
  ON public.website_backups FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ACTIVITY LOGS
DROP POLICY IF EXISTS "Admin can manage all activity logs" ON public.activity_logs;
CREATE POLICY "Admin can manage all activity logs"
  ON public.activity_logs FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own activity logs" ON public.activity_logs;
CREATE POLICY "Clients can view own activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ADMIN SETTINGS
DROP POLICY IF EXISTS "Public can view basic settings" ON public.admin_settings;
CREATE POLICY "Public can view basic settings"
  ON public.admin_settings FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admin can update settings" ON public.admin_settings;
CREATE POLICY "Admin can update settings"
  ON public.admin_settings FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ==============================================================================
-- 12.B ATOMIC LEAD TO CLIENT CONVERSION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.convert_enquiry_to_customer_atomic(
  p_enquiry_id TEXT,
  p_auth_user_id UUID,
  p_client_tier TEXT DEFAULT 'normal',
  p_plan_id TEXT DEFAULT NULL,
  p_template_id TEXT DEFAULT NULL,
  p_admin_name TEXT DEFAULT 'Admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_caller_uid UUID;
  v_enquiry RECORD;
  v_email TEXT;
  v_effective_tier TEXT;
  v_plan_id TEXT;
  v_template_id TEXT;
  v_customer RECORD;
  v_customer_id TEXT;
  v_is_existing_customer BOOLEAN := FALSE;
  v_order_id TEXT;
  v_is_existing_order BOOLEAN := FALSE;
  v_order_number TEXT;
  v_payment_id TEXT;
  v_is_existing_payment BOOLEAN := FALSE;
  v_txn_id TEXT;
  v_inv_number TEXT;
  v_clean_slug TEXT;
  v_website_url TEXT;
  v_now_iso TEXT;
  v_expiry_iso TEXT;
  v_custom_content JSONB;
BEGIN
  -- 1. CALLER AUTHORIZATION: STRICT ADMIN ONLY
  v_caller_uid := auth.uid();
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'FORBIDDEN',
      'error', 'Forbidden: Only administrators can convert lead enquiries into customer accounts.'
    );
  END IF;

  -- 2. INPUT VALIDATION
  IF p_enquiry_id IS NULL OR TRIM(p_enquiry_id) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INVALID_PARAM',
      'error', 'Missing or invalid enquiry identifier.'
    );
  END IF;

  IF p_auth_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INVALID_PARAM',
      'error', 'Missing or invalid authentication user identifier.'
    );
  END IF;

  -- 3. LOCK & VALIDATE ENQUIRY
  SELECT * INTO v_enquiry
  FROM public.enquiries
  WHERE id = p_enquiry_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NOT_FOUND',
      'error', 'Lead enquiry with ID "' || p_enquiry_id || '" was not found.'
    );
  END IF;

  IF v_enquiry.status = 'Converted' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_CONVERTED',
      'error', 'This lead enquiry has already been converted into a customer account.'
    );
  END IF;

  v_email := LOWER(TRIM(COALESCE(v_enquiry.email, '')));
  IF v_email = '' OR v_email NOT LIKE '%_@__%.__%' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INVALID_EMAIL',
      'error', 'Lead enquiry has an invalid email address ("' || COALESCE(v_enquiry.email, '') || '"). Please correct the email before conversion.'
    );
  END IF;

  IF v_email = 'hello.webrunzo@gmail.com' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ADMIN_EMAIL_CONFLICT',
      'error', 'Cannot convert lead using the Master Admin email address. Clients must have distinct email accounts.'
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (id = p_auth_user_id OR LOWER(TRIM(email)) = v_email)
      AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ACCOUNT_ROLE_CONFLICT',
      'error', 'Email or user account belongs to an administrator and cannot be converted to a client.'
    );
  END IF;

  -- 4. RESOLVE TIER, PLAN, TEMPLATE & URL DEFAULTS
  v_effective_tier := CASE
    WHEN LOWER(COALESCE(p_client_tier, '')) = 'premium' THEN 'premium'
    WHEN LOWER(COALESCE(v_enquiry.selected_plan_id, '')) IN ('plan-business', 'business', 'elite') THEN 'premium'
    WHEN LOWER(COALESCE(v_enquiry.selected_plan_id, '')) LIKE '%business%' THEN 'premium'
    WHEN LOWER(COALESCE(v_enquiry.selected_plan_id, '')) LIKE '%elite%' THEN 'premium'
    ELSE 'normal'
  END;

  v_plan_id := COALESCE(
    NULLIF(TRIM(p_plan_id), ''),
    NULLIF(TRIM(v_enquiry.selected_plan_id), ''),
    CASE WHEN v_effective_tier = 'premium' THEN 'plan-business' ELSE 'plan-pro' END
  );

  v_template_id := COALESCE(
    NULLIF(TRIM(p_template_id), ''),
    NULLIF(TRIM(v_enquiry.selected_template_id), ''),
    'tpl-biz-1'
  );

  v_clean_slug := REGEXP_REPLACE(LOWER(COALESCE(v_enquiry.business, 'mybrand')), '[^a-z0-9]', '', 'g');
  IF v_clean_slug = '' THEN
    v_clean_slug := 'client';
  END IF;
  v_website_url := 'https://' || v_clean_slug || '.webrunzo.app';

  v_now_iso := CURRENT_DATE::text;
  v_expiry_iso := (CURRENT_DATE + INTERVAL '1 year')::date::text;

  -- 5. ATOMIC MUTATION A: CUSTOMER CREATION OR SAFE REUSE (IDEMPOTENCY)
  SELECT * INTO v_customer
  FROM public.customers
  WHERE LOWER(TRIM(email)) = v_email
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    v_customer_id := v_customer.id;
    v_is_existing_customer := TRUE;

    UPDATE public.customers
    SET user_id = p_auth_user_id,
        client_tier = v_effective_tier,
        account_status = 'Active',
        plan_id = COALESCE(public.customers.plan_id, v_plan_id),
        template_id = COALESCE(public.customers.template_id, v_template_id),
        updated_at = NOW()
    WHERE id = v_customer_id
    RETURNING * INTO v_customer;
  ELSE
    v_customer_id := 'cust-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 12);
    v_is_existing_customer := FALSE;

    v_custom_content := jsonb_build_object(
      'businessName', COALESCE(NULLIF(TRIM(v_enquiry.business), ''), 'My Business'),
      'tagline', 'Professional High-Standard Business Solutions',
      'heroHeadline', 'Welcome to ' || COALESCE(NULLIF(TRIM(v_enquiry.business), ''), 'Our Business'),
      'heroSubhead', 'We provide premier services tailored to your exact industry requirements.',
      'primaryColor', CASE WHEN v_effective_tier = 'premium' THEN '#6366f1' ELSE '#2563eb' END,
      'logoText', UPPER(COALESCE(NULLIF(TRIM(v_enquiry.business), ''), 'BUSINESS')),
      'contactEmail', v_email,
      'contactPhone', COALESCE(NULLIF(TRIM(v_enquiry.phone), ''), '+1 (555) 000-0000'),
      'address', '100 Business Center Ave, Suite 100',
      'aboutText', COALESCE(NULLIF(TRIM(v_enquiry.business), ''), 'Our company') || ' provides turnkey services committed to quality and customer satisfaction.',
      'servicesList', jsonb_build_array(
        jsonb_build_object('title', 'Core Client Services', 'desc', 'Customized professional solutions delivered on time.'),
        jsonb_build_object('title', 'Customer Care & Support', 'desc', 'Direct access to your dedicated account manager and team.')
      ),
      'socialLinks', jsonb_build_object('instagram', 'https://instagram.com', 'facebook', 'https://facebook.com'),
      'onboarding', jsonb_build_object('status', 'Not Started')
    );

    INSERT INTO public.customers (
      id,
      user_id,
      name,
      business_name,
      email,
      phone,
      client_tier,
      plan_id,
      template_id,
      payment_status,
      plan_start_date,
      plan_expiry_date,
      website_url,
      website_status,
      account_status,
      notes,
      seo_score,
      speed_score,
      uptime_percent,
      custom_content,
      created_at,
      updated_at
    ) VALUES (
      v_customer_id,
      p_auth_user_id,
      COALESCE(NULLIF(TRIM(v_enquiry.name), ''), 'New Client'),
      COALESCE(NULLIF(TRIM(v_enquiry.business), ''), 'My Business'),
      v_email,
      COALESCE(NULLIF(TRIM(v_enquiry.phone), ''), '+1 (555) 000-0000'),
      v_effective_tier,
      v_plan_id,
      v_template_id,
      'Paid',
      CURRENT_DATE,
      (CURRENT_DATE + INTERVAL '1 year')::date,
      v_website_url,
      'In Progress',
      'Active',
      'Converted from Website Enquiry on ' || v_now_iso || '. Notes: "' || COALESCE(v_enquiry.message, '') || '"',
      CASE WHEN v_effective_tier = 'premium' THEN 98 ELSE 92 END,
      CASE WHEN v_effective_tier = 'premium' THEN 99 ELSE 94 END,
      CASE WHEN v_effective_tier = 'premium' THEN 99.98 ELSE 99.9 END,
      v_custom_content,
      NOW(),
      NOW()
    )
    RETURNING * INTO v_customer;
  END IF;

  -- 6. ATOMIC MUTATION B: CUSTOMER STORAGE ALLOCATION
  INSERT INTO public.customer_storage (
    customer_id,
    max_physical_capacity_gb,
    base_plan_limit_gb,
    extra_granted_gb,
    used_bytes,
    breakdown,
    updated_at
  ) VALUES (
    v_customer_id,
    CASE WHEN v_effective_tier = 'premium' THEN 50 ELSE 20 END,
    CASE WHEN v_effective_tier = 'premium' THEN 50 ELSE 20 END,
    0,
    0,
    '{"imagesBytes":0,"videosBytes":0,"documentsBytes":0,"websiteFilesBytes":0,"databaseBytes":0}'::jsonb,
    NOW()
  )
  ON CONFLICT (customer_id) DO UPDATE
  SET max_physical_capacity_gb = GREATEST(public.customer_storage.max_physical_capacity_gb, EXCLUDED.max_physical_capacity_gb),
      base_plan_limit_gb = GREATEST(public.customer_storage.base_plan_limit_gb, EXCLUDED.base_plan_limit_gb),
      updated_at = NOW();

  -- 7. ATOMIC MUTATION C: INITIAL ORDER CREATION OR SAFE REUSE
  SELECT id INTO v_order_id
  FROM public.orders
  WHERE customer_id = v_customer_id
  LIMIT 1;

  IF FOUND THEN
    v_is_existing_order := TRUE;
  ELSE
    v_is_existing_order := FALSE;
    v_order_id := 'ord-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 12);
    v_order_number := 'ORD-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');

    WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_number = v_order_number) LOOP
      v_order_number := 'ORD-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');
    END LOOP;

    INSERT INTO public.orders (
      id,
      order_number,
      customer_id,
      client_name,
      business_name,
      email,
      phone,
      plan_id,
      template_id,
      amount,
      status,
      payment_status,
      date,
      delivery_due_date,
      requirements,
      client_tier,
      milestones,
      created_at,
      updated_at
    ) VALUES (
      v_order_id,
      v_order_number,
      v_customer_id,
      v_customer.name,
      v_customer.business_name,
      v_email,
      v_customer.phone,
      v_plan_id,
      v_template_id,
      CASE WHEN v_effective_tier = 'premium' THEN 899 ELSE 499 END,
      'In Progress',
      'Paid',
      NOW(),
      (CURRENT_DATE + INTERVAL '3 days')::date,
      'Turnkey build for ' || v_customer.business_name || ' on ' || v_template_id || '. Converted from enquiry ' || p_enquiry_id || '.',
      v_effective_tier,
      jsonb_build_array(
        jsonb_build_object('title', 'Order Enrolled & Payment Verified', 'completed', true, 'date', v_now_iso),
        jsonb_build_object('title', 'Template Setup & Initial Build', 'completed', true, 'date', v_now_iso),
        jsonb_build_object('title', 'Live Deployment & Domain Connection', 'completed', false, 'date', v_now_iso)
      ),
      NOW(),
      NOW()
    );
  END IF;

  -- 8. ATOMIC MUTATION D: INITIAL PAYMENT RECORD OR SAFE REUSE
  SELECT id INTO v_payment_id
  FROM public.payments
  WHERE customer_id = v_customer_id
  LIMIT 1;

  IF FOUND THEN
    v_is_existing_payment := TRUE;
  ELSE
    v_is_existing_payment := FALSE;
    v_payment_id := 'pay-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 12);
    v_txn_id := 'TXN-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::text, 6, '0');
    v_inv_number := 'INV-2026-' || LPAD(FLOOR(RANDOM() * 900 + 100)::text, 3, '0');

    WHILE EXISTS (SELECT 1 FROM public.payments WHERE transaction_id = v_txn_id) LOOP
      v_txn_id := 'TXN-' || LPAD(FLOOR(RANDOM() * 900000 + 100000)::text, 6, '0');
    END LOOP;

    WHILE EXISTS (SELECT 1 FROM public.payments WHERE invoice_number = v_inv_number) LOOP
      v_inv_number := 'INV-2026-' || LPAD(FLOOR(RANDOM() * 900 + 100)::text, 3, '0');
    END LOOP;

    INSERT INTO public.payments (
      id,
      transaction_id,
      invoice_number,
      customer_id,
      customer_name,
      business_name,
      amount,
      plan_name,
      date,
      status,
      method,
      created_at
    ) VALUES (
      v_payment_id,
      v_txn_id,
      v_inv_number,
      v_customer_id,
      v_customer.name,
      v_customer.business_name,
      CASE WHEN v_effective_tier = 'premium' THEN 899 ELSE 499 END,
      CASE WHEN v_effective_tier = 'premium' THEN 'Business Elite (Annual)' ELSE 'Pro Growth (Annual)' END,
      NOW(),
      'Paid',
      'Electronic Settlement',
      NOW()
    );
  END IF;

  -- 9. ATOMIC MUTATION E: PROFILE LINKAGE
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    client_tier,
    customer_id,
    business_name,
    updated_at
  ) VALUES (
    p_auth_user_id,
    v_email,
    v_customer.name,
    'client',
    v_effective_tier,
    v_customer_id,
    v_customer.business_name,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET customer_id = EXCLUDED.customer_id,
      client_tier = EXCLUDED.client_tier,
      role = CASE WHEN public.profiles.role = 'admin' THEN 'admin' ELSE 'client' END,
      business_name = COALESCE(EXCLUDED.business_name, public.profiles.business_name),
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = NOW();

  -- 10. ATOMIC MUTATION F: MARK ENQUIRY CONVERTED
  UPDATE public.enquiries
  SET status = 'Converted',
      admin_notes = 'Converted to Customer: ' || v_customer.business_name || ' (ID: ' || v_customer_id || ') by ' || COALESCE(p_admin_name, 'Admin') || ' on ' || v_now_iso
  WHERE id = p_enquiry_id;

  -- 11. RETURN STRUCTURED DATA
  RETURN jsonb_build_object(
    'success', true,
    'code', 'CONVERTED',
    'customer_id', v_customer_id,
    'order_id', v_order_id,
    'payment_id', v_payment_id,
    'is_existing_customer', v_is_existing_customer,
    'is_existing_order', v_is_existing_order,
    'is_existing_payment', v_is_existing_payment,
    'client_tier', v_effective_tier,
    'plan_id', v_plan_id,
    'template_id', v_template_id,
    'account_status', v_customer.account_status,
    'customer', jsonb_build_object(
      'id', v_customer.id,
      'user_id', v_customer.user_id,
      'name', v_customer.name,
      'business_name', v_customer.business_name,
      'email', v_customer.email,
      'phone', v_customer.phone,
      'client_tier', v_customer.client_tier,
      'plan_id', v_customer.plan_id,
      'template_id', v_customer.template_id,
      'payment_status', v_customer.payment_status,
      'plan_start_date', v_customer.plan_start_date,
      'plan_expiry_date', v_customer.plan_expiry_date,
      'website_url', v_customer.website_url,
      'website_status', v_customer.website_status,
      'account_status', v_customer.account_status,
      'notes', v_customer.notes,
      'seo_score', v_customer.seo_score,
      'speed_score', v_customer.speed_score,
      'uptime_percent', v_customer.uptime_percent,
      'custom_content', v_customer.custom_content,
      'created_at', v_customer.created_at,
      'updated_at', v_customer.updated_at
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'TRANSACTION_FAILED',
      'error', 'Database conversion transaction failed: ' || SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.convert_enquiry_to_customer_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.convert_enquiry_to_customer_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.convert_enquiry_to_customer_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- ==============================================================================
-- 13. SEED DEFAULT SETTINGS & PLANS
-- ==============================================================================
INSERT INTO public.admin_settings (id, business_name, brand_name, support_email, support_phone, currency, currency_symbol)
VALUES ('default', 'WebRunzo', 'WebRunzo Technologies', 'support@webrunzo.com', '+1 (800) 555-0199', 'USD', '$')
ON CONFLICT (id) DO NOTHING;

-- Seed Plans
INSERT INTO public.plans (
  id, name, monthly_price, annual_price, tier, description, popular_badge, 
  turnaround_days, max_pages, storage, support_level, revisions, domain_included, features
) VALUES 
(
  'plan-starter',
  'Starter',
  2999,
  2999,
  'normal',
  'Ideal for small businesses and professionals seeking a clean, fast-launch digital presence.',
  FALSE,
  8,
  5,
  '5 GB Cloud Storage',
  'Standard Support',
  '2 Revision Rounds',
  TRUE,
  '["5 Custom Pages", "2 Revision Rounds", "Mobile Responsive", "Basic SEO", "WhatsApp / Contact Integration", "7–8 Day Delivery"]'::jsonb
),
(
  'plan-pro',
  'Professional',
  4999,
  4999,
  'normal',
  'Our most popular all-inclusive turnkey website package for growing businesses.',
  TRUE,
  8,
  10,
  '20 GB Cloud Storage',
  'Priority Support',
  '3 Revision Rounds',
  TRUE,
  '["10 Custom Pages", "3 Revision Rounds", "Mobile Responsive", "Basic SEO", "WhatsApp / Contact Integration", "Google Analytics", "7–8 Day Delivery", "Priority Support"]'::jsonb
),
(
  'plan-business',
  'Business VIP',
  8999,
  8999,
  'premium',
  'Comprehensive premium web presence with expedited delivery and VIP priority support.',
  FALSE,
  3,
  25,
  '50 GB Cloud Storage',
  'Priority VIP Support',
  'Unlimited Revisions & Tweaks During Build',
  TRUE,
  '["Up to 25 Custom Pages", "Unlimited Revisions & Tweaks During Build", "Mobile Responsive", "Advanced SEO", "Google Analytics", "WhatsApp / Contact Integration", "Priority VIP Support", "Expedited 2–3 Day Priority Delivery (VIP Perk)"]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Seed Core Marketplace Templates
INSERT INTO public.templates (
  id, name, category, preview_image, description, long_description, 
  features, price, popular, is_new, featured, status, tags, demo_slug,
  color_scheme, sample_sections
) VALUES 
(
  'tpl-biz-1',
  'Nexus Corporate Pro',
  'Business',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  'High-authority corporate layout with trust badges, client logos, case studies, and quote calculators.',
  'Designed for financial firms, consultancies, and modern enterprises seeking a high-converting digital presence.',
  '["Service Grid", "Client Case Studies", "Leadership Team", "Interactive Quote Form", "Investor Deck Download"]'::jsonb,
  34999,
  TRUE,
  FALSE,
  TRUE,
  'Published',
  ARRAY['Corporate', 'Finance', 'Consulting'],
  'nexus-corporate',
  '{"primary": "#1e293b", "secondary": "#0f172a", "accent": "#2563eb"}'::jsonb,
  '{"heroHeading": "Strategic Capital & Corporate Advisory for Modern Global Enterprises", "heroSubtitle": "We empower ambitious market leaders with institutional-grade insights and digital solutions.", "services": ["Corporate Restructuring", "Mergers & Acquisitions", "Strategic Advisory", "Risk Management"], "tagline": "Precision. Performance. Proven Value."}'::jsonb
),
(
  'tpl-biz-2',
  'Vanguard Consulting Hub',
  'Business',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'Sophisticated consulting website featuring scheduling integrations, insights hub, and ROI metrics.',
  'A clean, modern structure designed for management and boutique advisory practitioners.',
  '["Consultation Booking", "Whitepaper Downloads", "ROI Calculator", "Interactive Timeline"]'::jsonb,
  29999,
  FALSE,
  FALSE,
  FALSE,
  'Published',
  ARRAY['Consulting', 'Advisory', 'Strategy'],
  'vanguard-consulting',
  '{"primary": "#0f766e", "secondary": "#134e4a", "accent": "#0d9488"}'::jsonb,
  '{"heroHeading": "Unlocking Sustainable Growth Through Operational Excellence", "heroSubtitle": "Partner with senior industry strategists to scale your operating margins and optimize workflow.", "services": ["Operational Scaling", "Tech Stack Audit", "Change Management", "Executive Coaching"], "tagline": "Transforming potential into measurable market leadership."}'::jsonb
),
(
  'tpl-tech-1',
  'CloudPulse SaaS Platform',
  'Technology',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  'High-impact dark-mode SaaS design with live metrics, pricing calculators, and interactive feature breakdowns.',
  'Engineered for B2B software products, API providers, and developer platforms demanding rapid signup velocity.',
  '["Interactive Metrics Demo", "Feature Comparison Grid", "Self-Serve Pricing Slider", "Developer Documentation Shell"]'::jsonb,
  39999,
  TRUE,
  TRUE,
  TRUE,
  'Published',
  ARRAY['SaaS', 'Dark Mode', 'B2B', 'Tech'],
  'cloudpulse-saas',
  '{"primary": "#030712", "secondary": "#111827", "accent": "#6366f1"}'::jsonb,
  '{"heroHeading": "The Developer Cloud Built for Hyper-Scale Applications", "heroSubtitle": "Deploy serverless workloads globally in milliseconds with integrated telemetry, edge caching, and zero-config security.", "services": ["Global Edge Network", "Real-Time Telemetry", "Instant Rollbacks", "SOC-2 Type II Compliance"], "tagline": "Architected for velocity. Proven at scale."}'::jsonb
),
(
  'tpl-store-1',
  'Aura Minimalist Boutique',
  'E-Commerce',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  'Ultra-refined editorial storefront featuring high-resolution galleries, lookbooks, and checkout.',
  'Designed for luxury apparel, artisan goods, and lifestyle brands valuing aesthetics and conversion.',
  '["Dynamic Lookbook", "Quick View Drawer", "Currency Switcher", "Inventory Counter", "Size Recommendation Guide"]'::jsonb,
  34999,
  TRUE,
  FALSE,
  FALSE,
  'Published',
  ARRAY['E-Commerce', 'Boutique', 'Minimalist', 'Luxury'],
  'aura-boutique',
  '{"primary": "#18181b", "secondary": "#27272a", "accent": "#d97706"}'::jsonb,
  '{"heroHeading": "Timeless Artifacts Crafted for the Conscious Modern Wardrobe", "heroSubtitle": "Sustainable fibers, archival silhouettes, and uncompromising craftsmanship.", "services": ["Bespoke Tailoring", "Ethical Sourcing", "Worldwide Carbon-Neutral Shipping", "Complimentary Alterations"], "tagline": "Elevate the everyday through intentional design."}'::jsonb
)
ON CONFLICT (id) DO NOTHING;
