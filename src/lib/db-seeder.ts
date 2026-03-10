
'use client';

import { 
  Firestore, 
  doc, 
  collection, 
  getDocs, 
  writeBatch,
  query,
  where,
  deleteDoc,
  setDoc,
  updateDoc,
  addDoc,
  getDoc
} from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * Sanitizes objects for Firestore by removing undefined values recursively.
 * Ensures data integrity for all demo and initialization writes.
 */
const clean = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(v => clean(v));
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val !== undefined) {
        newObj[key] = clean(val);
      }
    });
    return newObj;
  }
  return obj ?? null;
};

/**
 * Centrally defines the subscription plans and features based on the new 4-tier model.
 */
export async function seedSubscriptionData(db: Firestore) {
  try {
    const plansSnapshot = await getDocs(collection(db, 'plans'));
    
    if (plansSnapshot.empty) {
      const batch = writeBatch(db);

      const plans = [
        {
          id: 'free', name: 'Free', description: 'Essential coordination for growing grassroots teams.',
          priceDisplay: '$0', annualPriceDisplay: '$0', billingCycle: '', isPublic: true, isContactOnly: false,
          billingType: 'free', proTeamLimit: 0
        },
        {
          id: 'squad_pro', name: 'Squad Pro', description: 'Full strategy engine for 1 professional squad.',
          priceDisplay: '$19.99', annualPriceDisplay: '$199', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', proTeamLimit: 1
        },
        {
          id: 'elite_teams', name: 'Elite Teams', description: 'Institutional coordination for up to 8 squads.',
          priceDisplay: '$99', annualPriceDisplay: '$999', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', proTeamLimit: 8
        },
        {
          id: 'elite_league', name: 'Elite League', description: 'The master hub for league and tournament operators.',
          priceDisplay: '$249', annualPriceDisplay: '$2499', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', proTeamLimit: 99999
        }
      ];

      plans.forEach((p) => {
        const ref = doc(db, 'plans', p.id);
        batch.set(ref, p);
      });

      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding subscription data:', error);
  }
}

/**
 * UNIFIED SEEDER: Reuses the same dataset for all demos, only changing dates and Elite status.
 */
export async function seedDemoData(db: Firestore, teamId: string, demoTier: string, userId: string) {
  const batch = writeBatch(db);
  const now = new Date();
  
  // Tier flags
  const isStarter = demoTier === 'starter_squad';
  const isEliteTournamentDemo = demoTier === 'tournament_pro';
  const isPro = !isStarter;

  // Unified Roster
  const names = [
    'Jordan Smith', 'Alex Rivera', 'Sam Taylor', 'Casey Morgan', 'Riley Jones', 
    'Morgan Lee', 'Taylor Quinn', 'Chris Brooks', 'Jamie Day', 'Robin Hood',
    'Sidney Vane', 'Blake Bell', 'Charlie Reed', 'Avery Hill', 'Parker Pen'
  ];
  
  for (let i = 0; i < 12; i++) {
    const mid = `demo_mem_${teamId}_${i}`;
    batch.set(doc(db, 'teams', teamId, 'members', mid), clean({
      id: mid, userId: `demo_user_${teamId}_${i}`, teamId, name: names[i] || `Teammate ${i+1}`, 
      role: 'Member', position: i === 0 ? 'Team Lead' : 'Player', jersey: (i + 10).toString(),
      avatar: `https://picsum.photos/seed/demo_v3_${i}_${teamId}/150/150`, 
      joinedAt: now.toISOString(), amountOwed: i > 8 ? 50 : 0, feesPaid: i <= 8, isDemo: true,
      waiverSigned: isPro, medicalClearance: isPro && i % 2 === 0
    }));
  }

  // Unified Tournament Hub (Regional Championship)
  const tid_tournament = `demo_tournament_${teamId}`;
  const day1Date = now; 
  const day3Date = new Date(now.getTime() + (86400000 * 3)); 

  const day1Str = day1Date.toISOString().split('T')[0];
  const day2Str = new Date(now.getTime() + 86400000).toISOString().split('T')[0];

  batch.set(doc(db, 'teams', teamId, 'events', tid_tournament), clean({
    id: tid_tournament, teamId, 
    title: 'Regional Season Championship', 
    eventType: 'tournament',
    date: day1Date.toISOString(),
    endDate: day3Date.toISOString(),
    startTime: '09:00 AM', location: 'Metropolitan Stadium', 
    description: 'The premier regional coordination event of the season.',
    isTournament: true,
    isTournamentPaid: isEliteTournamentDemo, 
    tournamentTeams: ['Westside Warriors', 'Eastside Elite', 'Northside Knights', 'Southside Strikers', 'Metro Stars', 'City Rangers'],
    tournamentGames: [
      { id: 'g1', team1: 'Westside Warriors', team2: 'Eastside Elite', score1: 4, score2: 2, date: day1Str, time: '10:00 AM', isCompleted: true, winnerId: 'Westside Warriors' },
      { id: 'g2', team1: 'Northside Knights', team2: 'Southside Strikers', score1: 1, score2: 1, date: day1Str, time: '12:00 PM', isCompleted: true },
      { id: 'g3', team1: 'Metro Stars', team2: 'City Rangers', score1: 0, score2: 0, date: day2Str, time: '09:00 AM', isCompleted: false }
    ],
    userRsvps: { [userId]: 'going' }, isDemo: true, createdAt: now.toISOString(), lastUpdated: now.toISOString()
  }));

  // Unified Standard Match
  const matchId = `demo_match_standard_${teamId}`;
  batch.set(doc(db, 'teams', teamId, 'events', matchId), clean({
    id: matchId, teamId, title: 'Season Match vs Wildcats',
    eventType: 'game',
    date: new Date(now.getTime() + 86400000).toISOString(), 
    startTime: '06:00 PM', location: 'Westside Community Field',
    description: 'Standard season match. Arrive 30 minutes early for warmups.',
    isTournament: false, isTournamentPaid: false, userRsvps: { [userId]: 'going' },
    isDemo: true, createdAt: now.toISOString(), lastUpdated: now.toISOString()
  }));

  // Unified Match Ledger (Recent results)
  const matches = [
    { opponent: 'Wildcats', result: 'Win', myScore: 4, opponentScore: 2, offsetDays: 2 },
    { opponent: 'Storm', result: 'Loss', myScore: 1, opponentScore: 3, offsetDays: 5 }
  ];
  matches.forEach((m, i) => {
    const gid = `demo_game_${teamId}_${i}`;
    batch.set(doc(db, 'teams', teamId, 'games', gid), clean({
      id: gid, teamId, opponent: m.opponent, result: m.result, myScore: m.myScore, opponentScore: m.opponentScore,
      date: new Date(now.getTime() - 86400000 * m.offsetDays).toISOString(),
      location: 'City Arena Central', notes: isPro ? 'Exceptional execution of the primary tactical play.' : '', isDemo: true, createdAt: now.toISOString()
    }));
  });

  // Unified Drills (only for Pro/Club)
  if (isPro) {
    const did = `demo_drill_${teamId}_1`;
    batch.set(doc(db, 'teams', teamId, 'drills', did), clean({
      id: did, teamId, title: 'Full Court Coordination Drill',
      description: 'Defensive coordination focusing on zone transitions and communication protocols.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://picsum.photos/seed/drill_v3/400/300',
      primaryMedia: 'video', createdAt: now.toISOString(), isDemo: true
    }));
  }

  // Unified Files (only for Pro/Club)
  if (isPro) {
    const fid = `demo_file_${teamId}_1`;
    batch.set(doc(db, 'teams', teamId, 'files', fid), clean({
      id: fid, teamId, name: 'Season Playbook Master.pdf', type: 'pdf', size: '2.4 MB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'Coach Sam', uploaderId: 'system', date: now.toISOString(), category: 'file', isDemo: true
    }));
  }

  // Unified Broadcast Post (only for Pro/Club)
  if (isPro) {
    const pid = `demo_post_${teamId}_1`;
    batch.set(doc(db, 'teams', teamId, 'feedPosts', pid), clean({
      id: pid, teamId, type: 'user', content: 'Huge win recently squad! Let’s keep this momentum for the Regional Championship.',
      author: { name: 'Coach Alex', avatar: 'https://picsum.photos/seed/coach_v3/100/100' }, authorId: 'demo_coach', 
      createdAt: now.toISOString(), likes: [userId], isDemo: true
    }));
  }

  // Unified Alerts
  const aid = `demo_alert_${teamId}_1`;
  batch.set(doc(db, 'teams', teamId, 'alerts', aid), clean({
    id: aid, teamId, title: 'Regional Championship Update',
    message: 'Review the updated tournament bracket. Pool play starts at 09:00 AM.',
    createdBy: 'system', createdAt: now.toISOString(), isDemo: true
  }));

  // Unified Chat
  const cid = `demo_chat_${teamId}`;
  batch.set(doc(db, 'teams', teamId, 'groupChats', cid), clean({
    id: cid, teamId, name: 'Tactical Command Hub', memberIds: [userId], createdBy: userId, 
    createdAt: now.toISOString(), lastMessage: 'Review the Regional Championship bracket before tomorrow.', unread: 0, isDemo: true
  }));

  try {
    await batch.commit();
  } catch (error: any) {
    throw error;
  }
}

export async function seedGuestDemoTeam(db: Firestore, userId: string, planId: string) {
  const timestamp = Date.now();
  const teamId = `demo_guest_${userId.slice(-4)}_${timestamp}`;
  
  const isPlayerDemo = planId === 'player_demo';
  const isParentDemo = planId === 'parent_demo';
  
  const actualPlanId = (isPlayerDemo || isParentDemo) ? 'squad_pro' : 
                       (planId === 'tournament_pro' ? 'squad_pro' : planId);
  
  const isPro = actualPlanId !== 'starter_squad';
  const teamType = isPro ? 'pro' : 'starter';
  const role = (isPlayerDemo || isParentDemo) ? 'Member' : 'Admin';
  const position = isPlayerDemo ? 'Player' : (isParentDemo ? 'Parent' : (planId === 'squad_organization' ? 'Club Manager' : 'Coach'));
  
  const userRole = isPlayerDemo ? 'adult_player' : (isParentDemo ? 'parent' : 'coach');
  const ownerId = (isPlayerDemo || isParentDemo) ? 'system_demo_admin' : userId;

  const teamName = planId === 'starter_squad' ? 'Guest Grassroots Stars' : 
                   planId === 'squad_pro' ? 'Guest Pro Elite' : 
                   planId === 'player_demo' ? 'Metro Elite Teammate Hub' :
                   planId === 'parent_demo' ? 'Academy Guardian Portal' :
                   planId === 'tournament_pro' ? 'Regional Tournament Hub' : 'Metro Academy Hub';
  
  const code = teamId.slice(-6).toUpperCase();
  const batch = writeBatch(db);
  const nowStr = new Date().toISOString();
  
  batch.set(doc(db, 'users', userId), clean({
    id: userId, 
    fullName: isPlayerDemo ? 'Guest Teammate' : (isParentDemo ? 'Guest Guardian' : 'Guest Coordinator'), 
    email: isPlayerDemo ? 'teammate@thesquad.pro' : (isParentDemo ? 'parent@thesquad.pro' : 'guest@thesquad.pro'),
    role: userRole,
    notificationsEnabled: true, 
    createdAt: nowStr, 
    isDemo: true, 
    avatarUrl: `https://picsum.photos/seed/${userId}/150/150`,
    subscriptionPlan: actualPlanId === 'starter_squad' ? 'free' : actualPlanId,
    subscriptionStatus: 'active',
    proTeamLimit: planId === 'squad_organization' ? 100 : (isPro ? 1 : 0),
    tournamentCredits: planId === 'tournament_pro' ? 1 : 0 
  }), { merge: true });

  batch.set(doc(db, 'teams', teamId), clean({
    id: teamId, teamName, teamCode: code, createdBy: ownerId, ownerUserId: ownerId,
    createdAt: nowStr,
    teamType, isPro, planId: actualPlanId, sport: 'Multi-Sport', isDemo: true,
    description: planId === 'squad_organization' ? 'Enterprise organization management demo.' : 'Professional coordination suite demo.',
    teamLogoUrl: '', heroImageUrl: ''
  }));
  
  batch.set(doc(db, 'users', userId, 'teamMemberships', teamId), clean({
    userId, teamId, teamName, teamCode: code, role, 
    teamType, isPro, planId: actualPlanId, isDemo: true, 
    joinedAt: nowStr, createdBy: ownerId, ownerUserId: ownerId,
    sport: 'Multi-Sport', teamLogoUrl: ''
  }));

  batch.set(doc(db, 'teams', teamId, 'members', userId), clean({
    id: userId, userId, teamId, name: isPlayerDemo ? 'Guest Teammate' : (isParentDemo ? 'Guest Guardian' : 'Guest Coordinator'), 
    role, position, jersey: isPlayerDemo ? '22' : 'HQ',
    avatar: `https://picsum.photos/seed/${userId}/150/150`, joinedAt: nowStr,
    phone: '(555) 000-9999', amountOwed: 0, feesPaid: true, isDemo: true
  }));

  try {
    await batch.commit();
    await seedDemoData(db, teamId, planId, userId);
    return teamId;
  } catch (error: any) {
    console.error("Demo seed error:", error);
    throw error;
  }
}
