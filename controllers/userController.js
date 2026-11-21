const User = require('../models/userModel');
const APIfeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const features = new APIfeatures(User.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();

  const users = await features.query.lean();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(User.findById(req.params.id), req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();
  const user = await features.query.lean();

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.updateUser = catchAsync(async (req, res) => {
  const features = new APIfeatures(
    User.findByIdAndUpdate(req.params.id),
    req.query,
  );
  const updatedUser = await features.query;
  res.status(200).json({
    status: 'success',
    message: 'user has been updated',
    data: updatedUser,
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


