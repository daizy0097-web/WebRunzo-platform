import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server';

// Disable automatic Vercel body parsing so Express handles raw request streaming
// (required for Razorpay webhook cryptographic HMAC signature verification via req.rawBody)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Normalize incoming path for Express routing when rewritten by Vercel edge
  const matchedPath = (req.headers['x-matched-path'] as string) || '';
  if (matchedPath && (matchedPath.startsWith('/api') || matchedPath.startsWith('/env.js'))) {
    req.url = matchedPath;
  } else if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/env.js')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return (app as any)(req, res);
}
