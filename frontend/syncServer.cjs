/**
 * CrisisWeave Real-Time Cross-Device Synchronization Server
 * Runs on Node.js using native HTTP module (no external dependencies needed).
 * Provides Server-Sent Events (SSE) and REST endpoints so any incident, advisory,
 * or upload dispatched by a controller is instantly updated on every connected client.
 */

const http = require('http');

const PORT = process.env.SYNC_PORT || 8081;

// In-memory state shared across all users
let currentState = {
  currentIncident: null,
  broadcast: null,
  lastUpdated: Date.now(),
  version: 1
};

// Active SSE client connections
const sseClients = new Set();

function broadcastToClients(eventData) {
  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 1. SSE Stream: GET /api/sync/events
  if (url.pathname === '/api/sync/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: ${JSON.stringify({ type: 'INIT', state: currentState })}\n\n`);
    sseClients.add(res);

    // Heartbeat every 15s to keep connection open across proxies/mobile
    const heartbeat = setInterval(() => {
      try {
        res.write(': heartbeat\n\n');
      } catch (e) {
        clearInterval(heartbeat);
        sseClients.delete(res);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
    return;
  }

  // 2. State Snapshot: GET /api/sync/state
  if (url.pathname === '/api/sync/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ...currentState,
      connectedClients: sseClients.size
    }));
    return;
  }

  // 3. Publish Update: POST /api/sync/publish
  if (url.pathname === '/api/sync/publish' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        currentState.version += 1;
        currentState.lastUpdated = Date.now();

        if (data.type === 'INCIDENT') {
          currentState.currentIncident = data.payload.simulationResult || data.payload;
          if (data.payload.broadcast) {
            currentState.broadcast = data.payload.broadcast;
          }
        } else if (data.type === 'BROADCAST') {
          currentState.broadcast = data.payload;
        } else if (data.type === 'CLEAR') {
          currentState.currentIncident = null;
          currentState.broadcast = null;
        }

        const broadcastMsg = {
          type: data.type,
          state: currentState,
          timestamp: currentState.lastUpdated,
          version: currentState.version
        };

        broadcastToClients(broadcastMsg);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          version: currentState.version,
          connectedClients: sseClients.size
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // 4. Clear State: POST /api/sync/clear
  if (url.pathname === '/api/sync/clear' && (req.method === 'POST' || req.method === 'DELETE')) {
    currentState.currentIncident = null;
    currentState.broadcast = null;
    currentState.version += 1;
    currentState.lastUpdated = Date.now();

    const broadcastMsg = {
      type: 'CLEAR',
      state: currentState,
      timestamp: currentState.lastUpdated,
      version: currentState.version
    };

    broadcastToClients(broadcastMsg);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, version: currentState.version }));
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CrisisWeave Sync Server] Listening on http://0.0.0.0:${PORT}`);
});
