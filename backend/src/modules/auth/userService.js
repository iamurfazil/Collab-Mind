const { db } = require('../../config/firebaseAdmin');

const ALLOWED_ROLES = new Set(['owner', 'builder', 'admin']);

function resolveRole(existingRole, incomingRole) {
  if (existingRole && ALLOWED_ROLES.has(existingRole)) {
    return existingRole;
  }

  if (incomingRole && ALLOWED_ROLES.has(incomingRole)) {
    return incomingRole;
  }

  return 'builder';
}

async function saveUser(user) {
  if (!user || !user.uid) {
    throw new Error('Invalid user payload');
  }

  const userRef = db.collection('users').doc(user.uid);
  const existing = await userRef.get();

  const payload = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || user.name || null,
    role: resolveRole(existing.exists ? existing.data().role : null, user.role),
    city: user.city || existing.data()?.city || null,
    state: user.state || existing.data()?.state || null,
    createdAt: existing.exists ? existing.data().createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await userRef.set(payload, { merge: true });
  console.log('FIRESTORE WRITE:', { collection: 'users', docId: user.uid, existsBefore: existing.exists });
  return payload;
}

module.exports = { saveUser };
