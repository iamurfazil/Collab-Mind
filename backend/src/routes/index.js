const express = require('express');

const healthRoutes = require('./healthRoutes');
const moduleRoutes = require('../modules');

const router = express.Router();

router.use('/health', healthRoutes);
router.use(moduleRoutes);

module.exports = router;
