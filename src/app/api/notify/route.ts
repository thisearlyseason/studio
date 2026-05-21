import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/api-auth';

/**
 * POST /api/notify
 * Server-side FCM push notification sender.
 * Uses Firebase Admin SDK with the service account stored in FIREBASE_SERVICE_ACCOUNT_JSON.
 *
 * Body: {
 *   tokens: string[]          // FCM registration tokens to target
 *   title: string             // notification title
 *   body: string              // notification body
 *   url?: string              // optional click-through URL
 *   imageUrl?: string         // optional icon/image URL
 * }
 *
 * OR: {
 *   topic: string             // FCM topic (e.g. 'team_abc123_all')
 *   title, body, url?, imageUrl?
 * }
 */
export async function POST(req: NextRequest) {
  const authResult = await verifyFirebaseToken(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { tokens, topic, title, body: msgBody, url, imageUrl } = body;

    if (!title || !msgBody) {
      return NextResponse.json({ error: 'title and body are required' }, { status: 400 });
    }
    if (!tokens?.length && !topic) {
      return NextResponse.json({ error: 'tokens[] or topic is required' }, { status: 400 });
    }

    const admin = await getFirebaseAdmin();
    const messaging = admin.messaging();

    const notification: any = { title, body: msgBody };
    if (imageUrl) notification.imageUrl = imageUrl;

    const webpush = {
      notification: {
        icon: '/favicon-192.png',
        badge: '/favicon-192.png',
        ...(url ? { click_action: url } : {}),
      },
      fcmOptions: url ? { link: url } : undefined,
    };

    let result;
    if (tokens?.length) {
      // Send to specific devices (up to 500 at a time per FCM limit)
      const chunks: string[][] = [];
      for (let i = 0; i < tokens.length; i += 500) {
        chunks.push(tokens.slice(i, i + 500));
      }
      const responses = await Promise.all(
        chunks.map(chunk =>
          messaging.sendEachForMulticast({ tokens: chunk, notification, webpush })
        )
      );
      const successCount = responses.reduce((sum, r) => sum + r.successCount, 0);
      const failureCount = responses.reduce((sum, r) => sum + r.failureCount, 0);
      result = { successCount, failureCount };
    } else {
      // Send to FCM topic
      const msgId = await messaging.send({ topic, notification, webpush });
      result = { messageId: msgId };
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('[FCM] Notify error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function getFirebaseAdmin() {
  const admin = await import('firebase-admin');
  if (!admin.apps.length) {
    const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountB64) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env var not set');
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountB64, 'base64').toString('utf8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
}
