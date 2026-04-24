const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { validate, cmvcQuerySchema } = require('../../middleware/validate');

const router = express.Router();

router.post('/analyze', requireAuth, validate(cmvcQuerySchema), controller.analyzeIdea);

module.exports = router;
