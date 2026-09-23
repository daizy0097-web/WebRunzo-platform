import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server.js';

// Disable automatic Vercel body parsing so Express handles raw request streaming
// (required for Razorpay webhook cryptographic HMAC signature verification via req.rawBody)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // Ensure the path retains /api or /env.js for Express routing
    if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/env.js')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
    }

    const expressApp = (app && (app as any).default) || app;
    return (expressApp as any)(req, res);
  } catch (err: any) {
    console.error('[Vercel Handler Exception]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Serverless Function Execution Error', message: err?.message || String(err) }));
    }
  }
}
