#!/usr/bin/env node
import https from 'https';

const PROJECT_REF = 'nlackwvabkkbwzgoqylf';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.argv[2];

const DESIRED_TEMPLATE = `<h2>Reset your password</h2>

<p>We received a request to reset your password. Follow the link below to choose a new one.</p>

<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>`;

if (!TOKEN) {
  console.error('ERROR: No Supabase Access Token provided.');
  console.error('Usage:');
  console.error('  SUPABASE_ACCESS_TOKEN="sbp_..." node scripts/inspect-and-fix-recovery.mjs');
  console.error('or:');
  console.error('  node scripts/inspect-and-fix-recovery.mjs sbp_...');
  process.exit(1);
}

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.supabase.com',
        port: 443,
        path,
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            if (res.statusCode >= 400) {
              reject(new Error(`API Error ${res.statusCode}: ${parsed.message || raw}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
            } else {
              resolve(raw);
            }
          }
        });
      }
    );
    req.on('error', reject);
    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log(`Inspecting Supabase Auth Config for project: ${PROJECT_REF}`);
  console.log('====================================================\n');

  try {
    const config = await request('GET', `/v1/projects/${PROJECT_REF}/config/auth`);
    const currentRecovery = config.mailer_templates_recovery_content;

    console.log('Current [mailer_templates_recovery_content]:');
    console.log('----------------------------------------------------');
    console.log(currentRecovery || '(NULL / Empty)');
    console.log('----------------------------------------------------\n');

    if (currentRecovery && currentRecovery.trim() === DESIRED_TEMPLATE.trim()) {
      console.log('Template is already set to the exact requested HTML content.');
      return;
    }

    console.log('Updating mailer_templates_recovery_content to desired HTML template...');
    const updated = await request('PATCH', `/v1/projects/${PROJECT_REF}/config/auth`, {
      mailer_templates_recovery_content: DESIRED_TEMPLATE,
    });

    console.log('\nVerifying stored value after update...');
    const verifyConfig = await request('GET', `/v1/projects/${PROJECT_REF}/config/auth`);
    const finalRecovery = verifyConfig.mailer_templates_recovery_content;

    console.log('Final stored [mailer_templates_recovery_content]:');
    console.log('----------------------------------------------------');
    console.log(finalRecovery);
    console.log('----------------------------------------------------\n');
    console.log('SUCCESS: Recovery email template successfully updated and verified!');
  } catch (err) {
    console.error('Operation failed:', err.message);
    process.exit(1);
  }
}

run();
