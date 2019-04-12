const express = require('express');
const authCtrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authCtrl.login);
router.post('/signup', authCtrl.register);
router.post('/request-reset-password', authCtrl.requestResetPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.post('/send-verification-email', authCtrl.sendVerificationEmail);
router.post('/verify-email', authCtrl.verifyEmail);
router.get('/generate-2fa', authCtrl.generate2FAKey);

module.exports = router;
