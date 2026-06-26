import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-client';
import { verifyFirebaseToken, assertOwner } from '@/lib/api-auth';
import { EXTRA_TEAM_PRICE_IDS } from '@/lib/stripe-price-map';

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, quantity, billingCycle = 'monthly' } = await req.json();

    if (!userId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'userId and quantity are required.' }, { status: 400 });
    }

    // Validate quantity bounds
    if (quantity < 0 || quantity > 50) {
      return NextResponse.json({ error: 'quantity must be between 0 and 50.' }, { status: 400 });
    }

    const ownerCheck = assertOwner(auth, userId);
    if (ownerCheck) return ownerCheck;

    const stripe = getStripe();

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const subscriptionId = userSnap.data()!.stripe_subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({
        error: 'No active subscription. You must be on a paid plan to add extra squads.',
      }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

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
        items.push({ id: addonItem.id, quantity });
      }
    } else if (quantity > 0) {
      items.push({ price: targetAddonPriceId, quantity });
    }

    if (items.length === 0) {
      return NextResponse.json({ message: 'No changes needed.' });
    }

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items,
      proration_behavior: 'always_invoice',
    });

    // Sync extra_teams count to Firestore
    await userRef.update({ extra_teams: quantity });

    return NextResponse.json({ success: true, subscription: updatedSubscription });
  } catch (err: any) {
    console.error('[subscription/addon] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
