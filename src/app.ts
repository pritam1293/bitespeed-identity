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
  app.get('/bitespeed/api/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Routes
  app.use('/bitespeed/api', contactRoutes);

  // Error handling
  app.use(validateJsonBody);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
