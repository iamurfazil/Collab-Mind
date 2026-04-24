const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

// POST /api/patent/request
router.post('/request', requireAuth, controller.postRequest);

// GET /api/patent/my
router.get('/my', requireAuth, controller.getMyRequests);

module.exports = router;
