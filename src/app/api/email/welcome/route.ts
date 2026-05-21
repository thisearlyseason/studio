import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { welcomeEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'The Squad Pro <noreply@thesquad.pro>';

/**
 * POST /api/email/welcome
 * Called server-side from admin/page.tsx after successful beta user creation.
 * This route does NOT require a user token — it is called from the admin panel
 * which is already protected by isSuperAdmin. We verify a shared secret instead.
 *
 * Body: { adminSecret, name, email, password, planType }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminSecret, name, email, password, planType } = body;

    // Verify the admin secret matches the env var
    if (!adminSecret || adminSecret !== process.env.ADMIN_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { subject, html } = welcomeEmail({ name, email, password, planType });

    const { data, error } = await resend.emails.send({
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
