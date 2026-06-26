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
    let serviceAccount: object | undefined;

    // Attempt 1: parse as-is (the happy path)
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (_) { /* fall through */ }

    // Attempt 2: base64-encoded JSON (some CI/CD systems encode it this way)
    if (!serviceAccount) {
      try {
        const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (_) { /* fall through */ }
    }

    // Attempt 3: Vercel sometimes converts \n escape sequences to literal newlines
    // inside the private_key value, breaking the outer JSON string. Re-escape them.
    if (!serviceAccount) {
      try {
        // Replace literal newlines ONLY inside what looks like the private_key value
        const reescaped = serviceAccountJson.replace(/\\n/g, '\\n').replace(/\n/g, '\\n');
        serviceAccount = JSON.parse(reescaped);
      } catch (_) { /* fall through */ }
    }

    if (!serviceAccount) {
      throw new Error(
        '[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON is set but could not be parsed. ' +
        'Please re-paste the raw contents of your serviceAccountKey.json file directly into ' +
        'the Vercel environment variable (do not base64-encode it or wrap it in extra quotes).'
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
