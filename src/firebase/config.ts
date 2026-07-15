import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';

// Local development fallback. Firebase App Hosting injects the correct
// project-specific web configuration at build time, so hosted environments
// must attempt no-argument initialization before using this production value.
export const firebaseConfig = {
  "projectId": "studio-6850142148-fe343",
  "appId": "1:61782012212:web:8913d2b40fd9843148f561",
  "apiKey": "AIzaSyA8G2_7gu0WK8efQ9sl7UJG6tsrC7iOCdU",
  "authDomain": "studio-6850142148-fe343.firebaseapp.com",
  "storageBucket": "studio-6850142148-fe343.firebasestorage.app",
  "measurementId": "",
  "messagingSenderId": "61782012212"
};

export function getOrInitializeFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();

  try {
    // App Hosting's FIREBASE_WEBAPP_CONFIG is converted into Firebase SDK
    // defaults during the build. This keeps staging and production isolated.
    return initializeApp();
  } catch {
    // Outside App Hosting (local development), automatic defaults are absent.
    return initializeApp(firebaseConfig);
  }
}
