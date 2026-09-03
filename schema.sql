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
  method TEXT DEFAULT 'Credit Card / Stripe',
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
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, client_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'client_tier', 'normal')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
-- 12. RLS POLICIES
-- ==============================================================================

-- PROFILES
DROP POLICY IF EXISTS "Admin has full access to all profiles" ON public.profiles;
CREATE POLICY "Admin has full access to all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
CREATE POLICY "Users can view and update their own profile"
  ON public.profiles FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- PLANS (Public viewable, Admin editable)
DROP POLICY IF EXISTS "Anyone can view plans" ON public.plans;
CREATE POLICY "Anyone can view plans"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Admin can manage plans" ON public.plans;
CREATE POLICY "Admin can manage plans"
  ON public.plans FOR ALL
  TO authenticated
  USING (public.is_admin());

-- TEMPLATES (Published templates are public, Admin manages all)
DROP POLICY IF EXISTS "Public can view published templates" ON public.templates;
CREATE POLICY "Public can view published templates"
  ON public.templates FOR SELECT
  TO anon, authenticated
  USING (status = 'Published' OR public.is_admin());

DROP POLICY IF EXISTS "Admin can manage templates" ON public.templates;
CREATE POLICY "Admin can manage templates"
  ON public.templates FOR ALL
  TO authenticated
  USING (public.is_admin());

-- CUSTOMERS & WEBSITES
DROP POLICY IF EXISTS "Admin can manage all customers" ON public.customers;
CREATE POLICY "Admin can manage all customers"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view and update only their own customer record" ON public.customers;
CREATE POLICY "Clients can view and update only their own customer record"
  ON public.customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR id = public.get_auth_customer_id());

DROP POLICY IF EXISTS "Clients can update their own custom content" ON public.customers;
CREATE POLICY "Clients can update their own custom content"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR id = public.get_auth_customer_id())
  WITH CHECK (user_id = auth.uid() OR id = public.get_auth_customer_id());

-- CUSTOMER STORAGE
DROP POLICY IF EXISTS "Admin can manage all customer storage" ON public.customer_storage;
CREATE POLICY "Admin can manage all customer storage"
  ON public.customer_storage FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own storage" ON public.customer_storage;
CREATE POLICY "Clients can view own storage"
  ON public.customer_storage FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- CUSTOMER FILES
DROP POLICY IF EXISTS "Admin can manage all customer files" ON public.customer_files;
CREATE POLICY "Admin can manage all customer files"
  ON public.customer_files FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can manage own files" ON public.customer_files;
CREATE POLICY "Clients can manage own files"
  ON public.customer_files FOR ALL
  TO authenticated
  USING (customer_id = public.get_auth_customer_id())
  WITH CHECK (customer_id = public.get_auth_customer_id());

-- STORAGE HISTORY
DROP POLICY IF EXISTS "Admin can manage storage history" ON public.storage_history;
CREATE POLICY "Admin can manage storage history"
  ON public.storage_history FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own storage history" ON public.storage_history;
CREATE POLICY "Clients can view own storage history"
  ON public.storage_history FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- ORDERS
DROP POLICY IF EXISTS "Admin can manage all orders" ON public.orders;
CREATE POLICY "Admin can manage all orders"
  ON public.orders FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own orders" ON public.orders;
CREATE POLICY "Clients can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

DROP POLICY IF EXISTS "Public can submit checkout orders" ON public.orders;
CREATE POLICY "Public can submit checkout orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- PAYMENTS
DROP POLICY IF EXISTS "Admin can manage all payments" ON public.payments;
CREATE POLICY "Admin can manage all payments"
  ON public.payments FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view own payments" ON public.payments;
CREATE POLICY "Clients can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (customer_id = public.get_auth_customer_id());

-- SUPPORT TICKETS
DROP POLICY IF EXISTS "Admin can manage all tickets" ON public.support_tickets;
CREATE POLICY "Admin can manage all tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view and create own tickets" ON public.support_tickets;
CREATE POLICY "Clients can view and create own tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (customer_id = public.get_auth_customer_id())
  WITH CHECK (customer_id = public.get_auth_customer_id());

-- TICKET REPLIES
DROP POLICY IF EXISTS "Admin can manage all ticket replies" ON public.ticket_replies;
CREATE POLICY "Admin can manage all ticket replies"
  ON public.ticket_replies FOR ALL
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Clients can view and send replies on own tickets" ON public.ticket_replies;
CREATE POLICY "Clients can view and send replies on own tickets"
  ON public.ticket_replies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets
      WHERE id = ticket_replies.ticket_id
      AND customer_id = public.get_auth_customer_id()
    )
  )
  WITH CHECK (
    EXISTS (
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
