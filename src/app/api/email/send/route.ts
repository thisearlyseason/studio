import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyFirebaseToken } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';

const FROM = 'The Squad Pro <noreply@thesquad.pro>';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY env var not set');
  return new Resend(apiKey);
}

export interface SendEmailPayload {
  teamId: string;
  recipientUserIds: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * POST /api/email/send
 * Generic authenticated email sender. All template construction happens
 * on the client side or in a parent route; this is the delivery layer.
 *
 * Body: { teamId, recipientUserIds, subject, html, replyTo? }
 */
export async function POST(req: NextRequest) {
  const authResult = await verifyFirebaseToken(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body: SendEmailPayload = await req.json();
    const { teamId, recipientUserIds, subject, html, replyTo } = body;

    if (!teamId || !Array.isArray(recipientUserIds) || !recipientUserIds.length || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (recipientUserIds.length > 500) {
      return NextResponse.json({ error: 'Too many recipients.' }, { status: 400 });
    }

    const teamSnap = await adminDb.collection('teams').doc(teamId).get();
    if (!teamSnap.exists || (authResult.role !== 'superadmin' && teamSnap.data()!.ownerUserId !== authResult.uid)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const uniqueRecipients = [...new Set(recipientUserIds.filter((id): id is string => typeof id === 'string'))];
    const memberSnaps = await Promise.all(uniqueRecipients.map(id =>
      adminDb.collection('teams').doc(teamId).collection('members').doc(id).get()
    ));
    if (memberSnaps.some(member => !member.exists)) {
      return NextResponse.json({ error: 'Recipients must be current team members.' }, { status: 403 });
    }
    const to = memberSnaps.flatMap(member => {
      const email = member.data()?.email;
      return typeof email === 'string' && email.includes('@') ? [email] : [];
    });
    if (!to.length) return NextResponse.json({ error: 'No recipient email addresses are available.' }, { status: 400 });

    const { data, error } = await getResend().emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error('[Resend] Send error:', error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
