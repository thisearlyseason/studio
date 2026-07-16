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
  // Authenticate caller
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;
  const anonymousCheck = assertNonAnonymous(auth);
  if (anonymousCheck) return anonymousCheck;

  try {
    const { userId, newPriceId, operationId } = await readJsonBodyWithLimit<{
      userId?: unknown;
      newPriceId?: unknown;
      operationId?: unknown;
    }>(req, 16_000);

    if (
      typeof userId !== 'string' ||
      typeof newPriceId !== 'string' ||
      typeof operationId !== 'string' ||
      !/^[A-Za-z0-9_-]{16,100}$/.test(operationId)
    ) {
      return NextResponse.json(
        { error: 'userId, newPriceId, and a valid operationId are required' },
        { status: 400 }
      );
    }

    // Verify the caller owns this account
    const ownerCheck = assertOwner(auth, userId);
    if (ownerCheck) return ownerCheck;
    const rateLimit = await enforceUserRateLimit(
      auth.uid,
      'subscription-update',
      10,
      60 * 60 * 1000
    );
    if (rateLimit) return rateLimit;

    // Validate the priceId is a known plan
    const resolvedPlan = PLAN_PRICE_MAP[newPriceId];
    if (!resolvedPlan) {
      return NextResponse.json({ error: 'Invalid priceId: not a recognized plan.' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (userSnap.data()?.isDemo === true) {
      return NextResponse.json({ error: 'Billing is unavailable in demo workspaces.' }, { status: 403 });
    }

    const subscriptionId = userSnap.data()!.stripe_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!isEntitledSubscriptionStatus(subscription.status)) {
      return NextResponse.json(
        { error: 'The subscription is not active. Resolve billing before changing plans.' },
        { status: 409 }
      );
    }

    // Find the current base plan item
    const basePlanItem = subscription.items.data.find(item =>
      PLAN_PRICE_MAP[item.price.id] != null
    );

    if (!basePlanItem) {
      return NextResponse.json({ error: 'Could not find base plan item in subscription.' }, { status: 400 });
    }

    const billingCycle = PRICE_BILLING_CYCLE[newPriceId];
    if (!billingCycle) {
      return NextResponse.json({ error: 'Could not determine the requested billing cycle.' }, { status: 400 });
    }
    const addonItem = subscription.items.data.find(item =>
      item.price.id === EXTRA_TEAM_PRICE_IDS.monthly ||
      item.price.id === EXTRA_TEAM_PRICE_IDS.annual
    );
    const items: any[] = [{ id: basePlanItem.id, price: newPriceId }];
    if (addonItem) {
      items.push({
        id: addonItem.id,
        price:
          billingCycle === 'annual'
            ? EXTRA_TEAM_PRICE_IDS.annual
            : EXTRA_TEAM_PRICE_IDS.monthly,
        quantity: addonItem.quantity || 0,
      });
    }
    const idempotencyKey = buildCheckoutIdempotencyKey({
      route: 'subscription-update',
      userId,
      priceId: newPriceId,
      billingCycle,
      quantity: addonItem?.quantity || 0,
      operationId,
      now: Date.now(),
    });

    // Update the base plan and keep add-on billing on the same interval.
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
          message: 'Payment confirmation is pending. The plan will update after Stripe confirms payment.',
        },
        { status: 202 }
      );
    }

    const isEntitled = isEntitledSubscriptionStatus(updatedSubscription.status);
    const extraTeams = updatedSubscription.items.data.reduce((total, item) => {
      if (
        item.price.id === EXTRA_TEAM_PRICE_IDS.monthly ||
        item.price.id === EXTRA_TEAM_PRICE_IDS.annual
      ) {
        return total + (item.quantity || 0);
      }
      return total;
    }, 0);
    const totalTeamLimit = isEntitled ? resolvedPlan.teamLimit + extraTeams : 0;

    // Stripe's returned status is authoritative. Failed or incomplete payment
    // never grants paid features while the invoice is unresolved.
    await userRef.update({
      plan_type: isEntitled ? resolvedPlan.id : 'free',
      team_limit: totalTeamLimit,
      extra_teams: isEntitled ? extraTeams : 0,
      subscription_status: updatedSubscription.status,
      billing_cycle: billingCycle,
      last_sync_method: 'direct_upgrade',
      last_webhook_sync: new Date().toISOString(),
    });

    // Keep the selected Pro teams aligned with the subscription tier without
    // granting Pro access to every team the account owns.
    try {
      const teamsSnap = await adminDb
        .collection('teams')
        .where('ownerUserId', '==', userId)
        .get();
      const allocatedTeams = teamsSnap.docs
        .filter(teamDoc => teamDoc.data().isPro === true)
        .sort((a, b) => a.id.localeCompare(b.id));
      if (allocatedTeams.length > 0) {
        const batch = adminDb.batch();
        allocatedTeams.forEach((teamDoc, index) => {
          const keepPaid = isEntitled && index < totalTeamLimit;
          batch.update(teamDoc.ref, {
            planId: keepPaid ? resolvedPlan.id : 'free',
            isPro: keepPaid,
            last_plan_sync: new Date().toISOString(),
          });
        });
        await batch.commit();
      }
    } catch (cascadeErr: any) {
      console.error('[subscription/update] Team cascade error:', cascadeErr.message);
    }

    return NextResponse.json({ success: true, subscription: updatedSubscription });
  } catch (err: any) {
    if (err instanceof RequestBodyError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[subscription/update] Error:', err.message);
    return NextResponse.json({ error: 'Unable to update the subscription.' }, { status: 500 });
  }
}
