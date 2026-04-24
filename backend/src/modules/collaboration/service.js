const { admin, db } = require('../../config/firebaseAdmin');
const { queueEmail } = require('../../services/emailService');
const { notifyUser } = require('../../socket');
function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeRequest(docId, raw = {}) {
  return {
    id: docId,
    ideaId: raw.ideaId || '',
    ideaTitle: raw.ideaTitle || '',
    ownerId: raw.ownerId || raw.projectOwnerId || '',
    requesterId: raw.requesterId || '',
    requesterName: raw.requesterName || 'Builder',
    requesterEmail: raw.requesterEmail || '',
    answer: raw.answer || '',
    status: raw.status || 'pending',
    createdAt: toIso(raw.createdAt) || null,
    updatedAt: toIso(raw.updatedAt) || null,
  };
}

async function createRequest({ requester, ideaId, answer }) {
  if (!ideaId) {
    throw new Error('Idea ID is required');
  }

  const trimmedAnswer = String(answer || '').trim();
  if (!trimmedAnswer) {
    throw new Error('Answer is required');
  }

  const ideaRef = db.collection('ideas').doc(ideaId);
  const ideaSnapshot = await ideaRef.get();

  if (!ideaSnapshot.exists) {
    throw new Error('Idea not found');
  }

  const idea = ideaSnapshot.data();
  if (!idea?.isPublished) {
    throw new Error('This idea is not published yet');
  }

  if (idea.userId === requester.uid) {
    throw new Error('You cannot request your own idea');
  }

  const existingSnapshot = await db
    .collection('collaboration_requests')
    .where('ideaId', '==', ideaId)
    .where('requesterId', '==', requester.uid)
    .where('status', 'in', ['pending', 'approved'])
    .get();

  if (!existingSnapshot.empty) {
    throw new Error('You already requested to collaborate on this idea');
  }

  const ownerId = idea.userId || '';
  const requesterName = requester.name || requester.displayName || 'Builder';
  const requesterEmail = requester.email || '';

  const payload = {
    ideaId,
    ideaTitle: idea.title || 'Untitled idea',
    ownerId,
    projectOwnerId: ownerId,
    requesterId: requester.uid,
    requesterName,
    requesterEmail,
    answer: trimmedAnswer,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const docRef = await db.collection('collaboration_requests').add(payload);

  try {
    const ownerSnapshot = await db.collection('users').doc(ownerId).get();
    const ownerEmail = ownerSnapshot.exists ? ownerSnapshot.data()?.email : null;

    if (ownerEmail) {
      const subject = `New collaboration request: ${payload.ideaTitle}`;
      const text = [
        `Requester: ${requesterName} (${requesterEmail || 'No email'})`,
        `Idea: ${payload.ideaTitle}`,
        `Answer: ${payload.answer}`,
      ].join('\n');
      await queueEmail({ to: ownerEmail, subject, text });
    }
  } catch (error) {
    console.warn('Unable to queue collaboration email:', error.message);
  }

  const saved = await docRef.get();
  return normalizeRequest(saved.id, saved.data());
}

async function listRequestsForUser({ userId, scope }) {
  const queryField = scope === 'requester' ? 'requesterId' : 'ownerId';
  const snapshot = await db
    .collection('collaboration_requests')
    .where(queryField, '==', userId)
    .get();

  return snapshot.docs
    .map((doc) => normalizeRequest(doc.id, doc.data()))
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime());
}

async function updateRequestStatus({ requestId, ownerId, status }) {
  const requestRef = db.collection('collaboration_requests').doc(requestId);
  const snapshot = await requestRef.get();

  if (!snapshot.exists) {
    throw new Error('Request not found');
  }

  const request = snapshot.data();
  if (request.ownerId !== ownerId && request.projectOwnerId !== ownerId) {
    throw new Error('You are not allowed to update this request');
  }

  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('Invalid request status');
  }

  const updates = {
    status,
    updatedAt: new Date().toISOString(),
  };

  await requestRef.set(updates, { merge: true });

  let updatedIdea = null;
  if (status === 'approved') {
    const ideaRef = db.collection('ideas').doc(request.ideaId);
    await ideaRef.set(
      {
        collaborators: admin.firestore.FieldValue.arrayUnion(request.requesterId),
        status: 'in_review',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    const ideaSnapshot = await ideaRef.get();
    updatedIdea = ideaSnapshot.exists ? { id: ideaSnapshot.id, ...ideaSnapshot.data() } : null;
  }

  try {
    if (request.requesterEmail) {
      const subject = `Your collaboration request was ${status}`;
      const text = [
        `Idea: ${request.ideaTitle || 'Untitled idea'}`,
        `Status: ${status}`,
      ].join('\n');
      await queueEmail({ to: request.requesterEmail, subject, text });
    }
  } catch (error) {
    console.warn('Unable to queue requester email:', error.message);
  }

  const updated = await requestRef.get();
  return {
    request: normalizeRequest(updated.id, updated.data()),
    idea: updatedIdea,
  };
}

module.exports = {
  createRequest,
  listRequestsForUser,
  updateRequestStatus,
};
