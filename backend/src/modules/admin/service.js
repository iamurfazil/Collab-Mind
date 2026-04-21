const { db, admin } = require('../../config/firebaseAdmin');

const ALLOWED_ROLES = new Set(['owner', 'builder', 'admin']);

function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeUser(docId, raw = {}) {
  return {
    id: docId,
    uid: raw.uid || docId,
    email: raw.email || '',
    displayName: raw.displayName || 'Unknown',
    role: raw.role || 'builder',
    city: raw.city || '',
    state: raw.state || '',
    createdAt: toIso(raw.createdAt) || null,
    updatedAt: toIso(raw.updatedAt) || null,
  };
}

function normalizeIdea(docId, raw = {}) {
  return {
    id: docId,
    title: raw.title || '',
    userId: raw.userId || '',
    userName: raw.userName || 'Anonymous',
    status: raw.status || 'open',
    projectStatus: raw.projectStatus || '',
    isPublished: typeof raw.isPublished === 'boolean' ? raw.isPublished : true,
    createdAt: toIso(raw.createdAt) || null,
    updatedAt: toIso(raw.updatedAt) || null,
  };
}

function normalizeFeedback(docId, raw = {}) {
  return {
    id: docId,
    userName: raw.userName || 'Anonymous',
    email: raw.email || '',
    category: raw.category || 'general',
    message: raw.message || '',
    status: raw.status || 'pending',
    timestamp: toIso(raw.timestamp) || null,
    formattedDate: raw.formattedDate || toIso(raw.timestamp),
  };
}

function normalizeAnnouncement(docId, raw = {}) {
  return {
    id: docId,
    title: raw.title || 'Untitled announcement',
    message: raw.message || '',
    status: raw.status || 'active',
    createdAt: toIso(raw.createdAt) || null,
  };
}

async function getCollectionRows(collectionName, normalizer) {
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map((doc) => normalizer(doc.id, doc.data()));
}

function sortNewestFirst(items, key = 'createdAt') {
  return [...items].sort((left, right) => new Date(right[key] || 0).getTime() - new Date(left[key] || 0).getTime());
}

async function getDashboard() {
  const [users, ideas, feedback] = await Promise.all([
    getCollectionRows('users', normalizeUser),
    getCollectionRows('ideas', normalizeIdea),
    getCollectionRows('feedback', normalizeFeedback),
  ]);
  const announcements = await getCollectionRows('announcements', normalizeAnnouncement);

  const totalUsers = users.length;
  const adminUsers = users.filter((user) => user.role === 'admin').length;
  const ownerUsers = users.filter((user) => user.role === 'owner').length;
  const builderUsers = users.filter((user) => user.role === 'builder').length;

  const activeIdeas = ideas.filter((idea) => !['completed', 'closed'].includes(String(idea.status))).length;
  const completedIdeas = ideas.filter((idea) => String(idea.status) === 'completed').length;
  const pendingFeedback = feedback.filter((item) => String(item.status) === 'pending').length;

  const summary = {
    totalUsers,
    adminUsers,
    ownerUsers,
    builderUsers,
    totalIdeas: ideas.length,
    activeIdeas,
    completedIdeas,
    pendingFeedback,
  };

  return {
    summary,
    users: sortNewestFirst(users, 'createdAt').slice(0, 20),
    ideas: sortNewestFirst(ideas, 'createdAt').slice(0, 20),
    feedback: sortNewestFirst(feedback, 'timestamp').slice(0, 20),
    announcements: sortNewestFirst(announcements, 'createdAt').slice(0, 20),
  };
}

async function updateUserRole(userId, role, updatedBy) {
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error('Invalid role');
  }

  const userRef = db.collection('users').doc(userId);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    throw new Error('User not found');
  }

  const payload = {
    role,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedBy || null,
  };

  await userRef.set(payload, { merge: true });

  try {
    await admin.auth().setCustomUserClaims(userId, { role });
  } catch (error) {
    console.warn('Unable to update custom claims for user role:', error.message);
  }

  const updated = await userRef.get();
  return normalizeUser(updated.id, updated.data());
}

module.exports = {
  getDashboard,
  updateUserRole,
};