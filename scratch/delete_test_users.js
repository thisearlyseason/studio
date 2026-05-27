const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountBase64) {
  console.error("FIREBASE_SERVICE_ACCOUNT_JSON not found in .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const emailsToDelete = [
  'testcoach+20260527@example.com',
  'testcoach+20260527-001@example.com',
  'testcoach+20260527-002@example.com'
];

async function run() {
  for (const email of emailsToDelete) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      console.log(`Found user: ${email} (UID: ${user.uid}). Deleting...`);
      await admin.auth().deleteUser(user.uid);
      console.log(`Deleted user: ${email}`);
      
      // Also delete from Firestore if exists
      const db = admin.firestore();
      await db.collection('users').doc(user.uid).delete();
      console.log(`Deleted Firestore document for UID: ${user.uid}`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log(`User not found: ${email}`);
      } else {
        console.error(`Error deleting user ${email}:`, e);
      }
    }
  }
  process.exit(0);
}

run();
