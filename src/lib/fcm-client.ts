/**
 * FCM Client Utilities
 * Handles requesting push notification permission, getting the FCM token,
 * and storing it in Firestore under users/{uid}.fcmTokens (array).
 *
 * Usage: call initFCM(userId) after the user signs in.
 */

import { getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion, getFirestore } from 'firebase/firestore';

const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

/**
 * Request notification permission, get FCM token, store in Firestore.
 * Safe to call multiple times — only stores if token changed.
 * Returns the FCM token or null if permission denied / not supported.
 */
export async function initFCM(userId: string): Promise<string | null> {
  // Only works in browser, not in SSR
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window)) return null;
  if (!VAPID_KEY) {
    console.warn('[FCM] NEXT_PUBLIC_FCM_VAPID_KEY not set — push notifications disabled');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    const app = getApp();
    const messaging = getMessaging(app);

    // Register service worker for FCM
    const registration = await navigator.serviceWorker.register('/sw.js');

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Store token in Firestore (arrayUnion keeps multiple devices)
      const db = getFirestore(app);
      await updateDoc(doc(db, 'users', userId), {
        fcmTokens: arrayUnion(token),
      });
    }

    return token ?? null;
  } catch (err) {
    console.warn('[FCM] Init failed:', err);
    return null;
  }
}

/**
 * Listen for FCM messages received while app is in foreground.
 * Shows a toast-style notification since the service worker only handles
 * messages when the app is backgrounded.
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  callback: (payload: { title?: string; body?: string; url?: string }) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  try {
    const app = getApp();
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      const url = payload.fcmOptions?.link;
      callback({ title, body, url });
    });
  } catch {
    return () => {};
  }
}

/**
 * Helper: send a push notification to a list of FCM tokens via our /api/notify route.
 * Call this server-side or from an authenticated client action.
 */
export async function sendPushToTokens({
  tokens,
  title,
  body,
  url,
  idToken,
}: {
  tokens: string[];
  title: string;
  body: string;
  url?: string;
  idToken: string;
}) {
  if (!tokens.length) return;
  await fetch('/api/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ tokens, title, body, url }),
  });
}

/**
 * Helper: send a Resend email notification via /api/email/send.
 */
export async function sendEmailNotification({
  to,
  subject,
  html,
  idToken,
}: {
  to: string | string[];
  subject: string;
  html: string;
  idToken: string;
}) {
  await fetch('/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ to, subject, html }),
  });
}
