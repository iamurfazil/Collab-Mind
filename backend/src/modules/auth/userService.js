const { db } = require('../../config/firebaseAdmin');

async function saveUser(user) {
  if (!user || !user.uid) {
    throw new Error('Invalid user payload');
  }

  const userRef = db.collection('users').doc(user.uid);
  const existing = await userRef.get();

  const payload = {
    uid: user.uid,
    email: user.email || null,
    name: user.name || user.displayName || null,
    createdAt: existing.exists ? existing.data().createdAt : new Date().toISOString(),
  };

  await userRef.set(payload, { merge: true });
  return payload;
}

module.exports = { saveUser };
