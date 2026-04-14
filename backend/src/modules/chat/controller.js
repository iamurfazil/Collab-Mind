const chatService = require('./service');

function getChatStatus(req, res) {
  const data = chatService.getStatus();
  return res.status(200).json({ success: true, data });
}

async function askNexus(req, res) {
  try {
    const { message, role, history = [], context = {} } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const safeRole = role === 'owner' ? 'owner' : 'builder';
    const reply = await chatService.generateNexusReply({
      role: safeRole,
      message: message.trim(),
      history,
      context,
      userId: req.user?.uid,
    });

    return res.status(200).json({
      success: true,
      data: {
        role: safeRole,
        reply,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get Nexus AI response',
    });
  }
}

module.exports = { getChatStatus, askNexus };
