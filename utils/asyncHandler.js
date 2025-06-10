const asyncHandler = (fn) => (req, res, next) =>
  // This utility is used to wrap asynchronous route handlers in Express.
  // It ensures that any errors thrown in the asynchronous code are caught
  // and passed to the next middleware (usually the error-handling middleware),
  // preventing the need to use try-catch blocks in every route handler.
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
