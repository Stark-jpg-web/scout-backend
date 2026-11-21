const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [40, 'Your name must not exceed 40 characters'],
      minlength: [3, 'Your name must be at least 3 characters long'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, 'please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide your password'],
      trim: true,
      minlength: [8, 'Your password must be at least 8 characters long'],
      maxlength: [128, 'Your password must not exceed 128 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please provide your password confirm'],
      trim: true,
      minlength: [8, 'Your password must be at least 8 characters long'],
      maxlength: [128, 'Your password must not exceed 128 characters'],
      select: false,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: `Password and passwordConfirm do not match`,
      },
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
