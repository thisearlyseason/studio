import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { welcomeEmail } from '@/lib/email-templates';
import { verifyFirebaseToken } from '@/lib/api-auth';

const FROM = 'The Squad Pro <noreply@thesquad.pro>';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY env var not set');
  return new Resend(apiKey);
}

/**
 * POST /api/email/welcome
 * Called from admin/page.tsx after successful beta user creation.
 * Requires a Firebase ID token with role === 'superadmin' claim in the Authorization header.
 *
 * Body: { name, email, password, planType }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify caller is authenticated and is a superadmin
    const authResult = await verifyFirebaseToken(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    if (authResult.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Superadmin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, planType } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { subject, html } = welcomeEmail({ name, email, password, planType });

    const { data, error } = await getResend().emails.send({
      from: FROM,
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend] Welcome email error:', error);
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
