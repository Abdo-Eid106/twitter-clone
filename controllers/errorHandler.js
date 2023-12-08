const AppError = require(`${__dirname}/../utils/AppError.js`);

const handleCastError = () => new AppError('invalid database Id', 400);

const handleValidationError = (err) => {
  let messages = [];
  const errors = err.errors;
  const vals = Object.values(errors);

  vals.forEach(val => {
    messages.push(val.message);
  });

  messages = messages.join(',');
  return new AppError(messages, 400);
}

const handleJsonWebTokenError = () => {
  return new AppError('Invalid token', 401);
}

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleDuplicateFieldsError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} should be unique`;
  return new AppError(message, 400);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name == 'CastError') err = handleCastError();
  else if (err.name == 'ValidationError') err = handleValidationError(err);
  else if (err.name == 'JsonWebTokenError') err = handleJsonWebTokenError();
  else if (err.code == 11000) err = handleDuplicateFieldsError(err);
  else if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  if (!err.isOperational) 
    err = new AppError('internal server Error', 500);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
}