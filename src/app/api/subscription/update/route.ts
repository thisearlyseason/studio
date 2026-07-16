import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-client';
import { verifyFirebaseToken, assertOwner } from '@/lib/api-auth';
import { EXTRA_TEAM_PRICE_IDS, PLAN_PRICE_MAP } from '@/lib/stripe-price-map';
import { isEntitledSubscriptionStatus } from '@/lib/server-team-entitlements';

export async function POST(req: NextRequest) {
  // Authenticate caller
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, newPriceId } = await req.json();

    if (!userId || !newPriceId) {
      return NextResponse.json({ error: 'userId and newPriceId are required' }, { status: 400 });
    }

    // Verify the caller owns this account
    const ownerCheck = assertOwner(auth, userId);
    if (ownerCheck) return ownerCheck;

    // Validate the priceId is a known plan
    const resolvedPlan = PLAN_PRICE_MAP[newPriceId];
    if (!resolvedPlan) {
      return NextResponse.json({ error: 'Invalid priceId: not a recognized plan.' }, { status: 400 });
    }

    const stripe = getStripe();

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const subscriptionId = userSnap.data()!.stripe_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found.' }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Find the current base plan item
    const basePlanItem = subscription.items.data.find(item =>
      PLAN_PRICE_MAP[item.price.id] != null
    );

    if (!basePlanItem) {
      return NextResponse.json({ error: 'Could not find base plan item in subscription.' }, { status: 400 });
    }

    // Update the subscription item to the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: basePlanItem.id, price: newPriceId }],
      proration_behavior: 'always_invoice',
    });

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
    console.error('[subscription/update] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
