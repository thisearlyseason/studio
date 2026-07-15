import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { verifyFirebaseToken } from '@/lib/api-auth';

/** Server-authorized team enrollment using an invite code. */
export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const { code, playerId } = await req.json();
    const inviteCode = typeof code === 'string' ? code.trim().toUpperCase() : '';
    if (!/^[A-Z0-9_-]{3,64}$/.test(inviteCode) || typeof playerId !== 'string' || !playerId) {
      return NextResponse.json({ error: 'A valid invite code and player are required.' }, { status: 400 });
    }
    const matches = await Promise.all(['inviteCode', 'teamCode', 'code'].map(field =>
      adminDb.collection('teams').where(field, '==', inviteCode).limit(1).get()
    ));
    const teams = [...new Map(matches.flatMap(match => match.docs).map(team => [team.id, team])).values()];
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
    console.error('[teams/join] Enrollment failed:', error);
    return NextResponse.json({ error: 'Unable to join this team.' }, { status: 500 });
  }
}
