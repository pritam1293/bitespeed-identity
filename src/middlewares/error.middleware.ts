import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    const response: ErrorResponse = {
      error: 'Error',
      message: err.message,
      statusCode: err.statusCode,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const response: ErrorResponse = {
      error: 'Database Error',
      message: 'A database error occurred',
      statusCode: 400,
    };

    res.status(400).json(response);
    return;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const response: ErrorResponse = {
      error: 'Validation Error',
      message: err.message,
      statusCode: 400,
    };

    res.status(400).json(response);
    return;
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    statusCode: 500,
  };

  res.status(500).json(response);
};

/**
 * Handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Validate JSON body middleware
 */
export const validateJsonBody = (err: any, _req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ErrorResponse = {
      error: 'Invalid JSON',
      message: 'Request body contains invalid JSON',
      statusCode: 400,
    };

    res.status(400).json(response);
    return;
  }

  next(err);
};
