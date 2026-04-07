const express = require('express');

const problemRoutes = require('./problems/route');
const projectRoutes = require('./projects/route');
const chatRoutes = require('./chat/route');
const cmvcRoutes = require('./cmvc/route');

const router = express.Router();

router.use('/problems', problemRoutes);
router.use('/projects', projectRoutes);
router.use('/chat', chatRoutes);
router.use('/cmvc', cmvcRoutes);

module.exports = router;
