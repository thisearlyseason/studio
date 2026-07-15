import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { verifyFirebaseToken } from '@/lib/api-auth';

/** Records one authenticated member vote without allowing clients to alter totals. */
export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { teamId, chatId, messageId, optionIdx } = await req.json();
    if (![teamId, chatId, messageId].every(value => typeof value === 'string') ||
      !Number.isInteger(optionIdx) || optionIdx < 0) {
      return NextResponse.json({ error: 'Invalid poll vote.' }, { status: 400 });
    }

    const teamRef = adminDb.collection('teams').doc(teamId);
    const memberRef = teamRef.collection('members').doc(auth.uid);
    const messageRef = teamRef.collection('groupChats').doc(chatId).collection('messages').doc(messageId);
    await adminDb.runTransaction(async (transaction) => {
      const [team, member, message] = await Promise.all([
        transaction.get(teamRef), transaction.get(memberRef), transaction.get(messageRef),
      ]);
      if (!team.exists || (!member.exists && team.data()?.ownerUserId !== auth.uid)) throw new Error('FORBIDDEN');
      if (!message.exists) throw new Error('NOT_FOUND');

      const poll = message.data()?.poll;
      if (!poll || poll.isClosed || !Array.isArray(poll.options) || optionIdx >= poll.options.length) {
        throw new Error('INVALID_POLL');
      }
      const voters = { ...(poll.voters || {}) };
      const previousVote = voters[auth.uid];
      if (previousVote === optionIdx) return;

      const options = poll.options.map((option: any, index: number) => ({
        ...option,
        votes: Math.max(0, Number(option.votes || 0) + (index === optionIdx ? 1 : index === previousVote ? -1 : 0)),
      }));
      voters[auth.uid] = optionIdx;
      transaction.update(messageRef, {
        poll: { ...poll, options, voters, totalVotes: previousVote === undefined ? Number(poll.totalVotes || 0) + 1 : Number(poll.totalVotes || 0) },
      });
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    const status = err.message === 'FORBIDDEN' ? 403 : err.message === 'NOT_FOUND' ? 404 : err.message === 'INVALID_POLL' ? 400 : 500;
    if (status === 500) console.error('[teams/chat/vote] Error:', err.message);
    return NextResponse.json({ error: status === 500 ? 'Unable to record your vote.' : 'This poll is unavailable.' }, { status });
  }
}
