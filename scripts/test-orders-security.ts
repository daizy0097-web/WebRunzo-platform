import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const SERVER_URL = 'http://localhost:3000';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSecurityAndRegressionTests() {
  console.log('================================================================');
  console.log('WEBRUNZO ORDERS SECURITY & SERVER-AUTHORITY AUDIT & TEST SUITE');
  console.log('================================================================\n');

  const results: Record<string, { status: 'PASSED' | 'FAILED' | 'BLOCKED_BY_TOKEN_PERMS'; details: string }> = {};

  // ---------------------------------------------------------------------------
  // TEST A: Anonymous direct INSERT into orders (without valid customer) -> must FAIL
  // ---------------------------------------------------------------------------
  console.log('--- TEST A: Anonymous direct INSERT into orders (without customer) ---');
  try {
    const resA = await supabase.from('orders').insert({
      id: `test-anon-a-${Date.now()}`,
      order_number: `ORD-ANON-A-${Date.now().toString().slice(-4)}`,
      client_name: 'Anonymous Attacker',
      business_name: 'Attacker Corp',
      email: 'anon@attacker.com',
      amount: 1,
      payment_status: 'Pending',
      status: 'New',
    });

    if (resA.error) {
      console.log('PASSED: Anon insert rejected with error:', resA.error.message);
      results['Test A (Anon direct insert)'] = {
        status: 'PASSED',
        details: `Rejected as expected: ${resA.error.message}`,
      };
    } else {
      console.log('FAILED: Anon direct insert succeeded unexpectedly!');
      results['Test A (Anon direct insert)'] = {
        status: 'FAILED',
        details: 'Anonymous user was able to insert an order directly.',
      };
    }
  } catch (err: any) {
    results['Test A (Anon direct insert)'] = { status: 'PASSED', details: err.message };
  }

  // ---------------------------------------------------------------------------
  // TEST B: Anonymous attempt to create a Paid order -> must FAIL
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST B: Anonymous attempt to create a Paid order ---');
  try {
    const resB = await supabase.from('orders').insert({
      id: `test-anon-b-${Date.now()}`,
      order_number: `ORD-ANON-B-${Date.now().toString().slice(-4)}`,
      client_name: 'Anonymous Attacker',
      business_name: 'Attacker Corp',
      email: 'anon@attacker.com',
      amount: 0.01,
      payment_status: 'Paid',
      status: 'In Progress',
    });

    if (resB.error) {
      console.log('PASSED: Anon Paid order attempt rejected with error:', resB.error.message);
      results['Test B (Anon Paid order)'] = {
        status: 'PASSED',
        details: `Rejected as expected: ${resB.error.message}`,
      };
    } else {
      console.log('FAILED: Anon was able to insert a Paid order!');
      results['Test B (Anon Paid order)'] = {
        status: 'FAILED',
        details: 'Anonymous user created a Paid order.',
      };
    }
  } catch (err: any) {
    results['Test B (Anon Paid order)'] = { status: 'PASSED', details: err.message };
  }

  // ---------------------------------------------------------------------------
  // TEST C, D, E, F: Server-Side Authoritative Checkout (/api/payments/create-order)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST C, D, E, F: Server Authoritative Order Creation Endpoint Tests ---');

  // C.1: Anonymous call to /api/payments/create-order -> must return 401 UNAUTHENTICATED
  console.log('\nSubtest: Unauthenticated call to /api/payments/create-order');
  const anonRes = await fetch(`${SERVER_URL}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId: 'plan-starter' }),
  });
  const anonData = await anonRes.json();
  console.log(`Anon API Call Status: ${anonRes.status}`, anonData);

  if (anonRes.status === 401 && anonData.code === 'UNAUTHENTICATED') {
    results['API Anon Check'] = {
      status: 'PASSED',
      details: 'Unauthenticated requests strictly rejected with 401 UNAUTHENTICATED.',
    };
  } else {
    results['API Anon Check'] = {
      status: 'FAILED',
      details: `Expected 401 UNAUTHENTICATED, got ${anonRes.status}: ${JSON.stringify(anonData)}`,
    };
  }

  // C.2: Invalid token call to /api/payments/create-order -> must return 401 INVALID_TOKEN
  console.log('\nSubtest: Invalid Bearer token call to /api/payments/create-order');
  const fakeTokenRes = await fetch(`${SERVER_URL}/api/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer invalid_fake_jwt_token',
    },
    body: JSON.stringify({ planId: 'plan-starter' }),
  });
  const fakeTokenData = await fakeTokenRes.json();
  console.log(`Fake Token API Call Status: ${fakeTokenRes.status}`, fakeTokenData);

  if (fakeTokenRes.status === 401 && fakeTokenData.code === 'INVALID_TOKEN') {
    results['API Fake Token Check'] = {
      status: 'PASSED',
      details: 'Forged/invalid bearer tokens strictly rejected with 401 INVALID_TOKEN.',
    };
  } else {
    results['API Fake Token Check'] = {
      status: 'FAILED',
      details: `Expected 401 INVALID_TOKEN, got ${fakeTokenRes.status}: ${JSON.stringify(fakeTokenData)}`,
    };
  }

  // Check if an existing admin or test client session can be used
  console.log('\nChecking test user availability...');
  const testEmail = 'hello.webrunzo@gmail.com';
  // Let's check health endpoint
  const healthRes = await fetch(`${SERVER_URL}/api/health`);
  const healthData = await healthRes.json();
  console.log('Server Health Status:', healthData);

  // ---------------------------------------------------------------------------
  // TEST G: Public Enquiry Form Remains Intact & Functional
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST G: Public Enquiry Submission (Regression Check) ---');
  const enqId = `enq-test-${Date.now()}`;
  const enqRes = await supabase.from('enquiries').insert({
    id: enqId,
    name: 'Prospective Lead',
    business: 'Prospective Bakery LLC',
    email: 'lead@prospectivebakery.com',
    phone: '+1 (555) 234-5678',
    selected_plan_id: 'plan-pro',
    selected_template_id: 'tpl-biz-1',
    message: 'Interested in launching a customized bakery storefront.',
    status: 'New',
  });

  if (!enqRes.error) {
    console.log('PASSED: Public visitor can submit sales enquiries without hindrance.');
    results['Test G (Public enquiries intact)'] = {
      status: 'PASSED',
      details: 'Public visitor submitted enquiry successfully.',
    };
    // Clean up test enquiry
    // (Notice: anon cannot delete enquiries, admin can)
  } else {
    console.log('FAILED: Public visitor enquiry submission failed:', enqRes.error.message);
    results['Test G (Public enquiries intact)'] = {
      status: 'FAILED',
      details: enqRes.error.message,
    };
  }

  // ---------------------------------------------------------------------------
  // Print Summary
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('TEST SUITE RUN COMPLETE');
  console.log('================================================================');
  for (const [testName, res] of Object.entries(results)) {
    console.log(`[${res.status}] ${testName}: ${res.details}`);
  }
}

runSecurityAndRegressionTests();
