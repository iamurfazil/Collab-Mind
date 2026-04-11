const { getIdeasByUser } = require('../../services/ideaService');

async function getIdeas(req, res) {
  try {
    const ideas = await getIdeasByUser(req.user.uid);
    return res.status(200).json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { getIdeas };
