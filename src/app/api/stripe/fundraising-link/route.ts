import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getStripe } from '@/lib/stripe-client';
import { verifyFirebaseToken } from '@/lib/api-auth';
import { getTeamFinanceAccess } from '@/lib/server-team-entitlements';

/**
 * POST /api/stripe/fundraising-link
 *
 * Creates a Stripe Payment Link with a custom (donor-set) amount for a
 * fundraising campaign. Uses Stripe's `custom_unit_amount` feature so donors
 * can enter any amount they wish.
 *
 * The link is saved to the campaign doc:
 *   teams/{teamId}/fundraising/{campaignId}.stripePaymentLinkUrl
 *
 * Body: { userId, teamId, campaignId, campaignTitle, campaignDescription? }
 *
 * Returns: { paymentLinkUrl, paymentLinkId }
 */

async function resolveConnectAccount(teamId: string, userId: string): Promise<string | null> {
  const teamSnap = await adminDb.collection('teams').doc(teamId).get();
  const teamData = teamSnap.data();

  const hubTeamId: string | null = teamData?.schoolId || teamData?.clubId || null;
  if (hubTeamId) {
    const hubSnap = await adminDb.collection('teams').doc(hubTeamId).get();
    const hubData = hubSnap.data();
    if (hubData?.stripeConnectMode === 'shared' && hubData?.stripeConnectAccountId) {
      return hubData.stripeConnectAccountId;
    }
  }

  // Fall back to user's personal connected account
  const userSnap = await adminDb.collection('users').doc(userId).get();
  return userSnap.data()?.stripe_connect_account_id ?? null;
}

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, teamId, campaignId, campaignTitle, campaignDescription } = await req.json();

    if (!userId || !teamId || !campaignId || !campaignTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, teamId, campaignId, campaignTitle.' },
        { status: 400 }
      );
    }

    if (auth.uid !== userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const access = await getTeamFinanceAccess(
      userId,
      teamId,
      auth.role === 'superadmin',
      true
    );
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    // Verify the campaign exists
    const campaignRef = adminDb.collection('teams').doc(teamId).collection('fundraising').doc(campaignId);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    // Resolve Stripe account (hub shared or per-squad)
    const connectAccountId = await resolveConnectAccount(teamId, userId);
    if (!connectAccountId) {
      return NextResponse.json(
        { error: 'No Stripe account connected. Connect Stripe from the Finance tab first.' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const teamName = access.team?.name || 'the team';

    // 1. Create a Product for the fundraising campaign
    const product = await stripe.products.create(
      {
        name: campaignTitle,
        description: campaignDescription || `Fundraising campaign for ${teamName}`,
        metadata: {
          firebase_team_id: teamId,
          firebase_campaign_id: campaignId,
          firebase_user_id: userId,
          type: 'fundraising',
        },
      },
      { stripeAccount: connectAccountId }
    );

    // 2. Create a Price with custom_unit_amount (donor sets their own amount)
    const price = await stripe.prices.create(
      {
        product: product.id,
        currency: 'usd',
        custom_unit_amount: {
          enabled: true,
          minimum: 100,   // $1.00 minimum
          preset: 2500,   // $25.00 suggested default
        },
      },
      { stripeAccount: connectAccountId }
    );

    // 3. Create the Payment Link
    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        after_completion: {
          type: 'hosted_confirmation',
          hosted_confirmation: {
            custom_message: `Thank you for supporting ${teamName}! Your donation means a lot to us.`,
          },
        },
        metadata: {
          firebase_team_id: teamId,
          firebase_campaign_id: campaignId,
          payment_item_category: 'donation',
          type: 'fundraising',
        },
        invoice_creation: { enabled: true },
      },
      { stripeAccount: connectAccountId }
    );

    // 4. Save the payment link to the campaign document
    await campaignRef.update({
      stripePaymentLinkUrl: paymentLink.url,
      stripePaymentLinkId: paymentLink.id,
      stripeProductId: product.id,
      stripePriceId: price.id,
      stripeConnectAccountId: connectAccountId,
      stripeEnabled: true,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      paymentLinkUrl: paymentLink.url,
      paymentLinkId: paymentLink.id,
    }, { status: 201 });
  } catch (err: any) {
    console.error('[stripe/fundraising-link POST] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/stripe/fundraising-link
 * Deactivates the Payment Link for a fundraising campaign.
 * Body: { userId, teamId, campaignId }
 */
export async function DELETE(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, teamId, campaignId } = await req.json();

    if (!userId || !teamId || !campaignId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    if (auth.uid !== userId) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    const access = await getTeamFinanceAccess(
      userId,
      teamId,
      auth.role === 'superadmin',
      false
    );
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const campaignRef = adminDb.collection('teams').doc(teamId).collection('fundraising').doc(campaignId);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists) return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });

    const data = campaignSnap.data()!;
    if (data.stripePaymentLinkId && data.stripeConnectAccountId) {
      try {
        const stripe = getStripe();
        await stripe.paymentLinks.update(
          data.stripePaymentLinkId,
          { active: false },
          { stripeAccount: data.stripeConnectAccountId }
        );
      } catch (err: any) {
        console.warn('[stripe/fundraising-link DELETE] Stripe warning:', err.message);
      }
    }

    await campaignRef.update({
      stripeEnabled: false,
      stripePaymentLinkUrl: null,
      stripePaymentLinkId: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[stripe/fundraising-link DELETE] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
