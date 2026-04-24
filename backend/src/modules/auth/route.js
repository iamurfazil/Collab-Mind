const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { authLimiter } = require('../../middleware/rateLimiter');

// POST /api/auth/me — called on login/register to upsert user profile
router.post('/me', requireAuth, controller.me);

// GET /api/auth/me — called on app init to fetch existing user profile
router.get('/me', requireAuth, controller.me);

// POST /api/auth/send-otp — public
router.post('/send-otp', authLimiter, controller.sendOtp);

// POST /api/auth/verify-otp — public
router.post('/verify-otp', authLimiter, controller.verifyOtpHandler);

module.exports = router;
