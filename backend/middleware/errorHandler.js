const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const isValidation = err.name === 'ValidationError';
  const isMongoDuplicate = err.code === 11000;

  if (isValidation) {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }
  if (isMongoDuplicate) {
    return res.status(400).json({ success: false, message: 'Email already registered.' });
  }

  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : message,
  });
};

module.exports = errorHandler;
