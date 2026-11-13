const fs = require('fs');
const mongoose = require('mongoose');
const Media = require('../../models/mediaModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

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

// Read JSON Files
const media = JSON.parse(
  fs.readFileSync(`${__dirname}/media-seed.json`, 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/users-seed.json`, 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews-seed.json`, 'utf-8'),
);

// Ensure demo users exist
const seedUsers = async () => {
  await Promise.all(
    users.map(async (user) => {
      const exists = await User.findById(user._id);
      if (!exists) {
        await User.create(user);
      }
    }),
  );
};

// Import Media Data into DB
const importMedia = async () => {
  try {
    await Media.create(media);
    console.log(
      `✅ Successfully loaded ${media.length} media records into MongoDB!`,
    );
  } catch (err) {
    console.error('❌ Error importing media:', err);
  }
};

// Delete Media Data from DB
const deleteMedia = async () => {
  try {
    await Media.deleteMany();
    console.log('🗑️ Successfully deleted all media records from MongoDB!');
  } catch (err) {
    console.error('❌ Error deleting media:', err);
  }
};

// Import Reviews Data into DB
const importReviews = async () => {
  try {
    await seedUsers();
    await Review.create(reviews);
    console.log(
      `✅ Successfully loaded ${reviews.length} review records into MongoDB!`,
    );
  } catch (err) {
    console.error('❌ Error importing reviews:', err);
  }
  process.exit();
};

// Delete Reviews Data from DB
const deleteReviews = async () => {
  try {
    await Review.deleteMany();
    console.log('🗑️ Successfully deleted all review records from MongoDB!');
  } catch (err) {
    console.error('❌ Error deleting reviews:', err);
  }
  process.exit();
};

// Import All (Media + Reviews)
const importAll = async () => {
  try {
    await seedUsers();
    await Media.create(media);
    console.log(
      `✅ Successfully loaded ${media.length} media records into MongoDB!`,
    );
    await Review.create(reviews);
    console.log(
      `✅ Successfully loaded ${reviews.length} review records into MongoDB!`,
    );
  } catch (err) {
    console.error('❌ Error importing all data:', err);
  }
  process.exit();
};

// Delete All (Media + Reviews)
const deleteAll = async () => {
  try {
    await Media.deleteMany();
    await Review.deleteMany();
    console.log(
      '🗑️ Successfully deleted all media and review records from MongoDB!',
    );
  } catch (err) {
    console.error('❌ Error deleting all data:', err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importAll();
} else if (process.argv[2] === '--delete') {
  deleteAll();
} else if (process.argv[2] === '--import-reviews') {
  importReviews();
} else if (process.argv[2] === '--delete-reviews') {
  deleteReviews();
} else if (process.argv[2] === '--import-media') {
  importMedia().then(() => process.exit());
} else if (process.argv[2] === '--delete-media') {
  deleteMedia().then(() => process.exit());
} else {
  console.log(
    'Please provide a flag: --import, --delete, --import-reviews, --delete-reviews, --import-media, or --delete-media',
  );
  process.exit();
}
