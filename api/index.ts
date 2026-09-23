import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server.js';

// Disable automatic Vercel body parsing so Express handles raw request streaming
// (required for Razorpay webhook cryptographic HMAC signature verification via req.rawBody)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Normalizes incoming request paths on Vercel Serverless Functions.
 * Handles cases where Vercel rewrites or edge proxies strip the subpath,
 * pass the original path in custom headers, or route without the /api prefix.
 */
function resolvePath(req: IncomingMessage): string {
  const url = req.url || '';

  // Vercel edge/routing headers that retain the client-requested URL path
  const forwardedPath =
    (req.headers['x-matched-path'] as string) ||
    (req.headers['x-invoke-path'] as string) ||
    (req.headers['x-forwarded-uri'] as string) ||
    (req.headers['x-original-url'] as string);

  let targetUrl = url;

  // If req.url was rewritten to the function root (/api or /api/index), restore original subpath
  if (
    forwardedPath &&
    (url === '/api' || url === '/api/' || url === '/api/index' || url === '/' || url === '')
  ) {
    targetUrl = forwardedPath;
  }

  // Ensure path starts with /api or /env.js for Express router matching
  if (targetUrl && !targetUrl.startsWith('/api') && !targetUrl.startsWith('/env.js')) {
    targetUrl = '/api' + (targetUrl.startsWith('/') ? targetUrl : '/' + targetUrl);
  }

  return targetUrl || '/api';
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const normalizedUrl = resolvePath(req);
    req.url = normalizedUrl;
    (req as any).originalUrl = normalizedUrl;

    const expressApp = (app && (app as any).default) || app;
    return (expressApp as any)(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler Exception]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Serverless Function Execution Error',
          message: err?.message || String(err),
        })
      );
    }
  }
}

export { app };
