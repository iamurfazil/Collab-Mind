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

module.exports = { getAuthStatus, sendOtp };
