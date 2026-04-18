const getProblemsHandler = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Problems module is deprecated',
  });
};

module.exports = { getProblemsHandler };