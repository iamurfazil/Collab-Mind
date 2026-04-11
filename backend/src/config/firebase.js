const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

let db;

function initializeFirebase() {
  if (!admin.apps.length) {
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Missing Firebase key file at backend/serviceAccountKey.json');
    }

    const serviceAccount = require('../../serviceAccountKey.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("[INFO] Firebase initialized");
  }
}

function getDB() {
  if (!db) {
    initializeFirebase();
  }
  return db;
}

module.exports = {
  initializeFirebase,
  getDB,
};