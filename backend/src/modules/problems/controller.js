const { getProblems } = require('./service');

const getProblemsHandler = async (req, res) => {
  try {
    const data = await getProblems();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProblemsHandler };