interface Env {
  // Durable Object bindings will go here later
  // PISS_MONITOR: DurableObjectNamespace;
}

interface PissState {
  isPissing: boolean;
  tankLevel: number;
  lastPissEnded: string | null;
  currentPissStarted: string | null;
}

// Mock state for now - will be replaced by Durable Object
const mockState: PissState = {
  isPissing: false,
  tankLevel: 42,
  lastPissEnded: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
  currentPissStarted: null,
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /status - Current state as JSON
    if (url.pathname === '/status') {
      return Response.json(mockState, { headers: corsHeaders });
    }

    // GET /events - SSE stream
    if (url.pathname === '/events') {
      const stream = new ReadableStream({
        start(controller) {
          // Send initial status
          const statusEvent = `event: status\ndata: ${JSON.stringify(mockState)}\n\n`;
          controller.enqueue(new TextEncoder().encode(statusEvent));

          // Keep connection alive with comments every 30s
          const keepAlive = setInterval(() => {
            controller.enqueue(new TextEncoder().encode(': keepalive\n\n'));
          }, 30000);

          // Clean up on close (though Workers have limited control here)
          request.signal.addEventListener('abort', () => {
            clearInterval(keepAlive);
            controller.close();
          });
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // 404 for everything else
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};
