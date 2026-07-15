import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { passwordResetEmail } from '@/lib/email-templates';

const FROM = 'The Squad Pro <noreply@thesquad.pro>';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY env var not set');
  return new Resend(apiKey);
}

/**
 * POST /api/email/reset-password
 * Public route — no auth required (user is not logged in).
 * Generates a Firebase password reset link server-side using the Admin SDK,
 * then sends a branded email via Resend instead of Firebase's default template.
 *
 * Body: { email }
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use Firebase Admin SDK to generate a password reset link
    // This avoids sending Firebase's ugly default email
    const admin = await getFirebaseAdmin();
    let resetLink: string;
    try {
      resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.thesquad.pro'}/login`,
      });
    } catch (adminErr: any) {
      // Firebase Admin throws different errors for non-existent users depending on version:
      // - adminErr.code === 'auth/user-not-found'
      // - adminErr.message contains 'INTERNAL ASSERT FAILED' (user doesn't exist in project)
      const isUserNotFound =
        adminErr.code === 'auth/user-not-found' ||
        adminErr.message?.includes('INTERNAL ASSERT FAILED') ||
        adminErr.message?.includes('user-not-found');
      if (isUserNotFound) {
        // Return success silently — prevents email enumeration attacks
        return NextResponse.json({ success: true });
      }
      throw adminErr;
    }

    const { subject, html } = passwordResetEmail({ email, resetLink });

    const { error } = await getResend().emails.send({
      from: FROM,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend] Password reset email error:', error);
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Reset Password] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Lazy-initialize Firebase Admin to avoid import errors in edge environments
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
