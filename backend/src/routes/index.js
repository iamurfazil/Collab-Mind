const express = require('express');
const authRoutes = require('../modules/auth/route');
const cmvcRoutes = require('../modules/cmvc/route');
const ideasRoutes = require('../modules/ideas/route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cmvc', cmvcRoutes);
router.use('/ideas', ideasRoutes);

module.exports = router;
