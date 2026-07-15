import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-client';
import { verifyFirebaseToken } from '@/lib/api-auth';

/**
 * Payment Items API — manages payable items that coaches/organizers create for
 * their team (league fees, tournament fees, equipment charges, etc.).
 *
 * Hub Stripe Routing:
 *   - If the team's hub (schoolId or clubId) has stripeConnectMode === 'shared',
 *     payment items are created on the hub's stripe_connect_account_id with
 *     squad metadata attached so the hub admin can track origin.
 *   - If stripeConnectMode === 'per_squad' (or no hub), each squad uses their
 *     own connected account (stored on the user doc as stripe_connect_account_id).
 *   - Hub admins (isPrimaryClubAuthority) can also create items directly.
 *
 * Collections:
 *   teams/{teamId}/paymentItems/{itemId}
 */

const PAID_PLAN_TYPES = new Set(['team', 'elite', 'league', 'school', 'squad_pro', 'squad_pro_demo']);
const VALID_CATEGORIES = new Set(['league', 'tournament', 'equipment', 'other', 'donation', 'fundraising']);

async function assertProPlan(userId: string, isSuperAdmin: boolean): Promise<NextResponse | null> {
  const userSnap = await adminDb.collection('users').doc(userId).get();
  if (!userSnap.exists) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  const data = userSnap.data()!;
  if (!PAID_PLAN_TYPES.has(data.plan_type || '') && !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Online payments require a paid plan.' },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Resolves which Stripe connected account to use for a given team.
 *
 * Priority:
 * 1. If the team belongs to a hub with stripeConnectMode === 'shared' → use hub's account
 * 2. Otherwise → use the requesting user's personal connected account
 *
 * Returns: { connectAccountId, isHubAccount, hubTeamId, hubTeamName, squadName }
 */
async function resolveConnectAccount(
  teamId: string,
  userId: string
): Promise<{
  connectAccountId: string | null;
  isHubAccount: boolean;
  hubTeamId: string | null;
  hubTeamName: string | null;
  squadName: string | null;
}> {
  const teamSnap = await adminDb.collection('teams').doc(teamId).get();
  const teamData = teamSnap.data();
  const squadName = teamData?.name ?? null;

  // Check if this team is part of a hub
  const hubTeamId: string | null = teamData?.schoolId || teamData?.clubId || null;

  if (hubTeamId) {
    const hubSnap = await adminDb.collection('teams').doc(hubTeamId).get();
    const hubData = hubSnap.data();
    const stripeConnectMode: string = hubData?.stripeConnectMode || 'per_squad';

    if (stripeConnectMode === 'shared') {
      const hubAccountId: string | null = hubData?.stripeConnectAccountId || null;
      return {
        connectAccountId: hubAccountId,
        isHubAccount: true,
        hubTeamId,
        hubTeamName: hubData?.name ?? null,
        squadName,
      };
    }
  }

  // Per-squad or standalone: use the user's own connected account
  const userSnap = await adminDb.collection('users').doc(userId).get();
  const connectAccountId: string | null = userSnap.data()?.stripe_connect_account_id ?? null;
  return { connectAccountId, isHubAccount: false, hubTeamId, hubTeamName: null, squadName };
}

// ── POST — create a payment item ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, teamId, name, description, amountDollars, category, currency = 'usd' } = await req.json();

    if (!userId || !teamId || !name || !amountDollars || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, teamId, name, amountDollars, category.' },
        { status: 400 }
      );
    }

    if (auth.uid !== userId) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
    }

    const amountCents = Math.round(parseFloat(amountDollars) * 100);
    if (!isFinite(amountCents) || amountCents < 50) {
      return NextResponse.json({ error: 'Amount must be at least $0.50.' }, { status: 400 });
    }

    // Plan gate
    const planError = await assertProPlan(userId, auth.role === 'superadmin');
    if (planError) return planError;

    // Verify the user is the team owner OR a team admin member
    const teamSnap = await adminDb.collection('teams').doc(teamId).get();
    if (!teamSnap.exists) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });

    const isOwner = teamSnap.data()!.ownerUserId === userId;
    const memberSnap = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
    const isAdmin = memberSnap.exists && memberSnap.data()?.role === 'Admin';
    const isSuperAdmin = auth.role === 'superadmin';

    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: must be team owner or admin.' }, { status: 403 });
    }

    // Resolve which Stripe account to use (shared hub or per-squad)
    const { connectAccountId, isHubAccount, hubTeamName, squadName } = await resolveConnectAccount(teamId, userId);

    if (!connectAccountId) {
      const msg = isHubAccount
        ? 'No Stripe account connected to the hub. The Athletic Director or Club Admin must connect Stripe first.'
        : 'No Stripe account connected. Please connect Stripe first from the Finance tab.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const teamName = teamSnap.data()!.name || 'the team';
    const stripe = getStripe();

    // Build metadata — include squad info when routing through hub account
    const productMetadata: Record<string, string> = {
      firebase_team_id: teamId,
      firebase_user_id: userId,
      category,
    };
    if (isHubAccount && squadName) {
      productMetadata.squad_name = squadName;
      if (hubTeamName) productMetadata.hub_team_name = hubTeamName;
    }

    // 1. Create a Stripe Product on the resolved connected account
    const product = await stripe.products.create(
      {
        name: isHubAccount && squadName ? `${squadName} — ${name}` : name,
        description: description || undefined,
        metadata: productMetadata,
      },
      { stripeAccount: connectAccountId }
    );

    // 2. Create a Price for the product
    const price = await stripe.prices.create(
      {
        product: product.id,
        unit_amount: amountCents,
        currency: currency.toLowerCase(),
      },
      { stripeAccount: connectAccountId }
    );

    // 3. Create a Payment Link (reusable, shareable)
    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        after_completion: {
          type: 'hosted_confirmation',
          hosted_confirmation: {
            custom_message: `Thank you for your payment to ${teamName}!`,
          },
        },
        metadata: {
          firebase_team_id: teamId,
          firebase_user_id: userId,
          payment_item_category: category,
          ...(isHubAccount && squadName ? { squad_name: squadName } : {}),
        },
        invoice_creation: { enabled: true },
      },
      { stripeAccount: connectAccountId }
    );

    // 4. Persist to Firestore
    const now = new Date().toISOString();
    const itemRef = adminDb.collection('teams').doc(teamId).collection('paymentItems').doc();
    const item = {
      id: itemRef.id,
      teamId,
      name,
      description: description || '',
      amount: amountCents,
      currency: currency.toLowerCase(),
      category,
      stripeProductId: product.id,
      stripePriceId: price.id,
      stripePaymentLinkId: paymentLink.id,
      stripePaymentLinkUrl: paymentLink.url,
      stripeAccountId: connectAccountId,
      isHubAccount,
      ...(isHubAccount && squadName ? { squadName } : {}),
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      isActive: true,
    };
    await itemRef.set(item);

    return NextResponse.json({ item }, { status: 201 });
  } catch (err: any) {
    console.error('[stripe/payment-items POST] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── GET — list payment items for a team ───────────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) return NextResponse.json({ error: 'Missing teamId.' }, { status: 400 });

    const teamSnap = await adminDb.collection('teams').doc(teamId).get();
    if (!teamSnap.exists) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });

    const teamData = teamSnap.data()!;
    const isOwner = teamData.ownerUserId === auth.uid;
    const isDemo = teamData.isDemo === true;

    // Demo teams are publicly readable — skip the member check
    if (!isOwner && !isDemo) {
      const memberSnap = await adminDb
        .collection('teams').doc(teamId)
        .collection('members').doc(auth.uid)
        .get();
      const isSuperAdmin = auth.role === 'superadmin';
      const isMember = memberSnap.exists;

      if (!isMember && !isSuperAdmin) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
    }

    // Query with composite index (isActive + createdAt). Falls back to simple
    // query without orderBy if the index isn't built yet.
    let items: FirebaseFirestore.DocumentData[] = [];
    try {
      const itemsSnap = await adminDb
        .collection('teams').doc(teamId)
        .collection('paymentItems')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .get();
      items = itemsSnap.docs.map(d => d.data());
    } catch (indexErr: any) {
      if (indexErr.code === 9 || indexErr.message?.includes('index')) {
        // Index not yet built — fall back to unordered query
        console.warn('[stripe/payment-items GET] Index not ready, falling back:', indexErr.message?.slice(0, 120));
        const fallbackSnap = await adminDb
          .collection('teams').doc(teamId)
          .collection('paymentItems')
          .where('isActive', '==', true)
          .get();
        items = fallbackSnap.docs.map(d => d.data())
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      } else {
        throw indexErr;
      }
    }

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('[stripe/payment-items GET] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// ── DELETE — deactivate a payment item ───────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, teamId, itemId } = await req.json();

    if (!userId || !teamId || !itemId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (auth.uid !== userId) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    // Verify team ownership or admin
    const teamSnap = await adminDb.collection('teams').doc(teamId).get();
    if (!teamSnap.exists) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    const isOwner = teamSnap.data()!.ownerUserId === userId;
    const memberSnap = await adminDb.collection('teams').doc(teamId).collection('members').doc(userId).get();
    const isAdmin = memberSnap.exists && memberSnap.data()?.role === 'Admin';
    const isSuperAdmin = auth.role === 'superadmin';

    if (!isOwner && !isAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden: must be team owner or admin.' }, { status: 403 });
    }

    const itemRef = adminDb.collection('teams').doc(teamId).collection('paymentItems').doc(itemId);
    const itemSnap = await itemRef.get();
    if (!itemSnap.exists) return NextResponse.json({ error: 'Payment item not found.' }, { status: 404 });

    const itemData = itemSnap.data()!;
    // Use the stored stripe account id (could be hub or per-squad)
    const connectAccountId: string | null = itemData.stripeAccountId ?? null;

    // Deactivate the Stripe Payment Link (if we have a connected account)
    if (connectAccountId && itemData.stripePaymentLinkId) {
      try {
        const stripe = getStripe();
        await stripe.paymentLinks.update(
          itemData.stripePaymentLinkId,
          { active: false },
          { stripeAccount: connectAccountId }
        );
      } catch (stripeErr: any) {
        console.warn('[stripe/payment-items DELETE] Stripe deactivation warning:', stripeErr.message);
      }
    }

    await itemRef.update({ isActive: false, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[stripe/payment-items DELETE] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
