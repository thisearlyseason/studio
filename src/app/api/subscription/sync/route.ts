import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-client';
import { verifyFirebaseToken, assertOwner } from '@/lib/api-auth';
import {
  PLAN_PRICE_MAP,
  EXTRA_TEAM_PRICE_IDS,
  PRICE_BILLING_CYCLE,
} from '@/lib/stripe-price-map';
import { isEntitledSubscriptionStatus } from '@/lib/server-team-entitlements';
import { reconcilePaidTeamSeats } from '@/lib/server-subscription-seats';

export async function POST(req: NextRequest) {
  // Authenticate caller
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    // Verify the caller owns this account
    const ownerCheck = assertOwner(auth, userId);
    if (ownerCheck) return ownerCheck;

    const stripe = getStripe();

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userData = userSnap.data()!;
    const customerId = userData.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json({ error: 'No Stripe customer associated with this account.' }, { status: 400 });
    }

    // List ALL subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    });

    const activeSub = subscriptions.data.find(subscription =>
      isEntitledSubscriptionStatus(subscription.status)
    );

    let planType = 'free';
    let baseTeamLimit = 0;
    let extraTeams = 0;
    let billingCycle: 'monthly' | 'annual' | null = null;

    if (activeSub) {
      for (const item of activeSub.items.data) {
        const resolved = PLAN_PRICE_MAP[item.price.id];
        if (resolved) {
          planType = resolved.id;
          baseTeamLimit = resolved.teamLimit;
          billingCycle = PRICE_BILLING_CYCLE[item.price.id] || null;
        } else if (
          item.price.id === EXTRA_TEAM_PRICE_IDS.monthly ||
          item.price.id === EXTRA_TEAM_PRICE_IDS.annual
        ) {
          extraTeams = item.quantity || 0;
        }
      }
    }
    const hasPaidEntitlement = Boolean(activeSub && planType !== 'free');
    const totalTeamLimit = hasPaidEntitlement ? baseTeamLimit + extraTeams : 0;
    const subscriptionStatus = activeSub?.status || 'inactive';

    // Keep only already-allocated squads within the current paid seat capacity.
    // Missing, canceled, incomplete, or unknown subscriptions revoke all seats.
    await reconcilePaidTeamSeats({
      userId,
      planType,
      entitled: hasPaidEntitlement,
      capacity: totalTeamLimit,
      userUpdates: {
        stripe_subscription_id: activeSub?.id || null,
        subscription_status: subscriptionStatus,
        billing_cycle: billingCycle,
        plan_type: hasPaidEntitlement ? planType : 'free',
        team_limit: totalTeamLimit,
        extra_teams: hasPaidEntitlement ? extraTeams : 0,
        last_webhook_sync: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: activeSub?.id || null,
      subscriptionStatus,
      planType: hasPaidEntitlement ? planType : 'free',
      teamLimit: totalTeamLimit,
    });
  } catch (err: any) {
    console.error('[subscription/sync] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
