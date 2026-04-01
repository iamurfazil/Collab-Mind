const admin = require("firebase-admin");
const serviceAccount = require("../../config/serviceAccountKey.json");

let db;

function initializeFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("[INFO] Firebase initialized");
  }
}

function getDB() {
  if (!db) {
    throw new Error("Firestore not initialized");
  }
  return db;
}

module.exports = {
  initializeFirebase,
  getDB,
};