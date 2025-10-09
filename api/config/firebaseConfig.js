import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.warn("Firebase service account not found in environment variables. Falling back to local file.");
    const localKey = await import('./serviceAccountKey.json', { assert: { type: 'json' } });
    admin.initializeApp({
      credential: admin.credential.cert(localKey.default)
    });
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };