const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./roomsplit-pro-firebase-adminsdk-fbsvc-3b32fdd793.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;