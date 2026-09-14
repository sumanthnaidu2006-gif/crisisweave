import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function crisisweaveSyncPlugin(): Plugin {
  let currentState: {
    currentIncident: any;
    broadcast: any;
    lastUpdated: number;
    version: number;
  } = {
    currentIncident: null,
    broadcast: null,
    lastUpdated: Date.now(),
    version: 1
  };

  const sseClients = new Set<any>();

  const broadcastToClients = (eventData: any) => {
    const payload = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(payload);
      } catch {
        sseClients.delete(client);
      }
    }
  };

  return {
    name: 'crisisweave-sync-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);

        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

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

          const heartbeat = setInterval(() => {
            try {
              res.write(': heartbeat\n\n');
            } catch {
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
            } catch {
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

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), crisisweaveSyncPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
