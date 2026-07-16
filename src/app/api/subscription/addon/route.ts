import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-client';
import { assertNonAnonymous, verifyFirebaseToken, assertOwner } from '@/lib/api-auth';
import {
  EXTRA_TEAM_PRICE_IDS,
  PLAN_PRICE_MAP,
  PRICE_BILLING_CYCLE,
} from '@/lib/stripe-price-map';
import { isEntitledSubscriptionStatus } from '@/lib/server-team-entitlements';
import {
  enforceUserRateLimit,
  readJsonBodyWithLimit,
  RequestBodyError,
} from '@/lib/server-request-guards';
import { buildCheckoutIdempotencyKey } from '@/lib/checkout-policy';

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;
  const anonymousCheck = assertNonAnonymous(auth);
  if (anonymousCheck) return anonymousCheck;

  try {
    const { userId, quantity, operationId } = await readJsonBodyWithLimit<{
      userId?: unknown;
      quantity?: unknown;
      operationId?: unknown;
    }>(req, 16_000);

    if (
      typeof userId !== 'string' ||
      typeof quantity !== 'number' ||
      typeof operationId !== 'string' ||
      !/^[A-Za-z0-9_-]{16,100}$/.test(operationId)
    ) {
      return NextResponse.json(
        { error: 'userId, quantity, and a valid operationId are required.' },
        { status: 400 }
      );
    }

    // Validate quantity bounds
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 50) {
      return NextResponse.json({ error: 'quantity must be between 0 and 50.' }, { status: 400 });
    }

    const ownerCheck = assertOwner(auth, userId);
    if (ownerCheck) return ownerCheck;
    const rateLimit = await enforceUserRateLimit(
      auth.uid,
      'subscription-addon',
      10,
      60 * 60 * 1000
    );
    if (rateLimit) return rateLimit;

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (userSnap.data()?.isDemo === true) {
      return NextResponse.json({ error: 'Billing is unavailable in demo workspaces.' }, { status: 403 });
    }

    const subscriptionId = userSnap.data()!.stripe_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({
        error: 'No active subscription. You must be on a paid plan to add extra squads.',
      }, { status: 400 });
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!isEntitledSubscriptionStatus(subscription.status)) {
      return NextResponse.json(
        { error: 'The subscription is not active. Resolve billing before changing seats.' },
        { status: 409 }
      );
    }
    const basePlanItem = subscription.items.data.find(item => PLAN_PRICE_MAP[item.price.id]);
    const billingCycle = basePlanItem
      ? PRICE_BILLING_CYCLE[basePlanItem.price.id]
      : null;
    if (!billingCycle) {
      return NextResponse.json({ error: 'Could not determine the subscription billing cycle.' }, { status: 409 });
    }

    const targetAddonPriceId =
      billingCycle === 'annual' ? EXTRA_TEAM_PRICE_IDS.annual : EXTRA_TEAM_PRICE_IDS.monthly;

    // Check if add-on item already exists
    const addonItem = subscription.items.data.find(
      item =>
        item.price.id === EXTRA_TEAM_PRICE_IDS.monthly ||
        item.price.id === EXTRA_TEAM_PRICE_IDS.annual
    );

    const items: any[] = [];

    if (addonItem) {
      if (quantity === 0) {
        items.push({ id: addonItem.id, deleted: true });
      } else {
        items.push({ id: addonItem.id, price: targetAddonPriceId, quantity });
      }
    } else if (quantity > 0) {
      items.push({ price: targetAddonPriceId, quantity });
    }

    if (items.length === 0) {
      return NextResponse.json({ message: 'No changes needed.' });
    }

    const idempotencyKey = buildCheckoutIdempotencyKey({
      route: 'subscription-addon',
      userId,
      priceId: targetAddonPriceId,
      billingCycle,
      quantity,
      operationId,
      now: Date.now(),
    });
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items,
      proration_behavior: 'always_invoice',
      payment_behavior: 'pending_if_incomplete',
    }, {
      idempotencyKey,
    });

    if (updatedSubscription.pending_update) {
      return NextResponse.json(
        {
          pending: true,
          message: 'Payment confirmation is pending. Seats will update after Stripe confirms payment.',
        },
        { status: 202 }
      );
    }

    // Sync extra_teams count to Firestore
    await userRef.update({ extra_teams: quantity });

    return NextResponse.json({ success: true, subscription: updatedSubscription });
  } catch (err: any) {
    if (err instanceof RequestBodyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[subscription/addon] Error:', err.message);
    return NextResponse.json({ error: 'Unable to update extra squad seats.' }, { status: 500 });
  }
}
