const Media = require('../models/mediaModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllMedia = async (req, res) => {
  try {
    const features = new APIFeatures(Media.find(), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();

    const media = await features.query;

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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.getTopFive = async (req, res) => {
  try {
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

    const media = await features.query;

    res.status(200).json({
      status: 'success',
      pagination: {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || Number(fixedQuery.limit),
      },
      results: media.length,
      data: {
        media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate('reviews');

    if (!media) {
      return res.status(404).json({
        status: 'fail',
        message: 'No media found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const newMedia = await Media.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        media: newMedia,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!media) {
      return res.status(404).json({
        status: 'fail',
        message: 'No media found with that ID',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);

    if (!media) {
      return res.status(404).json({
        status: 'fail',
        message: 'No media found with that ID',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.getMediaStats = async (req, res) => {
  try {
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
      data: stats,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};

exports.getMediaCountByReleaseDate = async (req, res) => {
  try {
    const year = Number(req.params.year);
    const media = await Media.aggregate([
      // STAGE 1: Match
      {
        $match: {
          releaseDate: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
        },
      },

      // STAGE 2: Group (Notice: only _id and accumulators $sum, $push, $first)
      {
        $group: {
          _id: {
            $month: {
              $dateFromString: { dateString: '$releaseDate' },
            },
          },
          // Capture the month name from the documents using $first
          monthName: {
            $first: {
              $dateToString: {
                format: '%B',
                date: { $dateFromString: { dateString: '$releaseDate' } },
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Bad Request: ${err.message || err}`,
    });
  }
};
