const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/send-otp', controller.sendOtp);
router.post('/verify-otp', controller.verifyOtp);

module.exports = router;
