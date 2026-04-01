const { getDB } = require("../../config/firebase");

const db = getDB();

const getProblems = async () => {
  const snapshot = await db.collection("problems").get();

  const problems = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return problems;
};

module.exports = {
  createProblem,
  getProblems
};