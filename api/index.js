const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const { isLoggedin } = require('./middlewares/auth.middleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', isLoggedin, userRoutes);

module.exports = router;
