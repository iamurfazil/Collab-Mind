const express = require('express');
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.getChatStatus);
router.post('/nexus', requireAuth, controller.askNexus);

module.exports = router;
