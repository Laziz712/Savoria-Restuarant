import app, { connectToMongo } from '../server.js';

export default async function handler(req: any, res: any) {
  try {
    await connectToMongo();
  } catch (err) {
    console.warn('MongoDB connect warning in Vercel handler:', err);
  }

  // Ensure Express always receives the intended /api/* pathname regardless of Vercel rewrite target
  if (req.url) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const originalPath = urlObj.searchParams.get('__path');
      if (originalPath !== null) {
        urlObj.searchParams.delete('__path');
        const normalizedPath = originalPath.replace(/^\/+/, '');
        if (urlObj.pathname === '/api/index' || urlObj.pathname === '/api/index/') {
          urlObj.pathname = normalizedPath ? `/api/${normalizedPath}` : '/api';
        }
        const qs = urlObj.searchParams.toString();
        req.url = `${urlObj.pathname}${qs ? `?${qs}` : ''}`;
      }
    } catch {
      // Keep original req.url if URL parsing fails
    }
  }

  return new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    res.once('finish', finish);
    res.once('close', finish);
    try {
      app(req, res);
    } catch (err: any) {
      console.error('Vercel Express handler error:', err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err?.message || 'Server xatoligi' }));
      }
      finish();
    }
  });
}

