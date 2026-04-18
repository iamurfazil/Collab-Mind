const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/analyze', requireAuth, controller.analyzeIdea);

module.exports = router;
