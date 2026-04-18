const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require("../../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || 'collabmind-db';
const db = getFirestore(admin.app(), firestoreDatabaseId);

module.exports = { admin, db };
