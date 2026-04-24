const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/requests', requireAuth, controller.listRequests);
router.post('/requests', requireAuth, controller.createRequest);
router.patch('/requests/:id', requireAuth, controller.updateRequest);

module.exports = router;
