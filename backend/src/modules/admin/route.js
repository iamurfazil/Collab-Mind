const express = require('express');
const controller = require('./controller');
const { requireAuth, requireAdmin } = require('../../middleware/authMiddleware');
const router = express.Router();

// Dashboard summary
router.get('/dashboard', requireAuth, requireAdmin, controller.getDashboard);

// User role management
router.patch('/users/:id/role', requireAuth, requireAdmin, controller.updateRole);

// Feedback management
const feedbackController = require('../feedback/controller');
router.get('/feedback', requireAuth, requireAdmin, feedbackController.getAdminFeedback);
router.patch('/feedback/:id', requireAuth, requireAdmin, feedbackController.patchAdminFeedback);

// Patent request management
const patentService = require('../patent/service');
router.get('/patent-requests', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const data = await patentService.getAllPatentRequests();
        res.json({ success: true, data });
    } catch (error) { next(error); }
});
router.patch('/patent-requests/:id', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const data = await patentService.updatePatentStatus(req.params.id, status);
        res.json({ success: true, data });
    } catch (error) { next(error); }
});

module.exports = router;