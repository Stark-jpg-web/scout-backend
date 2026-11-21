const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  // 1. Loop through all failed fields and extract their custom messages
  const errors = Object.values(err.errors).map((el) => el.message);
  // 2. Join them into one clean sentence
  const message = `Invalid input data: ${errors.join('. ')}`;
  // 3. Return a 400 Operational error
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  // 1. In modern MongoDB, err.keyValue contains { fieldName: 'duplicateValue' }
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value!`;

  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
//only sending operational (eg: userInput) erros to the client
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong :"(',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || (err.statusCode >= 500 ? 'error' : 'fail');
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};
