const express = require('express');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

/* router.param('id', mediaController.checkId); */
router.route('/top-5-media').get(mediaController.getTopFive);

router
  .route('/')
  .get(mediaController.getAllMedia)
  .post(mediaController.createMedia);

router
  .route('/:id')
  .get(mediaController.getMedia)
  .delete(mediaController.deleteMedia)
  .patch(mediaController.updateMedia);

module.exports = router;
