const express = require('express');
const multer = require('multer');
const messageCtrl = require('../controllers/message.controller');
const config = require('../../config');

const router = express.Router();
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.firebaseUploadLimit
  }
});

router.route('/').post(messageCtrl.create);
router
  .route('/file')
  .post(uploader.single('file'), messageCtrl.createFileMessage);

router
  .route('/:messageid')
  .put(messageCtrl.update)
  .delete(messageCtrl.delete);

router.param('messageid', messageCtrl.getByIdMiddleware);

module.exports = router;
