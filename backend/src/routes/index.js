const express = require('express');
const authRoutes = require('../modules/auth/route');
const cmvcRoutes = require('../modules/cmvc/route');
const ideasRoutes = require('../modules/ideas/route');
const chatRoutes = require('../modules/chat/route');
const adminRoutes = require('../modules/admin/route');
const collaborationRoutes = require('../modules/collaboration/route');
const projectsRoutes = require('../modules/projects/route');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/cmvc', cmvcRoutes);
router.use('/ideas', ideasRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/collaboration', collaborationRoutes);
router.use('/projects', projectsRoutes);

module.exports = router;
