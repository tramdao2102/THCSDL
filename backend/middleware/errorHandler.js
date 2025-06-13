const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Please check if PostgreSQL is running'
    });
  }

  // PostgreSQL query errors
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({
      error: 'Database Error',
      message: err.message
    });
  }

  // Validation errors (Joi or custom)
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // Not found error
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message || 'Resource not found'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.error || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;