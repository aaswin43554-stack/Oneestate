require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Global safety net — prevent any unhandled rejection from crashing Node 15+
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection (non-fatal):', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception (non-fatal):', err.message);
});

const http    = require('http');
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const migrate = require('./scripts/migrate');
const seed    = require('./scripts/seed');

const authRoutes          = require('./routes/auth');
const lotsRoutes          = require('./routes/lots');
const roastSessionRoutes  = require('./routes/roastSessions');
const allocationRoutes    = require('./routes/allocations');
const profileRoutes       = require('./routes/profiles');
const cuppingRoutes       = require('./routes/cupping');
const labelRoutes         = require('./routes/labels');
const { setupRoastWebSocket } = require('./services/roastHardwareMock');

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigin = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173');
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api/auth',             authRoutes);
app.use('/api/lots',             lotsRoutes);
app.use('/api/roast-sessions',   roastSessionRoutes);
app.use('/api/allocations',      allocationRoutes);
app.use('/api/profiles',         profileRoutes);
app.use('/api/cupping-sessions', cuppingRoutes);
app.use('/api/labels',           labelRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve frontend static files in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => res.sendFile(path.join(clientDistPath, 'index.html')));

// Create HTTP server and attach WebSocket
const server = http.createServer(app);
setupRoastWebSocket(server);

server.listen(PORT, async () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  if (!process.env.DATABASE_URL) {
    console.error('[server] ERROR: DATABASE_URL is not set — set it in Render environment variables.');
    return;
  }
  try { await migrate(); } catch (e) { console.error('[server] migrate error:', e.message); }
  try { await seed();    } catch (e) { console.error('[server] seed error:',    e.message); }
});
