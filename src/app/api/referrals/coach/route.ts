import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminDb } from '@/lib/firebase-admin';
import { escapeHtml } from '@/lib/html-escape';
import {
  enforcePublicRateLimit,
  readJsonBodyWithLimit,
  RequestBodyError,
} from '@/lib/server-request-guards';

const SUBJECT = 'A Team Management Tool Worth Reviewing';
const FROM = 'The Squad Pro <noreply@thesquad.pro>';
const BASE_URL = 'https://www.thesquad.pro';

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');
  return new Resend(apiKey);
}

function referralText(coachName: string, parentName: string) {
  return `Hi ${coachName},

I came across The Squad, a Canadian sports management platform built for coaches, teams, leagues, tournaments, and parents.

The platform brings schedules, team updates, messages, videos, drills, playbooks, and other team resources into one organized place. It looks like a helpful way to reduce group chats, scattered emails, and missed information.

I thought it might be worth reviewing!

You can learn more at thesquad.pro.

Thanks for taking a look,

${parentName}`;
}

function referralHtml(coachName: string, parentName: string) {
  const safeCoachName = escapeHtml(coachName);
  const safeParentName = escapeHtml(parentName);
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${SUBJECT}</title>
      </head>
      <body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f4f4f5;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;">
              <tr><td style="height:8px;background:#d11c20;"></td></tr>
              <tr><td style="padding:38px 38px 12px;">
                <p style="margin:0 0 28px;font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#d11c20;">A parent referral from The Squad</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">Hi ${safeCoachName},</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">I came across <strong>The Squad</strong>, a Canadian sports management platform built for coaches, teams, leagues, tournaments, and parents.</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">The platform brings schedules, team updates, messages, videos, drills, playbooks, and other team resources into one organized place. It looks like a helpful way to reduce group chats, scattered emails, and missed information.</p>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.7;">I thought it might be worth reviewing!</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.7;">You can learn more at <a href="${BASE_URL}" style="color:#d11c20;font-weight:800;">thesquad.pro</a>.</p>
                <p style="margin:0;font-size:16px;line-height:1.7;">Thanks for taking a look,<br /><strong>${safeParentName}</strong></p>
              </td></tr>
              <tr><td style="padding:26px 38px 38px;">
                <a href="${BASE_URL}/for/coaches" style="display:inline-block;border-radius:999px;background:#d11c20;color:#ffffff;text-decoration:none;padding:15px 24px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Review The Squad for Coaches</a>
                <p style="margin:24px 0 0;border-top:1px solid #e4e4e7;padding-top:18px;font-size:11px;line-height:1.6;color:#71717a;">This one-time referral was submitted by ${safeParentName}. It did not create an account or subscribe this address to marketing email.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBodyWithLimit<Record<string, unknown>>(request, 8_000);
    const parentName = cleanText(body.parentName, 120);
    const coachName = cleanText(body.coachName, 120);
    const coachEmail = cleanText(body.coachEmail, 254).toLowerCase();
    const submissionId = cleanText(body.submissionId, 100);
    const website = cleanText(body.website, 200);

    // A filled honeypot receives a neutral response so bots cannot tune around it.
    if (website) return NextResponse.json({ success: true });

    if (!parentName || !coachName || !isEmail(coachEmail)) {
      return NextResponse.json(
        { error: 'Enter your name, your coach’s name, and a valid coach email address.' },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9-]{16,100}$/.test(submissionId)) {
      return NextResponse.json({ error: 'Invalid submission identifier.' }, { status: 400 });
    }

    const senderLimit = await enforcePublicRateLimit(
      request,
      'coach-referral-sender',
      5,
      60 * 60 * 1000
    );
    if (senderLimit) return senderLimit;

    const recipientLimit = await enforcePublicRateLimit(
      request,
      'coach-referral-recipient',
      2,
      24 * 60 * 60 * 1000,
      coachEmail
    );
    if (recipientLimit) return recipientLimit;

    const documentId = createHash('sha256')
      .update(`${coachEmail}:${submissionId}`)
      .digest('hex');
    const referralRef = adminDb.collection('parent_coach_referrals').doc(documentId);
    const now = Date.now();

    const reservation = await adminDb.runTransaction(async transaction => {
      const snapshot = await transaction.get(referralRef);
      const existing = snapshot.data();
      if (existing?.deliveryStatus === 'sent') return 'sent';
      if (
        existing?.deliveryStatus === 'pending' &&
        typeof existing.deliveryStartedAt === 'number' &&
        now - existing.deliveryStartedAt < 5 * 60 * 1000
      ) {
        return 'pending';
      }

      transaction.set(referralRef, {
        parentName,
        coachName,
        coachEmail,
        source: 'parent_referral_page',
        deliveryStatus: 'pending',
        deliveryStartedAt: now,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      }, { merge: true });
      return 'reserved';
    });

    if (reservation === 'sent') {
      return NextResponse.json({ success: true, duplicate: true });
    }
    if (reservation === 'pending') {
      return NextResponse.json(
        { error: 'This referral is already being sent. Please wait a moment.' },
        { status: 409 }
      );
    }

    try {
      const { data, error } = await resendClient().emails.send({
        from: FROM,
        to: coachEmail,
        subject: SUBJECT,
        html: referralHtml(coachName, parentName),
        text: referralText(coachName, parentName),
      });
      if (error) throw new Error(error.message || 'Resend rejected the referral email.');

      await referralRef.set({
        deliveryStatus: 'sent',
        resendEmailId: data?.id || null,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
    } catch (deliveryError) {
      await referralRef.set({
        deliveryStatus: 'failed',
        deliveryError: deliveryError instanceof Error ? deliveryError.message.slice(0, 500) : 'Unknown delivery error',
        updatedAt: new Date(),
      }, { merge: true });
      throw deliveryError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Coach Referral] Delivery failed:', error);
    return NextResponse.json(
      { error: 'Unable to send the referral right now. Please try again later.' },
      { status: 500 }
    );
  }
}
