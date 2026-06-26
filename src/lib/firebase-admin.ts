/**
 * Firebase Admin SDK initializer — server-side only.
 *
 * Use this module in all API routes and server functions instead of the client
 * SDK (`firebase/firestore`). The Admin SDK uses standard HTTP rather than
 * gRPC/WebSockets and works correctly in serverless environments (Firebase App
 * Hosting, Vercel, etc.) where the client SDK's persistent connection fails
 * with "client is offline".
 *
 * Initialization order:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON env var (full service-account JSON string)
 *   2. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / GCP metadata)
 */
import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  // Return existing app if already initialized
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {
      console.error('[firebase-admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON — must be a valid JSON string.');
    }
  }

  // Fallback: Application Default Credentials (works on GCP/Firebase App Hosting automatically)
  console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON not set — using Application Default Credentials.');
  return admin.initializeApp();
}

/** Firestore instance backed by the Admin SDK. */
export const adminDb = getAdminApp().firestore();
