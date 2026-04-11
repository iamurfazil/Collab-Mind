const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');

router.post('/me', requireAuth, controller.me);

module.exports = router;
