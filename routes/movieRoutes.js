const express = require('express');
const movieController = require('../controllers/movieController');

const router = express.Router();

/* router.param('id', movieController.checkId); */
router
  .route('/top-5-media')
  .get(movieController.getTopFive);
router
  .route('/')
  .get(movieController.getAllMedia)
  .post(movieController.createMedia);

router
  .route('/:id')
  .get(movieController.getMedia)
  .delete(movieController.deleteMedia)
  .patch(movieController.updateMedia);

module.exports = router;
