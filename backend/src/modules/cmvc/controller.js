const cmvcService = require('./service');

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

    res.json({
      success: true,
      data: result,
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
