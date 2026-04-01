const authService = require('./service');

function getAuthStatus(req, res) {
  const data = authService.getStatus();
  return res.status(200).json({ success: true, data });
}

module.exports = { getAuthStatus };
