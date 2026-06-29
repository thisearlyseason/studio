import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

/**
 * POST /api/demo/seed
 * Server-side demo team seeder. Uses Firebase Admin SDK so NO Firestore
 * security rule bypass (isDemo: true on client docs) is required.
 *
 * Body: { planId: string }
 * Auth: Bearer token required
 * Returns: { ok: true, teamId: string, planId: string }
 */
export async function POST(req: NextRequest) {
  // 1. Verify the caller is authenticated
  const authResult = await verifyFirebaseToken(req);
  if (authResult instanceof NextResponse) return authResult;
  const uid = authResult.uid;

  let planId: string;
  try {
    const body = await req.json();
    planId = body.planId;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const ALLOWED_PLANS = new Set([
    'starter_squad', 'squad_pro', 'elite_teams', 'school_demo',
    'player_demo', 'parent_demo', 'league_demo',
    'pro_demo', 'coach_demo', 'basic_demo',
  ]);

  if (!planId || !ALLOWED_PLANS.has(planId)) {
    return NextResponse.json({ error: `Invalid planId: ${planId}` }, { status: 400 });
  }

  // 2. Check if this user already has a demo team for this plan (prevent duplicate seeding)
  const existingQuery = await adminDb
    .collection('teams')
    .where('ownerUserId', '==', uid)
    .where('isDemo', '==', true)
    .where('planId', '==', planId)
    .limit(1)
    .get();

  if (!existingQuery.empty) {
    const existingTeam = existingQuery.docs[0];
    return NextResponse.json({
      ok: true,
      teamId: existingTeam.id,
      planId,
      alreadySeeded: true,
    });
  }

  // 3. Generate a stable demo team ID
  const teamId = `demo_${planId}_${uid.slice(0, 8)}_${Date.now()}`;
  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = adminDb.batch();

  // 4. Create the team document
  const teamRef = adminDb.collection('teams').doc(teamId);
  batch.set(teamRef, {
    id: teamId,
    name: getDemoTeamName(planId),
    sport: 'Soccer',
    planId: planId,
    plan_type: getPlanType(planId),
    isDemo: true,
    ownerUserId: uid,
    role: 'Admin',
    memberCount: 1,
    createdAt: now,
    updatedAt: now,
  });

  // 5. Add the user as team owner/Admin member
  const memberRef = teamRef.collection('members').doc(uid);
  batch.set(memberRef, {
    id: uid,
    userId: uid,
    teamId,
    name: 'Demo Coach',
    role: 'Admin',
    position: 'Head Coach',
    isDemo: true,
    joinedAt: now,
  });

  // 6. Create a plan stub so feature flags work
  const planRef = adminDb.collection('plans').doc(planId);
  batch.set(planRef, {
    id: planId,
    name: getDemoTeamName(planId),
    isDemo: true,
    features: getDemoFeatures(planId),
    teamLimit: getPlanTeamLimit(planId),
    createdAt: now,
  }, { merge: true });

  await batch.commit();

  return NextResponse.json({ ok: true, teamId, planId });
}

function getDemoTeamName(planId: string): string {
  const names: Record<string, string> = {
    starter_squad: 'Starter Demo Team',
    squad_pro: 'Pro Demo Squad',
    elite_teams: 'Elite Demo Club',
    school_demo: 'Demo High School',
    player_demo: 'Player Demo Team',
    parent_demo: 'Parent Demo Team',
    league_demo: 'Demo League',
    pro_demo: 'Pro Demo Team',
    coach_demo: 'Coach Demo Squad',
    basic_demo: 'Basic Demo Team',
  };
  return names[planId] ?? 'Demo Team';
}

function getPlanType(planId: string): string {
  if (planId.includes('school')) return 'school';
  if (planId.includes('elite')) return 'elite';
  if (planId.includes('league')) return 'league';
  if (planId.includes('player')) return 'player';
  if (planId.includes('parent')) return 'parent';
  if (planId.includes('pro')) return 'pro';
  return 'starter';
}

function getPlanTeamLimit(planId: string): number {
  if (planId.includes('elite')) return 8;
  if (planId.includes('school')) return 10;
  if (planId.includes('league')) return 18;
  return 1;
}

function getDemoFeatures(planId: string): string[] {
  const base = ['feed', 'roster', 'events', 'games', 'chats'];
  const pro = [...base, 'drills', 'practice', 'files', 'volunteers', 'fundraising', 'equipment', 'facilities', 'family', 'analytics'];
  if (planId === 'starter_squad') return base;
  return pro;
}
