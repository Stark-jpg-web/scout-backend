const Media = require('../models/mediaModel');

exports.getAllMedia = async (req, res) => {
  try {
    //building query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    //executing query
    //This is done like this so we can chain other querying methods
    let query = Media.find(JSON.parse(queryStr));

    //implementing sorting
    if (req.query.sort) {
      console.log(req.query.sort);
      query = query.sort(req.query.sort);
    }

    const media = await query;
    console.log(JSON.parse(queryStr));
    res.status(200).json({
      status: 'success',
      results: media.length,
      data: {
        media: media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        media: media,
        message: 'Movie Found',
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.createMedia = async (req, res) => {
  try {
    const newMedia = await Media.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        media: newMedia,
        message: 'media created successfully',
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        media: media,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: null });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `Bad Request : ${err}`,
    });
  }
};
