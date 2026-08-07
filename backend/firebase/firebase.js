const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const path = require("path");

const serviceAccount = require(
  process.env.RENDER
    ? "/etc/secrets/firebase-key.json"
    : path.join(__dirname, "roomsplit-pro-firebase-adminsdk-fbsvc-3b32fdd793.json")
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

module.exports = db;