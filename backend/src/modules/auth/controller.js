const { saveUser } = require('./userService');

async function me(req, res) {
  try {
    const user = await saveUser({
      ...req.user,
      ...req.body,
    });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { me };
