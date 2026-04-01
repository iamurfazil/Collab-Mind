const { getDB } = require("../../config/firebase");

const createProblem = async (data) => {
  const db = getDB(); // ✅ inside function

  const doc = await db.collection("problems").add({
    ...data,
    createdAt: new Date()
  });

  return { id: doc.id };
};

const getProblems = async () => {
  const db = getDB(); // ✅ inside function

  const snapshot = await db.collection("problems").get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

module.exports = {
  createProblem,
  getProblems
};