const mongoose = require('mongoose');

process.loadEnvFile('./.env.local');
const app = require('./app');

const DB_PATH = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
const connectToMongoDB = () => {
  mongoose.connect(DB_PATH).then(()=>console.log('You successfully connected to MongoDB!'));
  
};
connectToMongoDB();

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
  const mode =
    process.env.NODE_ENV === 'development'
      ? 'DEVELOPMENT mode 🛠️'
      : 'PRODUCTION mode 🚨 (CAREFUL)';
  console.log(mode);
});

// Call this only when your application terminates
exports.disconnectFromMongoDB = async () => {
  await mongoose.disconnect();
  console.log('You successfully disconnected from MongoDB!');
};

//handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log(
    `A rejection detected. Name: ${err.name}.. Message:${err.message}`,
  );
  server.close(() => process.exit(1));
});
