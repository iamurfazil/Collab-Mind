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
    displayName: user.displayName || user.name || null,
    createdAt: existing.exists ? existing.data().createdAt : new Date().toISOString(),
  };

  await userRef.set(payload, { merge: true });
  console.log('FIRESTORE WRITE:', { collection: 'users', docId: user.uid, existsBefore: existing.exists });
  return payload;
}

module.exports = { saveUser };
