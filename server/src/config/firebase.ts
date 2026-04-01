import * as admin from 'firebase-admin';

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('✅ Firebase Admin Initialized');
} catch (error) {
  console.error('❌ Firebase Admin Initialization Failed:', error);
  console.log('⚠️ Please ensure FIREBASE_* environment variables are set.');
}

export const db = admin.firestore();
