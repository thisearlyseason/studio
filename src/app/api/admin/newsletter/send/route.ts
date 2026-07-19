import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyFirebaseToken } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import {
  ensureNewsletterSegment,
  listNewsletterSubscribers,
  newsletterResendClient,
  syncNewsletterSubscribersToResend,
} from '@/lib/server-newsletter';
import {
  NewsletterBlock,
  NewsletterDraft,
  renderNewsletterHtml,
  renderNewsletterText,
  safeNewsletterUrl,
} from '@/lib/newsletter-content';
import {
  enforceUserRateLimit,
  readJsonBodyWithLimit,
  RequestBodyError,
} from '@/lib/server-request-guards';

const FROM = 'The Squad <noreply@thesquad.pro>';

function validBlock(value: unknown): value is NewsletterBlock {
  if (!value || typeof value !== 'object') return false;
  const block = value as Record<string, unknown>;
  if (typeof block.id !== 'string' || block.id.length > 100 || typeof block.type !== 'string') return false;
  if (block.type === 'divider') return true;
  if (block.type === 'heading' || block.type === 'paragraph') {
    return typeof block.text === 'string' && block.text.length <= 10_000;
  }
  if (block.type === 'image') {
    return typeof block.url === 'string' && Boolean(safeNewsletterUrl(block.url)) &&
      typeof block.alt === 'string' && block.alt.length <= 300 &&
      (block.caption === undefined || (typeof block.caption === 'string' && block.caption.length <= 500));
  }
  if (block.type === 'button') {
    return typeof block.label === 'string' && block.label.length <= 120 &&
      typeof block.url === 'string' && Boolean(safeNewsletterUrl(block.url));
  }
  return false;
}

export async function POST(request: NextRequest) {
  const auth = await verifyFirebaseToken(request);
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== 'superadmin') {
    return NextResponse.json({ error: 'Super Admin access is required.' }, { status: 403 });
  }

  try {
    const body = await readJsonBodyWithLimit<{
      campaignId?: unknown;
      subject?: unknown;
      previewText?: unknown;
      title?: unknown;
      blocks?: unknown;
    }>(request, 256_000);
    const campaignId = typeof body.campaignId === 'string' ? body.campaignId : '';
    const draft: NewsletterDraft = {
      subject: typeof body.subject === 'string' ? body.subject.trim() : '',
      previewText: typeof body.previewText === 'string' ? body.previewText.trim() : '',
      title: typeof body.title === 'string' ? body.title.trim() : '',
      blocks: Array.isArray(body.blocks) && body.blocks.every(validBlock) ? body.blocks : [],
    };

    if (!/^[a-zA-Z0-9_-]{8,100}$/.test(campaignId)) {
      return NextResponse.json({ error: 'A valid campaign ID is required.' }, { status: 400 });
    }
    if (!draft.subject || draft.subject.length > 200 || /[\r\n]/.test(draft.subject)) {
      return NextResponse.json({ error: 'Enter a valid subject line.' }, { status: 400 });
    }
    if (!draft.title || draft.title.length > 200 || draft.blocks.length < 1 || draft.blocks.length > 40) {
      return NextResponse.json({ error: 'A title and 1–40 valid content blocks are required.' }, { status: 400 });
    }
    if ((draft.previewText || '').length > 300) {
      return NextResponse.json({ error: 'Preview text is too long.' }, { status: 400 });
    }

    const rateLimit = await enforceUserRateLimit(auth.uid, 'newsletter-send', 10, 60 * 60 * 1000);
    if (rateLimit) return rateLimit;

    const campaignRef = adminDb.collection('newsletter_campaigns').doc(campaignId);
    const acquired = await adminDb.runTransaction(async transaction => {
      const existing = await transaction.get(campaignRef);
      if (existing.exists) return false;
      transaction.set(campaignRef, {
        ...draft,
        status: 'sending',
        createdBy: auth.uid,
        createdAt: FieldValue.serverTimestamp(),
      });
      return true;
    });
    if (!acquired) {
      return NextResponse.json({ error: 'This campaign has already been submitted.' }, { status: 409 });
    }

    try {
      await syncNewsletterSubscribersToResend();
      const subscribers = await listNewsletterSubscribers();
      const activeSubscribers = subscribers.filter(subscriber => subscriber.isActive);
      if (!activeSubscribers.length) throw new Error('There are no active newsletter subscribers.');

      const segmentId = await ensureNewsletterSegment();
      const html = renderNewsletterHtml(draft);
      const text = renderNewsletterText(draft);
      const response = await newsletterResendClient().broadcasts.create({
        segmentId,
        from: FROM,
        subject: draft.subject,
        previewText: draft.previewText,
        html,
        text,
        name: `${draft.subject} — ${new Date().toISOString().slice(0, 10)}`,
        send: true,
      });
      if (response.error || !response.data?.id) {
        throw new Error(response.error?.message || 'Resend did not create the broadcast.');
      }

      await campaignRef.set({
        status: 'sent',
        resendBroadcastId: response.data.id,
        recipientCount: activeSubscribers.length,
        sentAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return NextResponse.json({
        success: true,
        broadcastId: response.data.id,
        recipientCount: activeSubscribers.length,
      });
    } catch (error) {
      await campaignRef.set({
        status: 'failed',
        failureReason: error instanceof Error ? error.message.slice(0, 500) : 'Unknown delivery error',
        failedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      throw error;
    }
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[Newsletter Admin] Send failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to send newsletter.' }, { status: 500 });
  }
}
