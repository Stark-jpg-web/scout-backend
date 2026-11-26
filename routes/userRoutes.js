const express = require('express');
const authController = require('../controllers/authController');

const userController = require('../controllers/userController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signUp);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers,
  );

router
  .route('/:id')
  .get(authController.protect, userController.getUser)
  .delete(authController.protect, userController.deleteUser)
  .patch(authController.protect, userController.updateUser);

module.exports = router;
