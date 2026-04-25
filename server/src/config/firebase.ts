import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

let initialized = false;

try {
  if (fs.existsSync(serviceAccountPath)) {
    // Local dev: use serviceAccountKey.json file
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });
    initialized = true;
    console.log('✅ Firebase Admin Initialized (using serviceAccountKey.json)');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON && process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim().startsWith('{')) {
    // Production: use env var (only if it looks like valid JSON)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log('✅ Firebase Admin Initialized (using env var)');
  } else {
    console.warn('⚠️ Firebase Admin not initialized: No credentials found.');
    console.warn('   - For local dev: Add serviceAccountKey.json to server/');
    console.warn('   - For production: Set FIREBASE_SERVICE_ACCOUNT_JSON env var');
  }
} catch (error) {
  console.error('❌ Firebase Admin Initialization Failed:', error);
}

export const db = initialized ? admin.firestore() : null;
export const auth = initialized ? admin.auth() : null;
export { admin };
