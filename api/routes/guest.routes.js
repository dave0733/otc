const express = require('express');
const guestCtrl = require('../controllers/guest.controller');

const router = express.Router();

router.post('/contact', guestCtrl.contactUs);

module.exports = router;
