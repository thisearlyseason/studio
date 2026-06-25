import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeFirebase } from '@/firebase/core';
import { doc, updateDoc, collection, query, where, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { getStripe } from '@/lib/stripe-client';
import { PLAN_PRICE_MAP, EXTRA_TEAM_PRICE_IDS } from '@/lib/stripe-price-map';
import {
  ownerNewRegistrationEmail,
  ownerPaymentReceivedEmail,
  ownerCancellationEmail,
  ownerPaymentFailedEmail,
} from '@/lib/email-templates';
import { Resend } from 'resend';

// Webhook endpoint secret — must be set; no silent fallback
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/** Owner notification config — set these in .env.local / App Hosting secrets */
const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL;
const OWNER_FCM_TOKEN = process.env.OWNER_FCM_TOKEN; // optional — push to owner's device

/** Max body size: 512KB. Stripe events are typically <64KB. */
const MAX_BODY_SIZE = 512_000;

/**
 * Sends a push notification to the platform owner's device (fire-and-forget).
 * Requires OWNER_FCM_TOKEN env var. Silently skips if not configured.
 */
async function notifyOwnerPush(title: string, body: string, url?: string) {
  if (!OWNER_FCM_TOKEN) return;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studio-6850142148-fe343.web.app';
    await fetch(`${baseUrl}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_API_SECRET || '' },
      body: JSON.stringify({ tokens: [OWNER_FCM_TOKEN], title, body, url }),
    });
  } catch (err) {
    console.warn('[Webhook] Owner push notification failed (non-critical):', err);
  }
}

/**
 * Sends an email notification to the platform owner (fire-and-forget).
 * Requires OWNER_NOTIFICATION_EMAIL + RESEND_API_KEY env vars.
 */
async function notifyOwnerEmail(subject: string, html: string) {
  if (!OWNER_EMAIL) return;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'The Squad Pro Alerts <noreply@thesquad.pro>',
      to: [OWNER_EMAIL],
      subject,
      html,
    });
  } catch (err) {
    console.warn('[Webhook] Owner email notification failed (non-critical):', err);
  }
}

/**
 * Normalizes subscription data into Firestore user doc + audit log.
 * Called by all subscription lifecycle events.
 */
async function syncSubscriptionToFirestore(subscription: Stripe.Subscription) {
  const { firestore } = initializeFirebase();
  const customerId = subscription.customer as string;

  // 1. Identify User — prefer firebase_uid metadata, fall back to customer index
  let userId = subscription.metadata?.firebase_uid;

  if (!userId) {
    const usersSnap = await getDocs(
      query(collection(firestore, 'users'), where('stripe_customer_id', '==', customerId))
    );
    if (!usersSnap.empty) userId = usersSnap.docs[0].id;
  }

  if (!userId) {
    console.error(`[Webhook] Could not resolve userId for customer ${customerId}, sub ${subscription.id}`);
    return;
  }

  // 2. Map subscription items to plan + add-ons
  let planType = 'free';
  let baseLimit = 1;
  let extraTeams = 0;

  for (const item of subscription.items.data) {
    const priceId = item.price.id;
    const resolved = PLAN_PRICE_MAP[priceId];
    if (resolved) {
      planType = resolved.id;
      baseLimit = resolved.teamLimit;
    } else if (
      priceId === EXTRA_TEAM_PRICE_IDS.monthly ||
      priceId === EXTRA_TEAM_PRICE_IDS.annual
    ) {
      extraTeams += item.quantity || 0;
    } else {
      console.warn(`[Webhook] Unrecognized priceId: ${priceId} — add to stripe-price-map.ts`);
    }
  }

  const status = subscription.status;
  const isActive = status === 'active' || status === 'past_due' || status === 'trialing';
  const userRef = doc(firestore, 'users', userId);

  // 3. Update user plan data
  try {
    await updateDoc(userRef, {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      subscription_status: status,
      plan_type: isActive ? planType : 'free',
      team_limit: isActive ? baseLimit + extraTeams : 1,
      extra_teams: extraTeams,
      last_webhook_sync: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error(`[Webhook] Failed to update user doc ${userId}:`, err.message);
    if (err.code === 'not-found') return;
  }

  // 4. CASCADE: Update all teams owned by this user (chunked to stay under 500-op limit)
  try {
    const teamsSnap = await getDocs(
      query(collection(firestore, 'teams'), where('ownerUserId', '==', userId))
    );

    if (!teamsSnap.empty) {
      // Chunk into groups of 400 to stay well under Firestore's 500-op batch limit
      const CHUNK = 400;
      for (let i = 0; i < teamsSnap.docs.length; i += CHUNK) {
        const chunk = teamsSnap.docs.slice(i, i + CHUNK);
        const batch = writeBatch(firestore);
        chunk.forEach(teamDoc => {
          batch.update(teamDoc.ref, {
            planId: isActive ? planType : 'free',
            isPro: isActive && planType !== 'free',
            last_plan_sync: new Date().toISOString(),
          });
        });
        await batch.commit();
      }
    }
  } catch (cascadeErr: any) {
    console.error('[Webhook] Team cascade error:', cascadeErr.message);
  }

  // 5. Write secondary audit log (server-side only — Firestore rules block client writes)
  try {
    await setDoc(
      doc(firestore, 'subscriptions', subscription.id),
      {
        userId,
        customerId,
        status,
        planType,
        teamLimit: baseLimit + extraTeams,
        extraTeams,
        // current_period_end may be on subscription.items in newer Stripe API versions
        currentPeriodEnd: (() => {
          const ts = (subscription as any).current_period_end
            ?? subscription.items?.data?.[0]?.current_period_end;
          return ts ? new Date(ts * 1000).toISOString() : new Date().toISOString();
        })(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.error('[Webhook] Failed to write audit log:', err.message);
  }
}

export async function POST(req: NextRequest) {
  // Guard: reject oversized payloads before reading body
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  const body = await req.text();

  // Secondary size guard (content-length header can be spoofed)
  if (body.length > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  if (!endpointSecret) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET is not set. Cannot verify webhook signatures.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          // Propagate firebase_uid from session metadata if not on subscription
          if (!subscription.metadata?.firebase_uid && session.metadata?.firebase_uid) {
            subscription.metadata = {
              ...subscription.metadata,
              firebase_uid: session.metadata.firebase_uid,
            };
          }
          await syncSubscriptionToFirestore(subscription);

          // ── Owner notification: New Registration ──
          try {
            const customerEmail = typeof session.customer_details?.email === 'string' ? session.customer_details.email : 'unknown';
            const amountTotal = session.amount_total ?? 0;
            const currency = session.currency ?? 'usd';
            // Resolve plan name from subscription items
            let planName = 'Unknown Plan';
            let planId = 'unknown';
            for (const item of subscription.items.data) {
              const resolved = PLAN_PRICE_MAP[item.price.id];
              if (resolved) { planName = resolved.id; planId = resolved.id; break; }
            }
            const userId = subscription.metadata?.firebase_uid || 'unknown';
            const tplEmail = ownerNewRegistrationEmail({ planName, planId, customerEmail, userId, amount: amountTotal, interval: subscription.items.data[0]?.price?.recurring?.interval || 'month' });
            await Promise.all([
              notifyOwnerEmail(tplEmail.subject, tplEmail.html),
              notifyOwnerPush('🎉 New Registration', `${customerEmail} subscribed to ${planName}`, '/admin'),
            ]);
          } catch (notifyErr) {
            console.warn('[Webhook] Owner registration notification error (non-critical):', notifyErr);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToFirestore(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToFirestore(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToFirestore(subscription);

        // ── Owner notification: Cancellation ──
        try {
          const stripe = getStripe();
          const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
          const customerEmail = customer.email || 'unknown';
          let planName = 'Unknown Plan';
          for (const item of subscription.items.data) {
            const resolved = PLAN_PRICE_MAP[item.price.id];
            if (resolved) { planName = resolved.id; break; }
          }
          const cancelledAt = subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toLocaleString('en-US', { timeZoneName: 'short' })
            : new Date().toLocaleString('en-US', { timeZoneName: 'short' });
          const userId = subscription.metadata?.firebase_uid || 'unknown';
          const tplEmail = ownerCancellationEmail({ customerEmail, planName, userId, cancelledAt });
          await Promise.all([
            notifyOwnerEmail(tplEmail.subject, tplEmail.html),
            notifyOwnerPush('⚠️ Subscription Cancelled', `${customerEmail} cancelled ${planName}`, '/admin'),
          ]);
        } catch (notifyErr) {
          console.warn('[Webhook] Owner cancellation notification error (non-critical):', notifyErr);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubscriptionId =
          (invoice as any).subscription ||
          (invoice as any).parent?.subscription_details?.subscription;
        if (invoiceSubscriptionId) {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(invoiceSubscriptionId as string);
          await syncSubscriptionToFirestore(subscription);

          // ── Owner notification: Payment Received ──
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            const customerEmail = customer.email || 'unknown';
            let planName = 'Unknown Plan';
            for (const item of subscription.items.data) {
              const resolved = PLAN_PRICE_MAP[item.price.id];
              if (resolved) { planName = resolved.id; break; }
            }
            const amountPaid = (invoice as any).amount_paid ?? 0;
            const currency = (invoice as any).currency ?? 'usd';
            const invoiceId = invoice.id ?? 'unknown';
            const tplEmail = ownerPaymentReceivedEmail({ customerEmail, planName, amount: amountPaid, currency, invoiceId });
            await Promise.all([
              notifyOwnerEmail(tplEmail.subject, tplEmail.html),
              notifyOwnerPush('💰 Payment Received', `${customerEmail} — $${(amountPaid / 100).toFixed(2)} ${currency.toUpperCase()}`, '/admin'),
            ]);
          } catch (notifyErr) {
            console.warn('[Webhook] Owner payment notification error (non-critical):', notifyErr);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceSubscriptionId =
          (invoice as any).subscription ||
          (invoice as any).parent?.subscription_details?.subscription;
        if (invoiceSubscriptionId) {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(invoiceSubscriptionId as string);
          await syncSubscriptionToFirestore(subscription);

          // ── Owner notification: Payment Failed ──
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            const customerEmail = customer.email || 'unknown';
            let planName = 'Unknown Plan';
            for (const item of subscription.items.data) {
              const resolved = PLAN_PRICE_MAP[item.price.id];
              if (resolved) { planName = resolved.id; break; }
            }
            const amountDue = (invoice as any).amount_due ?? 0;
            const currency = (invoice as any).currency ?? 'usd';
            const failureReason = (invoice as any).last_finalization_error?.message;
            const tplEmail = ownerPaymentFailedEmail({ customerEmail, planName, amount: amountDue, currency, failureReason });
            await Promise.all([
              notifyOwnerEmail(tplEmail.subject, tplEmail.html),
              notifyOwnerPush('🚨 Payment Failed', `${customerEmail} — $${(amountDue / 100).toFixed(2)} ${currency.toUpperCase()}`, '/admin'),
            ]);
          } catch (notifyErr) {
            console.warn('[Webhook] Owner payment failed notification error (non-critical):', notifyErr);
          }
        }
        break;
      }

      default:
        // Intentionally unhandled — not an error
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Webhook] Processing error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
