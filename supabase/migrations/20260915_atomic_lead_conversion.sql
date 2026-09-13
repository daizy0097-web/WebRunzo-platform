-- ==============================================================================
-- WebRunzo Database Migration: Atomic Lead-to-Client Conversion
-- Migration File: 20260915_atomic_lead_conversion.sql
-- Description:
--   1. Encapsulate all database mutations for lead-to-client conversion
--      inside a single atomic PostgreSQL transaction.
--   2. Mutations performed atomically:
--      - Enquiry status and eligibility verification
--      - Customer creation or safe idempotent reuse
--      - Customer storage allocation / upsert
--      - Initial order creation or safe idempotent reuse
--      - Initial payment / ledger record creation or safe idempotent reuse
--      - Client profile linkage (profiles table)
--      - Marking enquiry as 'Converted' with admin notes ONLY after all operations succeed
--   3. If any database operation fails, the entire transaction rolls back.
--      Under no circumstances will an enquiry become 'Converted' if any related write fails.
--   4. Function is marked SECURITY DEFINER with strict search_path = public, auth, extensions.
--   5. Function verifies caller is an administrator via public.is_admin().
--   6. Grants EXECUTE strictly to authenticated users and service_role; revokes from anon and PUBLIC.
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
  -- ---------------------------------------------------------------------------
  -- 1. CALLER AUTHORIZATION: STRICT ADMIN ONLY
  -- ---------------------------------------------------------------------------
  v_caller_uid := auth.uid();
  IF NOT public.is_admin() THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'FORBIDDEN',
      'error', 'Forbidden: Only administrators can convert lead enquiries into customer accounts.'
    );
  END IF;

  -- ---------------------------------------------------------------------------
  -- 2. INPUT VALIDATION
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 3. LOCK & VALIDATE ENQUIRY
  -- ---------------------------------------------------------------------------
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

  -- Reject if already converted
  IF v_enquiry.status = 'Converted' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ALREADY_CONVERTED',
      'error', 'This lead enquiry has already been converted into a customer account.'
    );
  END IF;

  -- Email validation
  v_email := LOWER(TRIM(COALESCE(v_enquiry.email, '')));
  IF v_email = '' OR v_email NOT LIKE '%_@__%.__%' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'INVALID_EMAIL',
      'error', 'Lead enquiry has an invalid email address ("' || COALESCE(v_enquiry.email, '') || '"). Please correct the email before conversion.'
    );
  END IF;

  -- Block Master Admin email collision
  IF v_email = 'hello.webrunzo@gmail.com' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ADMIN_EMAIL_CONFLICT',
      'error', 'Cannot convert lead using the Master Admin email address. Clients must have distinct email accounts.'
    );
  END IF;

  -- Prevent converting accounts that already belong to an administrator
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

  -- ---------------------------------------------------------------------------
  -- 4. RESOLVE TIER, PLAN, TEMPLATE & URL DEFAULTS
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 5. ATOMIC MUTATION A: CUSTOMER CREATION OR SAFE REUSE (IDEMPOTENCY)
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 6. ATOMIC MUTATION B: CUSTOMER STORAGE ALLOCATION
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 7. ATOMIC MUTATION C: INITIAL ORDER CREATION OR SAFE REUSE
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 8. ATOMIC MUTATION D: INITIAL PAYMENT RECORD OR SAFE REUSE
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 9. ATOMIC MUTATION E: PROFILE LINKAGE
  -- ---------------------------------------------------------------------------
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

  -- ---------------------------------------------------------------------------
  -- 10. ATOMIC MUTATION F: MARK ENQUIRY CONVERTED
  -- (ONLY EXECUTED AFTER ALL PREVIOUS MUTATIONS HAVE SUCCEEDED)
  -- ---------------------------------------------------------------------------
  UPDATE public.enquiries
  SET status = 'Converted',
      admin_notes = 'Converted to Customer: ' || v_customer.business_name || ' (ID: ' || v_customer_id || ') by ' || COALESCE(p_admin_name, 'Admin') || ' on ' || v_now_iso
  WHERE id = p_enquiry_id;

  -- ---------------------------------------------------------------------------
  -- 11. RETURN STRUCTURED DATA
  -- ---------------------------------------------------------------------------
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
    -- Any exception rolls back all DML executed within this block
    RETURN jsonb_build_object(
      'success', false,
      'code', 'TRANSACTION_FAILED',
      'error', 'Database conversion transaction failed: ' || SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Revoke dangerous permissions
REVOKE EXECUTE ON FUNCTION public.convert_enquiry_to_customer_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.convert_enquiry_to_customer_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) FROM anon;

-- Grant execution to authenticated users and service_role
GRANT EXECUTE ON FUNCTION public.convert_enquiry_to_customer_atomic(TEXT, UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
