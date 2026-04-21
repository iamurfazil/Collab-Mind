const { getDashboard, updateUserRole } = require('./service');

async function dashboard(req, res) {
  try {
    const data = await getDashboard();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function changeUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body || {};
    const updated = await updateUserRole(userId, role, req.user?.uid);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  dashboard,
  changeUserRole,
};