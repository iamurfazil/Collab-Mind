const express = require('express');
const authRoutes = require('../modules/auth/route');

const router = express.Router();

router.use('/auth', authRoutes);

module.exports = router;
