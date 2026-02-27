import express, { Application } from 'express';
import contactRoutes from './routes/contact.routes';
import {
  errorHandler,
  notFoundHandler,
  validateJsonBody,
} from './middlewares/error.middleware';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app: Application = express();

  // Middleware
  app.use(express.json()); // Parse JSON bodies only (no form-data)
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Root route
  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'Bitespeed Identity Reconciliation API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        identify: '/api/identify',
      },
    });
  });

  // Ignore favicon requests
  app.get('/favicon.ico', (_req, res) => res.status(204).end());
  app.get('/favicon.png', (_req, res) => res.status(204).end());

  // API Routes
  app.use('/api', contactRoutes);

  // Error handling
  app.use(validateJsonBody);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
