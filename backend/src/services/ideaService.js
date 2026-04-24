const { db } = require('../config/firebaseAdmin');

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeIdea(docId, raw = {}) {
  return {
    id: docId,
    userId: raw.userId || '',
    userName: raw.userName || 'Anonymous',
    title: raw.title || '',
    description: raw.description || '',
    expectations: raw.expectations || 'No expectations provided yet.',
    status: raw.status || 'open',
    progress: typeof raw.progress === 'number' ? raw.progress : 0,
    projectStatus: raw.projectStatus || '',
    dueDate: raw.dueDate || '',
    createdAt: toIso(raw.createdAt) || new Date().toISOString(),
    updatedAt: toIso(raw.updatedAt) || null,
    collaborators: Array.isArray(raw.collaborators) ? raw.collaborators : [],
    isPublished: typeof raw.isPublished === 'boolean' ? raw.isPublished : true,
    cmvcReport: raw.cmvcReport || null,
    patentStatus: raw.patentStatus || null,
    patentRequested: typeof raw.patentRequested === 'boolean' ? raw.patentRequested : false,
    patentRequestedAt: toIso(raw.patentRequestedAt) || null,
    patentRequester: raw.patentRequester || null,
    patentSummary: raw.patentSummary || null,
  };
}

function sanitizeCreateIdeaPayload(userId, ideaData = {}) {
  const now = new Date().toISOString();

  return {
    userId,
    userName: ideaData.userName || 'Anonymous',
    title: String(ideaData.title || '').trim(),
    description: String(ideaData.description || '').trim(),
    expectations: String(ideaData.expectations || 'No expectations provided yet.').trim(),
    status: ideaData.status || 'open',
    progress: typeof ideaData.progress === 'number' ? ideaData.progress : 0,
    projectStatus: ideaData.projectStatus || '',
    dueDate: ideaData.dueDate || '',
    createdAt: now,
    updatedAt: now,
    collaborators: Array.isArray(ideaData.collaborators) ? ideaData.collaborators : [],
    isPublished: typeof ideaData.isPublished === 'boolean' ? ideaData.isPublished : true,
    cmvcReport: ideaData.cmvcReport || null,
    patentStatus: ideaData.patentStatus || null,
    patentRequested: typeof ideaData.patentRequested === 'boolean' ? ideaData.patentRequested : false,
    patentRequestedAt: ideaData.patentRequestedAt || null,
    patentRequester: ideaData.patentRequester || null,
    patentSummary: ideaData.patentSummary || null,
  };
}

function sanitizeUpdateIdeaPayload(updates = {}) {
  const payload = { updatedAt: new Date().toISOString() };
  const allowedFields = [
    'title',
    'description',
    'expectations',
    'status',
    'progress',
    'projectStatus',
    'dueDate',
    'collaborators',
    'isPublished',
    'cmvcReport',
    'userName',
  ];

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      payload[field] = updates[field];
    }
  }

  return payload;
}

async function requestPatentById(ideaId, requester, summary) {
  const ideaRef = db.collection('ideas').doc(ideaId);
  const snapshot = await ideaRef.get();

  if (!snapshot.exists) {
    throw new Error('Idea not found');
  }

  const idea = snapshot.data();
  if (!requester?.uid || idea?.userId !== requester.uid) {
    throw new Error('Only the idea owner can request a patent');
  }

  const now = new Date().toISOString();
  const patentRequester = {
    id: requester.uid,
    name: requester.name || requester.displayName || 'Owner',
    email: requester.email || null,
  };

  const payload = {
    patentStatus: 'requested',
    patentRequested: true,
    patentRequestedAt: now,
    patentRequester,
    patentSummary: String(summary || '').trim(),
    status: 'patent',
    isPublished: false,
    updatedAt: now,
  };

  await ideaRef.set(payload, { merge: true });
  const updated = await ideaRef.get();
  return normalizeIdea(updated.id, updated.data());
}

function canMutateIdea(idea, userId) {
  if (!idea || !userId) return false;
  if (idea.userId === userId) return true;
  if (Array.isArray(idea.collaborators) && idea.collaborators.includes(userId)) return true;
  return false;
}

async function createIdea(userId, ideaData) {
  const payload = sanitizeCreateIdeaPayload(userId, ideaData);

  if (!payload.title || !payload.description) {
    throw new Error('Title and description are required');
  }

  const docRef = await db.collection('ideas').add(payload);
  const snapshot = await docRef.get();

  return normalizeIdea(snapshot.id, snapshot.data());
}

async function getAllIdeas() {
  const snapshot = await db.collection('ideas').get();

  const ideas = snapshot.docs.map((doc) => normalizeIdea(doc.id, doc.data()));
  ideas.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  return ideas;
}

async function getIdeasByUser(userId) {
  const snapshot = await db.collection('ideas').where('userId', '==', userId).get();

  const ideas = snapshot.docs.map((doc) => normalizeIdea(doc.id, doc.data()));

  ideas.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  return ideas;
}

async function updateIdeaById(ideaId, userId, updates) {
  const ideaRef = db.collection('ideas').doc(ideaId);
  const snapshot = await ideaRef.get();

  if (!snapshot.exists) {
    throw new Error('Idea not found');
  }

  const existingIdea = snapshot.data();

  if (!canMutateIdea(existingIdea, userId)) {
    throw new Error('You are not allowed to update this idea');
  }

  const payload = sanitizeUpdateIdeaPayload(updates);
  await ideaRef.set(payload, { merge: true });

  const updated = await ideaRef.get();
  return normalizeIdea(updated.id, updated.data());
}

async function deleteIdeaById(ideaId, userId) {
  const ideaRef = db.collection('ideas').doc(ideaId);
  const snapshot = await ideaRef.get();

  if (!snapshot.exists) {
    throw new Error('Idea not found');
  }

  const existingIdea = snapshot.data();

  if (existingIdea.userId !== userId) {
    throw new Error('Only the idea owner can delete this idea');
  }

  await ideaRef.delete();
}

module.exports = {
  createIdea,
  getAllIdeas,
  getIdeasByUser,
  updateIdeaById,
  deleteIdeaById,
  requestPatentById,
};
