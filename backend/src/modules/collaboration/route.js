const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, collabRequestSchema, collabStatusSchema } = require('../../middleware/validate');

const router = express.Router();

// POST /api/collaboration/request
router.post('/request', requireAuth, validate(collabRequestSchema), controller.postRequest);

// GET /api/collaboration
router.get('/', requireAuth, controller.getRequests);

// PATCH /api/collaboration/status/:id
router.patch('/status/:id', requireAuth, validate(collabStatusSchema), controller.patchRequestStatus);

module.exports = router;
