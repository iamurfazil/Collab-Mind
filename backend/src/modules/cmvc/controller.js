const cmvcService = require('./service');
const { saveIdea } = require('../../services/ideaService');

const analyzeIdea = async (req, res) => {
  try {
    console.log("CMVC CONTROLLER HIT");
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const result = await cmvcService.analyzeIdea({ title, description });
    const savedIdea = await saveIdea(req.user.uid, {
      title,
      description,
      ai_analysis: result.ai_analysis,
    });

    res.json({
      success: true,
      data: result,
      idea: {
        id: savedIdea.id,
        userId: savedIdea.userId,
        createdAt: savedIdea.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  analyzeIdea
};
