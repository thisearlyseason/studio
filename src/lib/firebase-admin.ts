/**
 * Firebase Admin SDK initializer — server-side only.
 *
 * Use this module in all API routes and server functions instead of the client
 * SDK (`firebase/firestore`). The Admin SDK uses standard HTTP rather than
 * gRPC/WebSockets and works correctly in serverless environments (Firebase App
 * Hosting, Vercel, etc.) where the client SDK's persistent connection fails
 * with "client is offline".
 *
 * Initialization is LAZY — the Admin app is only created on the first actual
 * API request, not at build/module-load time. This prevents build failures
 * caused by missing environment variables during the Vercel build phase.
 *
 * Initialization order:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON env var (full service-account JSON string)
 *   2. Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / GCP metadata)
 */
import * as admin from 'firebase-admin';

let _app: admin.app.App | null = null;
let _db: admin.firestore.Firestore | null = null;

function initAdminApp(): admin.app.App {
  if (_app) return _app;

  // Return existing app if already initialized by another module
  if (admin.apps.length > 0) {
    _app = admin.apps[0]!;
    return _app;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    let serviceAccount: object;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (e) {
      throw new Error(
        '[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON is set but contains invalid JSON. ' +
        'Ensure the value is a raw JSON string (not base64 encoded or double-stringified).'
      );
    }
    _app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } else {
    // Fallback: Application Default Credentials (works on GCP/Firebase App Hosting automatically)
    console.warn('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON not set — using Application Default Credentials.');
    _app = admin.initializeApp();
  }

  return _app;
}

function getDb(): admin.firestore.Firestore {
  if (_db) return _db;
  _db = initAdminApp().firestore();
  return _db;
}

/**
 * Lazily-initialized Firestore Admin instance.
 * Accessing any property on this object triggers initialization on first use,
 * not at module load / build time.
 */
export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop: PropertyKey) {
    const db = getDb();
    const value = (db as any)[prop];
    return typeof value === 'function' ? (value as Function).bind(db) : value;
  },
});
