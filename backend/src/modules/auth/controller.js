const authService = require('./service');

function getAuthStatus(req, res) {
  const data = authService.getStatus();
  return res.status(200).json({ success: true, data });
}

async function sendOtp(req, res) {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    await authService.sendOtp(email);
    return res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
}

function verifyOtp(req, res) {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const otpValue = String(otp).trim();
  if (!/^\d{6}$/.test(otpValue)) {
    return res.status(400).json({ success: false, message: 'OTP must be 6 digits' });
  }

  const result = authService.verifyOtp(email, otpValue);
  if (!result.ok) {
    return res.status(400).json({ success: false, message: result.message });
  }

  return res.status(200).json({ success: true, message: 'OTP verified' });
}

module.exports = { getAuthStatus, sendOtp, verifyOtp };
