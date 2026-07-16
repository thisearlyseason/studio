import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { verifyFirebaseToken } from '@/lib/api-auth';
import {
  enforceUserRateLimit,
  readJsonBodyWithLimit,
  RequestBodyError,
} from '@/lib/server-request-guards';

function normalizeInviteCode(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function isValidInviteCode(value: string): boolean {
  return /^[A-Z0-9_-]{3,64}$/.test(value);
}

async function findTeamByInviteCode(inviteCode: string) {
  const matches = await Promise.all(['inviteCode', 'teamCode', 'code'].map(field =>
    adminDb.collection('teams').where(field, '==', inviteCode).limit(1).get()
  ));
  return [
    ...new Map(
      matches.flatMap(match => match.docs).map(team => [team.id, team])
    ).values(),
  ];
}

/** Resolve the squad name carried by an authenticated recruitment link. */
export async function GET(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const rateLimit = await enforceUserRateLimit(
      auth.uid,
      'team-invite-preview',
      30,
      5 * 60 * 1000
    );
    if (rateLimit) return rateLimit;

    const inviteCode = normalizeInviteCode(req.nextUrl.searchParams.get('code'));
    if (!isValidInviteCode(inviteCode)) {
      return NextResponse.json({ error: 'A valid invite code is required.' }, { status: 400 });
    }
    const teams = await findTeamByInviteCode(inviteCode);
    if (teams.length !== 1) {
      return NextResponse.json(
        { error: teams.length ? 'Invite code is ambiguous.' : 'Invite code not found.' },
        { status: 404 }
      );
    }
    const team = teams[0].data();
    return NextResponse.json({
      teamId: teams[0].id,
      teamName: team.name || team.teamName || 'Squad',
    });
  } catch (error) {
    console.error('[teams/join] Invite lookup failed:', error);
    return NextResponse.json({ error: 'Unable to verify this recruitment link.' }, { status: 500 });
  }
}

/** Server-authorized team enrollment using an invite code. */
export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const rateLimit = await enforceUserRateLimit(
      auth.uid,
      'team-invite-join',
      10,
      10 * 60 * 1000
    );
    if (rateLimit) return rateLimit;

    const { code, playerId } = await readJsonBodyWithLimit<{
      code?: unknown;
      playerId?: unknown;
    }>(req, 8_000);
    const inviteCode = normalizeInviteCode(code);
    if (
      !isValidInviteCode(inviteCode) ||
      typeof playerId !== 'string' ||
      !/^[A-Za-z0-9_-]{1,200}$/.test(playerId)
    ) {
      return NextResponse.json({ error: 'A valid invite code and player are required.' }, { status: 400 });
    }
    const teams = await findTeamByInviteCode(inviteCode);
    if (teams.length !== 1) return NextResponse.json({ error: teams.length ? 'Invite code is ambiguous.' : 'Invite code not found.' }, { status: 404 });

    const playerRef = adminDb.collection('players').doc(playerId);
    const [playerSnap, userSnap] = await Promise.all([playerRef.get(), adminDb.collection('users').doc(auth.uid).get()]);
    if (!playerSnap.exists) return NextResponse.json({ error: 'Player not found.' }, { status: 404 });
    const player = playerSnap.data()!;
    if (player.userId !== auth.uid && player.parentId !== auth.uid) {
      return NextResponse.json({ error: 'You may only enroll yourself or your own child.' }, { status: 403 });
    }

    const teamDoc = teams[0];
    const team = teamDoc.data();
    const memberId = playerId.startsWith('p_') ? auth.uid : playerId;
    const name = playerId.startsWith('p_')
      ? (userSnap.data()?.fullName || userSnap.data()?.name || 'Member')
      : [player.firstName, player.lastName].filter(Boolean).join(' ') || 'Player';
    const now = new Date().toISOString();
    const batch = adminDb.batch();
    batch.set(adminDb.collection('users').doc(auth.uid).collection('teamMemberships').doc(`${teamDoc.id}_${memberId}`), {
      teamId: teamDoc.id, playerId: memberId, name: team.name || team.teamName || '', role: 'Member', code: inviteCode, joinedAt: now,
    }, { merge: true });
    batch.set(teamDoc.ref.collection('members').doc(memberId), {
      id: memberId, userId: auth.uid, playerId, parentId: player.parentId || auth.uid, name,
      role: 'Member', position: 'Player', joinedAt: now, avatar: player.photoURL || userSnap.data()?.avatarUrl || '',
      ownerUserId: team.ownerUserId || '', teamId: teamDoc.id, schoolId: team.schoolId || null,
      email: userSnap.data()?.email || auth.email || null, parentEmail: player.parentId ? (auth.email || null) : null,
    }, { merge: true });
    batch.update(playerRef, { primaryTeamId: teamDoc.id, joinedTeamIds: FieldValue.arrayUnion(teamDoc.id) });
    await batch.commit();
    return NextResponse.json({ teamId: teamDoc.id });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[teams/join] Enrollment failed:', error);
    return NextResponse.json({ error: 'Unable to join this team.' }, { status: 500 });
  }
}
