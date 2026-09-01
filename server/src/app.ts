import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import accountRoutes from './routes/accountRoutes';
import gmailRoutes from './routes/gmailRoutes';
import emailRoutes from './routes/emailRoutes';
import aiRoutes from './routes/aiRoutes';
import actionItemRoutes from './routes/actionItemRoutes';
import templateRoutes from './routes/templateRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import ruleRoutes from './routes/ruleRoutes';
import copilotRoutes from './routes/copilotRoutes';

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Accept localhost, 127.0.0.1, or configured CLIENT_URL in development
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── Request logging ───────────────────────────────────────────────────────────
app.use(requestLogger);

// ── Global API rate limiter ───────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/action-items', actionItemRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/copilot', copilotRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
