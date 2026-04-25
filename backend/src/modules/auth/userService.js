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
    email: user.email || (existing.exists ? existing.data().email : null),
    displayName: user.displayName || user.name || (existing.exists ? existing.data().displayName : null),
    role: resolveRole(existing.exists ? existing.data().role : null, user.role),
    city: user.city || (existing.exists ? existing.data().city : null),
    state: user.state || (existing.exists ? existing.data().state : null),
    membership: user.membership || (existing.exists ? existing.data().membership : 'free'),
    bio: user.bio || (existing.exists ? existing.data().bio : null),
    skills: user.skills || (existing.exists ? existing.data().skills : []),
    linkedin: user.linkedin || (existing.exists ? existing.data().linkedin : null),
    collegeName: user.collegeName || (existing.exists ? existing.data().collegeName : null),
    stream: user.stream || (existing.exists ? existing.data().stream : null),
    btechYear: user.btechYear || (existing.exists ? existing.data().btechYear : null),
    btechSemester: user.btechSemester || (existing.exists ? existing.data().btechSemester : null),
    createdAt: existing.exists ? existing.data().createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await userRef.set(payload, { merge: true });
  console.log('FIRESTORE WRITE:', { collection: 'users', docId: user.uid, existsBefore: existing.exists });
  return payload;
}

module.exports = { saveUser };
