/**
 * This needs to be a class because it extends the built-in Error class, allowing us to create custom error types
 * with additional properties like statusCode and isOperational. Using a class ensures proper inheritance and
 * stack trace capturing, which is essential for debugging and error handling in a structured way.
 *
 * If this were a function, it would look like this:
 *
 * function createApiError(statusCode, message, isOperational = true, stack = '') {
 *   const error = new Error(message);
 *   error.statusCode = statusCode;
 *   error.isOperational = isOperational;
 *   if (stack) {
 *     error.stack = stack;
 *   } else {
 *     Error.captureStackTrace(error, createApiError);
 *   }
 *   return error;
 * }
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
