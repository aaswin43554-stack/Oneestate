require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Prevent ANY unhandled error from crashing the server
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandledRejection:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[server] uncaughtException:', err.message);
});

const http    = require('http');
const express = require('express');
const cors    = require('cors');
const path    = require('path');

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

// Allow all origins in production (frontend is same-origin anyway)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check — always responds, no DB required
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), db: !!process.env.DATABASE_URL })
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
  console.error('[server] express error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Serve built frontend in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (_req, res) => res.sendFile(path.join(clientDistPath, 'index.html')));

const server = http.createServer(app);
setupRoastWebSocket(server);

server.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
  console.log(`[server] DATABASE_URL: ${process.env.DATABASE_URL ? 'SET ✓' : 'NOT SET ✗'}`);
  console.log(`[server] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
