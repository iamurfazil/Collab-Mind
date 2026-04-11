const express = require('express');
const { requireAuth } = require('../../middleware/authMiddleware');
const controller = require('./controller');

const router = express.Router();

router.get('/', requireAuth, controller.getIdeas);

module.exports = router;
