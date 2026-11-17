const mongoose = require('mongoose');
const slugify = require('slugify');

// Ensure Review model is compiled for virtual populate
require('./reviewModel');

const genreSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const mediaSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: [true, 'A media item must have a TMDB ID'],
      unique: true,
    },
    mediaType: {
      type: String,
      required: [true, 'A media item must have a media type'],
      enum: {
        values: ['movie', 'tv'],
        message: 'Media type must be either movie or tv',
      },
    },
    title: {
      type: String,
      required: [true, 'A media item must have a title'],
      trim: true,
    },
    slug: {
      type: String,
      index: true,
    },
    originalTitle: {
      type: String,
      trim: true,
    },
    overview: {
      type: String,
      default: '',
      trim: true,
    },
    overviewAr: {
      type: String,
      default: '',
      trim: true,
    },
    posterPath: {
      type: String,
      trim: true,
    },
    backdropPath: {
      type: String,
      trim: true,
    },
    releaseDate: {
      type: Date,
      // Sanitizes empty string returns from TMDB API to prevent CastErrors
      set: (val) => (val === '' ? null : val),
    },
    voteAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above or equal to 0'],
      max: [10, 'Rating must be below or equal to 10'],
      set: (val) => Math.round(val * 10) / 10,
    },
    voteCount: {
      type: Number,
      default: 0,
      min: [0, 'Vote count cannot be negative'],
    },
    genres: [genreSchema],
    runtime: Number,
    numberOfSeasons: Number,
    numberOfEpisodes: Number,
    budget: Number,
    revenue: Number,
    status: {
      type: String,
      trim: true,
    },
    lastCachedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// --- INDEXES ---
// Compound index for optimizing catalog filtering and sorting queries
mediaSchema.index({ mediaType: 1, voteAverage: -1 });
mediaSchema.index({ releaseDate: -1 });

// --- VIRTUAL FIELDS ---
// Virtual populate for reviews associated with this media
mediaSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'mediaId',
  localField: 'tmdbId',
});

// Convenient virtual for extract-only release year
mediaSchema.virtual('releaseYear').get(function () {
  if (!this.releaseDate) return null;
  return new Date(this.releaseDate).getFullYear();
});

// --- DOCUMENT MIDDLEWARE ---
// Document middleware: Generate URL-safe slug from title before saving
mediaSchema.pre('save', function () {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true, strict: true });
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
