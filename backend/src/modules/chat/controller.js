const chatService = require('./service');

function getChatStatus(req, res) {
  const data = chatService.getStatus();
  return res.status(200).json({ success: true, data });
}

module.exports = { getChatStatus };
