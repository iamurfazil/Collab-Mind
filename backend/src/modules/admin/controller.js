// Imports removed to avoid naming conflicts with function names

async function getDashboard(req, res) {
  try {
    const data = await require('./service').getDashboard();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const updated = await require('./service').updateUserRole(id, role, req.user?.uid);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getDashboard,
  updateRole,
};