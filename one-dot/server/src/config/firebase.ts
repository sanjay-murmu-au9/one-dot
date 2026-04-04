import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

let credential: admin.credential.Credential;

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  // Local dev: use serviceAccountKey.json file
  credential = admin.credential.cert(serviceAccountPath);
} else {
  // Production: use env var
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  credential = admin.credential.cert(serviceAccount);
}

try {
  admin.initializeApp({ credential });
  console.log('✅ Firebase Admin Initialized');
} catch (error) {
  console.error('❌ Firebase Admin Initialization Failed:', error);
  console.log('⚠️ Please ensure FIREBASE_SERVICE_ACCOUNT_JSON env var is set.');
}

export const db = admin.firestore();
