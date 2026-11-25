const { promisify } = require('util');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //checking if the email and password are provided
  const { email, password } = req.body;
  if (!email || !password || !typeof password === String) {
    return next(new AppError('Please provide email and password', 400));
  }
  //checking if the user exists in the db and pass is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('invalid email or password', 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //get token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  //verify token
  if (!token) {
    next(new AppError('Please log in to gain access', 401));
    return;
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //verify if user exists
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    next(new AppError('This user connected to this token does not exist', 401));
    return;
  }

  //verify if pass has changed
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'the user has changed their password after the jwt was issued',
        401,
      ),
    );
  }
  //if all previous conditions were passed then user shall be granted access
  req.user = freshUser;
  next();
});
