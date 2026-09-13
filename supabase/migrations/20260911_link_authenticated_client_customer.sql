-- ==============================================================================
-- Migration: Atomic Client Customer Linking Function
-- Purpose: Link an authenticated auth.uid() to an existing public.customers
--          record matching the user's verified email, without creating new records
--          or permitting unauthorized linkage.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.link_authenticated_client_customer()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid uuid;
  v_user_email text;
  v_matched_count integer;
  v_target_customer record;
  v_client_tier text;
BEGIN
  -- 1. Use only the currently authenticated auth.uid()
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'UNAUTHENTICATED',
      'message', 'Authentication required to link a client customer record.'
    );
  END IF;

  -- 2. Get the authenticated user's verified email from the auth context / JWT / auth.users
  v_user_email := LOWER(TRIM(COALESCE(
    auth.jwt() ->> 'email',
    (SELECT email FROM auth.users WHERE id = v_uid)
  )));

  IF v_user_email IS NULL OR v_user_email = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NO_EMAIL',
      'message', 'No valid email address found for the authenticated account.'
    );
  END IF;

  -- 3. Find existing public.customers records matching that email,
  --    where user_id IS NULL or already belongs to the same authenticated user.
  --    (Does NOT match or touch customer records belonging to other users).
  SELECT COUNT(*) INTO v_matched_count
  FROM public.customers
  WHERE LOWER(TRIM(email)) = v_user_email
    AND (user_id IS NULL OR user_id = v_uid);

  -- 4. Branch on match count
  IF v_matched_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'CUSTOMER_NOT_FOUND',
      'message', 'No matching customer record found for this email address.'
    );
  ELSIF v_matched_count > 1 THEN
    -- If multiple matching unlinked customers exist, return an ambiguous customer result
    -- and do not link anything.
    RETURN jsonb_build_object(
      'success', false,
      'code', 'AMBIGUOUS_CUSTOMER',
      'message', 'Multiple customer records match this email address. Please contact support for account reconciliation.'
    );
  END IF;

  -- 5. Exactly one matching customer exists: retrieve details
  SELECT id, client_tier, business_name, name
  INTO v_target_customer
  FROM public.customers
  WHERE LOWER(TRIM(email)) = v_user_email
    AND (user_id IS NULL OR user_id = v_uid)
  LIMIT 1;

  -- 6. Set customers.user_id = auth.uid()
  UPDATE public.customers
  SET user_id = v_uid
  WHERE id = v_target_customer.id;

  v_client_tier := COALESCE(v_target_customer.client_tier, 'normal');

  -- 7. Update the user's profiles.customer_id and profiles.client_tier from that customer
  UPDATE public.profiles
  SET customer_id = v_target_customer.id,
      client_tier = v_client_tier,
      business_name = COALESCE(v_target_customer.business_name, public.profiles.business_name),
      full_name = COALESCE(public.profiles.full_name, v_target_customer.name)
  WHERE id = v_uid;

  -- If profile row does not exist yet, create it
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, role, client_tier, customer_id, business_name)
    VALUES (
      v_uid,
      v_user_email,
      COALESCE(v_target_customer.name, 'Client'),
      'client',
      v_client_tier,
      v_target_customer.id,
      v_target_customer.business_name
    )
    ON CONFLICT (id) DO UPDATE
    SET customer_id = EXCLUDED.customer_id,
        client_tier = EXCLUDED.client_tier,
        business_name = COALESCE(EXCLUDED.business_name, public.profiles.business_name);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'code', 'LINKED',
    'customer_id', v_target_customer.id,
    'client_tier', v_client_tier,
    'business_name', v_target_customer.business_name
  );
END;
$$;

-- Grant execution permissions strictly to authenticated users
REVOKE EXECUTE ON FUNCTION public.link_authenticated_client_customer() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.link_authenticated_client_customer() FROM anon;
GRANT EXECUTE ON FUNCTION public.link_authenticated_client_customer() TO authenticated;
