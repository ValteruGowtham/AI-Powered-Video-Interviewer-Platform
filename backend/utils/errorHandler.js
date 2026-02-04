/**
 * Custom Error Classes and Error Handling Utilities
 */

// Base Application Error
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific Error Types
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid request data') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

class ExternalServiceError extends AppError {
  constructor(service = 'External service', originalError = null) {
    super(`${service} temporarily unavailable`, 503, 'EXTERNAL_SERVICE_ERROR');
    this.originalError = originalError;
  }
}

class OpenAIError extends AppError {
  constructor(message = 'AI service temporarily unavailable', originalError = null) {
    super(message, 503, 'OPENAI_ERROR');
    this.originalError = originalError;
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error response formatter
 * @param {Error} err - Error object
 * @param {Response} res - Express response object
 */
const formatErrorResponse = (err, res) => {
  const isDev = process.env.NODE_ENV === 'development';
  
  const response = {
    success: false,
    message: err.message || 'An unexpected error occurred',
    ...(err.errorCode && { errorCode: err.errorCode }),
    ...(isDev && {
      stack: err.stack,
      originalError: err.originalError?.message
    })
  };
  
  return res.status(err.statusCode || 500).json(response);
};

/**
 * Global error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    path: req.path,
    method: req.method,
    errorCode: err.errorCode,
    stack: err.stack
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return formatErrorResponse(new ValidationError(messages.join(', ')), res);
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return formatErrorResponse(new ValidationError('Invalid ID format'), res);
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return formatErrorResponse(
      new ValidationError(`${field || 'Field'} already exists`), 
      res
    );
  }

  // Handle OpenAI errors
  if (err.constructor?.name === 'OpenAIError' || err.response?.status === 401) {
    return formatErrorResponse(
      new OpenAIError('AI service error. Please check your API key.'),
      res
    );
  }

  // Handle operational errors
  if (err.isOperational) {
    return formatErrorResponse(err, res);
  }

  // Handle unknown errors
  return formatErrorResponse(
    new AppError('An unexpected error occurred', 500, 'INTERNAL_ERROR'),
    res
  );
};

/**
 * Handle 404 Not Found for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
};

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  RateLimitError,
  ExternalServiceError,
  OpenAIError,
  asyncHandler,
  formatErrorResponse,
  errorMiddleware,
  notFoundHandler
};
