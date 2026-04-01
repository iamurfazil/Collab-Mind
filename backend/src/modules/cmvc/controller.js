const cmvcService = require('./service');

function getCmvcStatus(req, res) {
  const data = cmvcService.getStatus();
  return res.status(200).json({ success: true, data });
}

module.exports = { getCmvcStatus };
