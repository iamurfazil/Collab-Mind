const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const { applicationDefault } = require('firebase-admin/app');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: applicationDefault(),
  });
}

const firestoreDatabaseId = process.env.FIRESTORE_DATABASE_ID || 'collabmind-db';
const db = getFirestore(admin.app(), firestoreDatabaseId);

module.exports = { admin, db };
