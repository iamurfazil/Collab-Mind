const projectsService = require('./service');

function getProjectsStatus(req, res) {
  const data = projectsService.getStatus();
  return res.status(200).json({ success: true, data });
}

module.exports = { getProjectsStatus };
