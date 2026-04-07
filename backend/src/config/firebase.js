const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.resolve(__dirname, '../../config/serviceAccountKey.json');

const credential = fs.existsSync(serviceAccountPath)
  ? admin.credential.cert(require(serviceAccountPath))
  : admin.credential.applicationDefault();

let db;

function initializeFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential,
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