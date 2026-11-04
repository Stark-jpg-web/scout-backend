const fs = require('fs');
const mongoose = require('mongoose');
const Media = require('../../models/mediaModel');

// Load environment variables
process.loadEnvFile('./.env.local');

const DB_PATH = process.env.DATABASE.replace(
  '<DB_PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB_PATH)
  .then(() => console.log('Connected to MongoDB Atlas for data seeding!'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Read JSON File
const media = JSON.parse(
  fs.readFileSync(`${__dirname}/media-seed.json`, 'utf-8'),
);

// Import Data into DB
const importData = async () => {
  try {
    await Media.create(media);
    console.log(
      `✅ Successfully loaded ${media.length} media records into MongoDB!`,
    );
  } catch (err) {
    console.error('❌ Error importing data:', err);
  }
  process.exit();
};

// Delete Data from DB
const deleteData = async () => {
  try {
    // Delete only seeded items or all items
    await Media.deleteMany();
    console.log('🗑️ Successfully deleted all media records from MongoDB!');
  } catch (err) {
    console.error('❌ Error deleting data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please provide either --import or --delete flag.');
  process.exit();
}
