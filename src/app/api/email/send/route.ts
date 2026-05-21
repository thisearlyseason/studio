import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyFirebaseToken } from '@/lib/api-auth';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'The Squad Pro <noreply@thesquad.pro>';

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * POST /api/email/send
 * Generic authenticated email sender. All template construction happens
 * on the client side or in a parent route; this is the delivery layer.
 *
 * Body: { to, subject, html, replyTo? }
 */
export async function POST(req: NextRequest) {
  const authResult = await verifyFirebaseToken(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body: SendEmailPayload = await req.json();
    const { to, subject, html, replyTo } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
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
