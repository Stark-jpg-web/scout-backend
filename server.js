const mongoose = require('mongoose');

process.loadEnvFile('./.env.local');
const app = require('./app');

const DB_PATH = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(DB_PATH);
    console.log('You successfully connected to MongoDB!');
  } catch (err) {
    console.dir(err);
  }
};
connectToMongoDB();

const port = process.env.PORT || 8000;

app.listen(port, () => {
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
