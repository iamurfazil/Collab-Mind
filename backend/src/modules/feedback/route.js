const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

// POST /api/feedback — Public/User submission
router.post('/', controller.postFeedback);

// ADMIN APIs
// GET /api/admin/feedback
// PATCH /api/admin/feedback/:id
// These will be mounted under /api/admin in the main app, 
// or I can define them here and export them separately.
// For now, I'll just export the controller methods.

module.exports = {
    router,
    controller
};
