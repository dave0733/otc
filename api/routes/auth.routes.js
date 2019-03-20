const express = require('express');
const authCtrl = require('../controllers/auth.controller');
const { isLoggedin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/login', authCtrl.login);
router.post('/signup', authCtrl.register);
router
  .route('/profile')
  .get(isLoggedin, authCtrl.getProfile)
  .put(isLoggedin, authCtrl.updateProfile);

router.route('/change-password').post(isLoggedin, authCtrl.changePassword);

router.post('/request-reset-password', authCtrl.requestResetPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/send-verification-email', authCtrl.sendVerificationEmail);
router.post('/verify-email', authCtrl.verifyEmail);

module.exports = router;
