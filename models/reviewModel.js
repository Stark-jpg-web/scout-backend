const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    mediaId: {
      type: Number,
      required: [true, 'Review must belong to a TMDB media item'],
      index: true,
    },
    mediaType: {
      type: String,
      required: [true, 'Review must specify a media type'],
      enum: {
        values: ['movie', 'tv'],
        message: 'Media type must be either movie or tv',
      },
      default: 'movie',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1.0'],
      max: [10, 'Rating cannot exceed 10.0'],
    },
    content: {
      type: String,
      required: [true, 'Review content cannot be empty'],
      trim: true,
      maxlength: [2000, 'A review must not exceed 2000 characters'],
    },
    containsSpoilers: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
      index: true,
    },
    reactions: {
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      funny: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      surprised: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Prevent duplicate top-level reviews for the same media item by the same user
reviewSchema.index(
  { mediaId: 1, user: 1, parentCommentId: 1 },
  { unique: true },
);

// Index to optimize reverse-chronological review retrieval for feeds
reviewSchema.index({ mediaId: 1, createdAt: -1 });

// Virtual populate for nested replies in threaded discussions
reviewSchema.virtual('replies', {
  ref: 'Review',
  foreignField: 'parentCommentId',
  localField: '_id',
});

// Query Middleware: Populate user profile metadata on find queries
reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});

// Static Method: Aggregate average rating and total vote count on Media
reviewSchema.statics.calcAverageRatings = async function (mediaId) {
  const stats = await this.aggregate([
    {
      $match: {
        mediaId: mediaId,
        parentCommentId: null,
        rating: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$mediaId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Media').findOneAndUpdate(
      { tmdbId: mediaId },
      {
        voteCount: stats[0].nRating,
        voteAverage: Math.round(stats[0].avgRating * 10) / 10,
      },
    );
  } else {
    await mongoose.model('Media').findOneAndUpdate(
      { tmdbId: mediaId },
      {
        voteCount: 0,
        voteAverage: 0,
      },
    );
  }
};

// Document Middleware: Recalculate average ratings after saving a review
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.mediaId);
});

// Query Middleware: Recalculate average ratings after updating or deleting a review
reviewSchema.post(/^findOneAnd/, async (doc) => {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.mediaId);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
