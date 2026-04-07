const { getDB } = require('../../config/firebase');

const createProblem = async (payload) => {
  const db = getDB();
  const docRef = await db.collection('problems').add(payload);
  return {
    id: docRef.id,
    ...payload
  };
};

const getProblems = async () => {
  const db = getDB();
  const snapshot = await db.collection('problems').get();

  const problems = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  return problems;
};

module.exports = {
  createProblem,
  getProblems
};