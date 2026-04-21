const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/adminMiddleware');

const router = express.Router();

router.get('/dashboard', requireAuth, requireAdmin, controller.dashboard);
router.patch('/users/:userId/role', requireAuth, requireAdmin, controller.changeUserRole);

module.exports = router;