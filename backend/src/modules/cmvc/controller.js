const cmvcService = require('./service');

const analyzeIdea = async (req, res, next) => {
  try {
    console.log("CMVC CONTROLLER HIT");
    const { title, description } = req.body;

    if (!title || !description) {
      const err = new Error('Title and description are required');
      err.statusCode = 400;
      return next(err);
    }

    const result = await cmvcService.analyzeIdea({ title, description });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeIdea
};
