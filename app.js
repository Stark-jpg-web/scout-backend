const express = require('express');
const morgan = require('morgan');

const mediaRouter = require('./routes/mediaRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.set('query parser', 'extended');
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));

// Media router (with /movies alias for backward compatibility)
app.use('/api/v1/media', mediaRouter);
app.use('/api/v1/movies', mediaRouter);

// User router
app.use('/api/v1/users', userRouter);

//handling unhandled routes
app.use((req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;
