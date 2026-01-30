const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Parse the JSON string from the environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local Dev: Load from file (optional fallback)
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error(
      "Error: FIREBASE_SERVICE_ACCOUNT env var not set and serviceAccountKey.json not found.",
    );
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
