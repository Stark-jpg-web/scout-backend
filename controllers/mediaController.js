const Media = require('../models/mediaModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Middleware to alias top-5 media queries
exports.aliasTopMedia = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-voteAverage';
  req.query.fields = 'title,voteAverage,releaseDate,overview';
  next();
};

exports.getAllMedia = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Media.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const media = await features.query.lean();

  res.status(200).json({
    status: 'success',
    pagination: {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    },
    results: media.length,
    data: {
      media,
    },
  });
});

exports.getTopFive = catchAsync(async (req, res, next) => {
  const fixedQuery = {
    ...req.query,
    limit: '5',
    sort: '-voteAverage',
    fields: 'title,voteAverage,releaseDate,overview',
  };

  const features = new APIFeatures(Media.find(), fixedQuery)
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const media = await features.query.lean();

  res.status(200).json({
    status: 'success',
    pagination: {
      page: Number(req.query.page) || 1,
      limit: Number(fixedQuery.limit),
    },
    results: media.length,
    data: {
      media,
    },
  });
});

exports.getMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findById(req.params.id).populate('reviews');

  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      media,
    },
  });
});

exports.createMedia = catchAsync(async (req, res, next) => {
  const newMedia = await Media.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      media: newMedia,
    },
  });
});

exports.updateMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      media,
    },
  });
});

exports.deleteMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findByIdAndDelete(req.params.id);

  if (!media) {
    return next(new AppError('No media found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMediaStats = catchAsync(async (req, res, next) => {
  const stats = await Media.aggregate([
    {
      $match: {
        voteAverage: { $gte: 8.0 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$status' },
        title: { $push: '$title' },
        count: { $sum: 1 },
        voteAvg: { $avg: '$voteAverage' },
      },
    },
    {
      $sort: {
        voteAvg: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMediaCountByReleaseDate = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  if (Number.isNaN(year)) {
    return next(new AppError('Please provide a valid year parameter', 400));
  }

  const media = await Media.aggregate([
    // STAGE 1: Match
    {
      $match: {
        releaseDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    // STAGE 2: Group (Notice: only _id and accumulators $sum, $push, $first)
    {
      $group: {
        _id: { $month: '$releaseDate' },
        // Capture the month name from the documents using $first
        monthName: {
          $first: {
            $dateToString: {
              format: '%B',
              date: '$releaseDate',
            },
          },
        },
        mediaCountByMonth: { $sum: 1 },
        media: {
          $push: {
            title: '$title',
            releaseDate: '$releaseDate',
          },
        },
      },
    },

    // STAGE 3: $addFields is its OWN stage in the array (with a '$')
    {
      $addFields: {
        month: '$_id',
      },
    },

    // STAGE 4: Clean up MongoDB's default _id
    {
      $project: {
        _id: 0,
      },
    },

    // STAGE 5: Sort by calendar month 1 to 12
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      media,
    },
  });
});
