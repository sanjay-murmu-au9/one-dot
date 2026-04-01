import * as admin from 'firebase-admin';

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin Initialized');
} catch (error) {
  console.error('❌ Firebase Admin Initialization Failed:', error);
  console.log('⚠️ Please ensure FIREBASE_SERVICE_ACCOUNT_JSON env var is set.');
}

export const db = admin.firestore();
