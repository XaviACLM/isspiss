import { PissMonitor, Env } from './PissMonitor';

// CORS headers for frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export { PissMonitor };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get the singleton Durable Object instance
    const id = env.PISS_MONITOR.idFromName('singleton');
    const monitor = env.PISS_MONITOR.get(id);

    if (url.pathname === '/status') {
      const response = await monitor.fetch(new Request('http://internal/status'));
      return addCorsHeaders(response);
    }

    if (url.pathname === '/events') {
      try {
        const response = await monitor.fetch(new Request('http://internal/events', {
          signal: request.signal,
        }));
        return addCorsHeaders(response);
      } catch {
        // Client disconnected - this is normal, not an error
        return new Response(null, { status: 499 });
      }
    }

    // 404 for everything else
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};

function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    headers: newHeaders,
  });
}
