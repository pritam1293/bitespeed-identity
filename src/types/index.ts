import { Contact } from '@prisma/client';

/**
 * Request body for /identify endpoint
 */
export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

/**
 * Response structure for /identify endpoint
 */
export interface IdentifyResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export type ContactWithRelations = Contact & {
  linkedContacts?: Contact[];
  linkedContact?: Contact | null;
};
