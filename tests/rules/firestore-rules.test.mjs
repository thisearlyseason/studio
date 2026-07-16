import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

const projectId = 'demo-the-squad-rules-test';
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await Promise.all([
      setDoc(doc(db, 'users', 'owner'), { role: 'coach', name: 'Owner' }),
      setDoc(doc(db, 'users', 'member'), { role: 'parent', name: 'Member' }),
      setDoc(doc(db, 'users', 'outsider'), { role: 'coach', name: 'Outsider' }),
      setDoc(doc(db, 'teams', 'team-a'), {
        ownerUserId: 'owner',
        isPro: true,
        planId: 'team',
      }),
      setDoc(doc(db, 'teams', 'team-a', 'members', 'member'), {
        userId: 'member',
        ownerUserId: 'owner',
        teamId: 'team-a',
      }),
      setDoc(doc(db, 'teams', 'team-a', 'groupChats', 'chat-a'), {
        createdBy: 'owner',
        memberIds: ['owner', 'member'],
      }),
      setDoc(doc(db, 'players', 'private-player'), {
        userId: 'member',
        parentId: 'member',
        primaryTeamId: 'team-a',
        recruitingProfileEnabled: false,
      }),
      setDoc(doc(db, 'players', 'public-player'), {
        userId: 'member',
        parentId: 'member',
        primaryTeamId: 'team-a',
        recruitingProfileEnabled: true,
      }),
      setDoc(doc(db, 'leagues', 'league-a'), {
        creatorId: 'owner',
        memberUserIds: ['owner', 'member'],
      }),
      setDoc(doc(db, 'publicLeagueViews', 'league-a'), {
        schedule: [],
        roster: [],
      }),
      setDoc(doc(db, 'facilities', 'facility-a'), {
        clubId: 'owner',
        name: 'Private Venue',
      }),
      setDoc(doc(db, 'subscriptions', 'subscription-a'), {
        userId: 'owner',
        status: 'active',
      }),
    ]);
  });
});

after(async () => {
  await testEnv?.cleanup();
});

function authenticatedDb(uid, claims = {}) {
  return testEnv.authenticatedContext(uid, claims).firestore();
}

test('user profiles remain private and billing authority cannot be self-granted', async () => {
  const ownerDb = authenticatedDb('owner');
  const outsiderDb = authenticatedDb('outsider');

  await assertSucceeds(getDoc(doc(ownerDb, 'users', 'owner')));
  await assertFails(getDoc(doc(outsiderDb, 'users', 'owner')));
  await assertFails(setDoc(doc(outsiderDb, 'users', 'new-user'), {
    role: 'coach',
    plan_type: 'school',
    team_limit: 100,
  }));
});

test('browser team creation is free-only and tenant reads require membership', async () => {
  const ownerDb = authenticatedDb('owner');
  const memberDb = authenticatedDb('member');
  const outsiderDb = authenticatedDb('outsider');

  await assertSucceeds(getDoc(doc(ownerDb, 'teams', 'team-a')));
  await assertSucceeds(getDoc(doc(memberDb, 'teams', 'team-a')));
  await assertFails(getDoc(doc(outsiderDb, 'teams', 'team-a')));

  await assertSucceeds(setDoc(doc(outsiderDb, 'teams', 'free-team'), {
    ownerUserId: 'outsider',
    isPro: false,
    planId: 'free',
  }));
  await assertFails(setDoc(doc(outsiderDb, 'teams', 'forged-pro-team'), {
    ownerUserId: 'outsider',
    isPro: true,
    planId: 'team',
  }));
});

test('members cannot create or promote their own team membership', async () => {
  const memberDb = authenticatedDb('member');
  const ownerDb = authenticatedDb('owner');

  await assertFails(setDoc(doc(memberDb, 'teams', 'team-a', 'members', 'member'), {
    userId: 'member',
    role: 'Owner',
  }));
  await assertSucceeds(setDoc(doc(ownerDb, 'teams', 'team-a', 'members', 'member-2'), {
    userId: 'member-2',
    ownerUserId: 'owner',
    teamId: 'team-a',
  }));
});

test('team chat messages cannot impersonate another member', async () => {
  const memberDb = authenticatedDb('member');

  await assertSucceeds(setDoc(
    doc(memberDb, 'teams', 'team-a', 'groupChats', 'chat-a', 'messages', 'self-message'),
    { authorId: 'member', text: 'hello' },
  ));
  await assertFails(setDoc(
    doc(memberDb, 'teams', 'team-a', 'groupChats', 'chat-a', 'messages', 'forged-message'),
    { authorId: 'owner', text: 'forged' },
  ));
});

test('private players stay family-scoped while enabled scout profiles are public', async () => {
  const anonymousDb = testEnv.unauthenticatedContext().firestore();
  const memberDb = authenticatedDb('member');

  await assertFails(getDoc(doc(anonymousDb, 'players', 'private-player')));
  await assertSucceeds(getDoc(doc(anonymousDb, 'players', 'public-player')));
  await assertSucceeds(getDoc(doc(memberDb, 'players', 'private-player')));
});

test('leagues are visible only to organizers or registered members', async () => {
  const memberDb = authenticatedDb('member');
  const outsiderDb = authenticatedDb('outsider');

  await assertSucceeds(getDoc(doc(memberDb, 'leagues', 'league-a')));
  await assertFails(getDoc(doc(outsiderDb, 'leagues', 'league-a')));
  await assertFails(setDoc(doc(outsiderDb, 'leagues', 'forged-league'), {
    creatorId: 'outsider',
    memberUserIds: ['outsider', 'member'],
  }));
});

test('spectator projections allow direct links but cannot be enumerated', async () => {
  const anonymousDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(anonymousDb, 'publicLeagueViews', 'league-a')));
  await assertFails(getDocs(collection(anonymousDb, 'publicLeagueViews')));
});

test('facilities and subscriptions remain owner-scoped and server-controlled', async () => {
  const ownerDb = authenticatedDb('owner');
  const outsiderDb = authenticatedDb('outsider');

  await assertSucceeds(getDoc(doc(ownerDb, 'facilities', 'facility-a')));
  await assertFails(getDoc(doc(outsiderDb, 'facilities', 'facility-a')));
  await assertSucceeds(setDoc(
    doc(ownerDb, 'facilities', 'facility-a'),
    { clubId: 'owner', name: 'Updated Venue' },
  ));
  await assertFails(deleteDoc(doc(ownerDb, 'facilities', 'facility-a')));

  await assertSucceeds(getDoc(doc(ownerDb, 'subscriptions', 'subscription-a')));
  await assertFails(getDoc(doc(outsiderDb, 'subscriptions', 'subscription-a')));
  await assertFails(setDoc(doc(ownerDb, 'subscriptions', 'subscription-a'), {
    userId: 'owner',
    status: 'active',
  }));
});

test('league collection queries cannot discover other organizations', async () => {
  const memberDb = authenticatedDb('member');
  const outsiderDb = authenticatedDb('outsider');

  await assertSucceeds(getDocs(query(
    collection(memberDb, 'leagues'),
    where('memberUserIds', 'array-contains', 'member'),
  )));
  await assertFails(getDocs(collection(outsiderDb, 'leagues')));
});
