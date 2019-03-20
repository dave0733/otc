const express = require('express');
const authRoutes = require('./routes/auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);

module.exports = router;
