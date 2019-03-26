const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const profileRoutes = require('./routes/profile.routes');

const { isLoggedin } = require('./middlewares/auth.middleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', isLoggedin, userRoutes);
router.use('/groups', isLoggedin, groupRoutes);
router.use('/profile', isLoggedin, profileRoutes);

module.exports = router;
