
const mongoose = require('mongoose');

const errorConverter = (err, req, res, next) => {
  let error = err;
  // Convert mongoose errors or other specific errors to a consistent format if needed
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).json({
    success: false,
    message: message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  errorConverter,
  errorHandler,
};
