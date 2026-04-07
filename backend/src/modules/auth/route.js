const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/send-otp', controller.sendOtp);

module.exports = router;
