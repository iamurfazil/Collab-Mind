const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, collabRequestSchema, collabStatusSchema } = require('../../middleware/validate');

const router = express.Router();

router.get('/requests', requireAuth, controller.listRequests);
router.post('/requests', requireAuth, validate(collabRequestSchema), controller.createRequest);
router.patch('/requests/:id', requireAuth, validate(collabStatusSchema), controller.updateRequest);

module.exports = router;
