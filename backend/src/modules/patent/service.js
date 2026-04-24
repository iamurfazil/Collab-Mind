const { db } = require('../../config/firebaseAdmin');

function normalizePatentRequest(docId, raw = {}) {
  return {
    id: docId,
    ideaId: raw.ideaId || '',
    userId: raw.userId || '',
    userName: raw.userName || 'Unknown',
    email: raw.email || '',
    ideaTitle: raw.ideaTitle || '',
    status: raw.status || 'pending',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

async function createPatentRequest(userId, { ideaId, userName, email, ideaTitle }) {
  const payload = {
    ideaId,
    userId,
    userName: userName || 'Unknown',
    email: email || '',
    ideaTitle: ideaTitle || 'Untitled Idea',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection('patent_requests').add(payload);
  const saved = await docRef.get();
  
  // Also update idea status
  await db.collection('ideas').doc(ideaId).set({
      patentStatus: 'requested',
      status: 'patent',
      updatedAt: new Date().toISOString()
  }, { merge: true });

  return normalizePatentRequest(saved.id, saved.data());
}

async function getPatentRequestsByUser(userId) {
  const snapshot = await db.collection('patent_requests').where('userId', '==', userId).get();
  return snapshot.docs.map(doc => normalizePatentRequest(doc.id, doc.data()));
}

async function getAllPatentRequests() {
  const snapshot = await db.collection('patent_requests').get();
  return snapshot.docs.map(doc => normalizePatentRequest(doc.id, doc.data()));
}

async function updatePatentStatus(requestId, status) {
  const docRef = db.collection('patent_requests').doc(requestId);
  const snapshot = await docRef.get();
  
  if (!snapshot.exists) throw new Error('Patent request not found');
  
  await docRef.set({ status, updatedAt: new Date().toISOString() }, { merge: true });
  
  const updated = await docRef.get();
  const data = updated.data();
  
  // Update associated idea
  if (data.ideaId) {
      await db.collection('ideas').doc(data.ideaId).set({
          patentStatus: status,
          updatedAt: new Date().toISOString()
      }, { merge: true });
  }
  
  return normalizePatentRequest(updated.id, data);
}

module.exports = {
  createPatentRequest,
  getPatentRequestsByUser,
  getAllPatentRequests,
  updatePatentStatus
};
