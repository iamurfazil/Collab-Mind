const { db } = require('../../config/firebaseAdmin');

function normalizeFeedback(docId, raw = {}) {
  return {
    id: docId,
    name: raw.name || 'Anonymous',
    email: raw.email || '',
    message: raw.message || '',
    status: raw.status || 'pending', // "pending" | "approved"
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

async function createFeedback({ name, email, message }) {
  const payload = {
    name,
    email,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('feedbacks').add(payload);
  const saved = await docRef.get();
  return normalizeFeedback(saved.id, saved.data());
}

async function getAllFeedback() {
  const snapshot = await db.collection('feedbacks').orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => normalizeFeedback(doc.id, doc.data()));
}

async function updateFeedbackStatus(id, status) {
  const docRef = db.collection('feedbacks').doc(id);
  const snapshot = await docRef.get();
  if (!snapshot.exists) throw new Error('Feedback not found');

  await docRef.set({ status, updatedAt: new Date().toISOString() }, { merge: true });
  const updated = await docRef.get();
  return normalizeFeedback(updated.id, updated.data());
}

module.exports = {
  createFeedback,
  getAllFeedback,
  updateFeedbackStatus
};
