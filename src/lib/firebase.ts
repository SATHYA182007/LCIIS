import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBcFoCsAdYWk9jsRfwbhm1Qepv5k1EdvvM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'greenminds-2e90e.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'greenminds-2e90e',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'greenminds-2e90e.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '397125716933',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:397125716933:web:eddcb983a6b785d89e99ac',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://greenminds-2e90e-default-rtdb.firebaseio.com',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.databaseURL
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

if (isFirebaseConfigured()) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    console.log('✅ Firebase initialized successfully with project:', firebaseConfig.projectId);
  } catch (err) {
    console.error('⚠️ Firebase initialization error:', err);
  }
} else {
  console.info('ℹ️ Firebase environment variables missing or incomplete.');
}

const database = rtdb;

export { app, auth, db, rtdb, database };
