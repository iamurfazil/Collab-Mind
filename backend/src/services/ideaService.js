const { db } = require('../config/firebaseAdmin');

async function saveIdea(userId, ideaData) {
  const payload = {
    userId,
    title: ideaData.title,
    description: ideaData.description,
    ai_analysis: ideaData.ai_analysis,
    createdAt: new Date(),
  };

  const docRef = await db.collection('ideas').add(payload);

  return {
    id: docRef.id,
    ...payload,
  };
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function getIdeasByUser(userId) {
  const snapshot = await db.collection('ideas').where('userId', '==', userId).get();

  const ideas = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  ideas.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  return ideas;
}

module.exports = { saveIdea, getIdeasByUser };
