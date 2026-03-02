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
  updateDoc
} from 'firebase/firestore';

/**
 * Seeds the Firestore database with default plans and features if they don't exist.
 */
export async function seedSubscriptionData(db: Firestore) {
  try {
    // 1. Seed Features if missing
    const featuresSnapshot = await getDocs(collection(db, 'features'));
    if (featuresSnapshot.empty) {
      const batch = writeBatch(db);
      
      const defaultFeatures = [
        { id: 'schedule_games_events', description: 'Plan and coordinate team matches and events.', defaultEnabled: true },
        { id: 'tournaments', description: 'Manage multi-day tournament series and brackets.', defaultEnabled: false },
        { id: 'basic_roster', description: 'Manage a basic list of team members.', defaultEnabled: true },
        { id: 'full_roster_details', description: 'Track medical info, emergency contacts, and coaching notes.', defaultEnabled: false },
        { id: 'attendance_tracking', description: 'Track RSVPs and real-time attendance for events.', defaultEnabled: false },
        { id: 'live_feed_read', description: 'View the squad activity feed.', defaultEnabled: true },
        { id: 'live_feed_post', description: 'Post updates, photos, and polls to the squad.', defaultEnabled: false },
        { id: 'group_chat', description: 'Real-time messaging channels for coordination.', defaultEnabled: false },
        { id: 'score_tracking', description: 'Record game results and season progress.', defaultEnabled: false },
        { id: 'stats_basic', description: 'Basic performance metrics and trends.', defaultEnabled: false },
        { id: 'media_uploads', description: 'Upload and share playbooks, photos, and files.', defaultEnabled: false },
        { id: 'history_unlimited', description: 'Retain full history of posts, chats, and results.', defaultEnabled: false },
        { id: 'high_priority_alerts', description: 'Broadcast urgent team-wide popups.', defaultEnabled: false },
        { id: 'multi_team_admin_dashboard', description: 'Centralized dashboard for multi-team owners.', defaultEnabled: false },
        { id: 'cross_team_announcements', description: 'Broadcast alerts to multiple squads at once.', defaultEnabled: false },
        { id: 'priority_support', description: 'Direct access to support specialists.', defaultEnabled: false },
        { id: 'early_feature_access', description: 'Access new tools before public release.', defaultEnabled: false },
        { id: 'custom_permissions', description: 'Define custom access levels for staff.', defaultEnabled: false },
      ];

      defaultFeatures.forEach((f) => {
        const ref = doc(db, 'features', f.id);
        batch.set(ref, { id: f.id, description: f.description, defaultEnabled: f.defaultEnabled });
      });

      await batch.commit();
    }

    // 2. Authoritative Plan Catalog
    const plansSnapshot = await getDocs(collection(db, 'plans'));
    
    if (plansSnapshot.empty) {
      const batch = writeBatch(db);

      const proFeaturesMap = {
        schedule_games_events: true, tournaments: true, basic_roster: true, full_roster_details: true,
        attendance_tracking: true, live_feed_read: true, live_feed_post: true, group_chat: true,
        score_tracking: true, stats_basic: true, media_uploads: true, history_unlimited: true,
        high_priority_alerts: true
      };

      const starterFeatures = {
        schedule_games_events: true, basic_roster: true, live_feed_read: true
      };

      const plans = [
        {
          id: 'starter_squad', name: 'Starter Squad', description: 'Essential coordination for unlimited teams.',
          priceDisplay: 'Free', billingCycle: '', isPublic: true, isContactOnly: false,
          billingType: 'free', teamLimit: null, features: starterFeatures, proTeamLimit: 0
        },
        {
          id: 'squad_pro', name: 'Elite Solo', description: 'Pro features for a single competitive team.',
          priceDisplay: '$12.99', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', teamLimit: 1, features: proFeaturesMap, proTeamLimit: 1
        },
        {
          id: 'squad_duo', name: 'Dynamic Duo', description: 'Power up two elite squads.',
          priceDisplay: '$23.99', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', teamLimit: 2, features: proFeaturesMap, proTeamLimit: 2
        },
        {
          id: 'squad_crew', name: 'The Crew', description: 'Coordination suite for up to 4 teams.',
          priceDisplay: '$44.99', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', teamLimit: 4, features: proFeaturesMap, proTeamLimit: 4
        },
        {
          id: 'squad_league', name: 'League Master', description: 'Full-scale coordination for 9 squads.',
          priceDisplay: '$89.99', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', teamLimit: 9, features: proFeaturesMap, proTeamLimit: 9
        },
        {
          id: 'squad_division', name: 'Division Lead', description: 'Elite oversight for 12 squads.',
          priceDisplay: '$119.99', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', teamLimit: 12, features: proFeaturesMap, proTeamLimit: 12
        },
        {
          id: 'squad_conference', name: 'Conference Pro', description: 'Master infrastructure for 15 teams.',
          priceDisplay: '$149.99', billingCycle: '/mo', isPublic: true, isContactOnly: false,
          billingType: 'monthly', teamLimit: 15, features: proFeaturesMap, proTeamLimit: 15
        },
        {
          id: 'squad_organization', name: 'Organization', description: 'Custom enterprise-grade infrastructure for large clubs.',
          priceDisplay: 'Custom', billingCycle: '', isPublic: true, isContactOnly: true,
          billingType: 'manual', teamLimit: null, features: proFeaturesMap, proTeamLimit: 15
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
 * Seeds realistic demo data for a team roster and sub-collections.
 */
export async function seedDemoData(db: Firestore, teamId: string, planId: string, userId: string) {
  console.log(`[Seeder] Seeding unique sub-collections for team ${teamId} (${planId})`);
  const batch = writeBatch(db);
  const now = new Date();
  const isStarter = planId === 'starter_squad';
  const isPro = !isStarter;

  // 1. Unique Team Identity Logic
  const teamType = teamId.includes('sub') ? 'sub' : (teamId.includes('pro') ? 'pro' : 'base');
  const teamSuffix = teamId.slice(-1);

  // 2. Setup Team Roster
  const count = isStarter ? 10 : 15;
  const names = [
    'Jordan Smith', 'Alex Rivera', 'Sam Taylor', 'Casey Morgan', 'Riley Jones', 
    'Morgan Lee', 'Taylor Quinn', 'Chris Brooks', 'Jamie Day', 'Robin Hood',
    'Sidney Vane', 'Blake Bell', 'Charlie Reed', 'Avery Hill', 'Parker Pen'
  ];
  
  for (let i = 0; i < count; i++) {
    const mid = `demo_mem_${teamId}_${i}`;
    batch.set(doc(db, 'teams', teamId, 'members', mid), {
      id: mid, userId: `demo_user_${teamId}_${i}`, teamId, name: names[i] || `Teammate ${i+1}`, 
      role: 'Member', position: 'Player', jersey: (i + 10).toString(),
      avatar: `https://picsum.photos/seed/demo_${i}_${teamId}/150/150`, 
      joinedAt: now.toISOString(), amountOwed: 0, feesPaid: true, isDemo: true
    });
  }

  // 3. Setup Events (Unique per team)
  const eventTitles = teamType === 'sub' 
    ? [`U${teamSuffix} Regional Qualifier`, 'Strategy Session', 'Team Dinner']
    : ['Championship Match', 'Practice Session', 'Recovery Day'];

  eventTitles.forEach((title, i) => {
    const eid = `demo_evt_${teamId}_${i}`;
    batch.set(doc(db, 'teams', teamId, 'events', eid), {
      id: eid, teamId, title, date: new Date(now.getTime() + 86400000 * (i + 1)).toISOString(),
      startTime: '10:00 AM', location: 'Team Grounds', description: 'Arrive 15 mins early.',
      userRsvps: { [userId]: 'going' }, isDemo: true, createdAt: now.toISOString()
    });
  });

  // 4. Setup Drills (Only for Pro/Club)
  if (isPro) {
    const drills = teamType === 'sub' && teamSuffix === '1'
      ? [{ title: 'Fundamental Dribbling', desc: 'Control the ball with eyes up.' }, { title: 'Passing Triangle', desc: 'Short, sharp passes.' }]
      : [{ title: 'Full Court Press', desc: 'Aggressive defensive setup.' }, { title: 'Set Piece Tactics', desc: 'Corner and free kick routines.' }];

    drills.forEach((d, i) => {
      const did = `demo_drill_${teamId}_${i}`;
      batch.set(doc(db, 'teams', teamId, 'drills', did), {
        ...d, id: did, teamId, createdBy: userId, createdAt: now.toISOString(), 
        thumbnailUrl: `https://picsum.photos/seed/drill_${teamId}_${i}/400/300`, isDemo: true
      });
    });
  }

  // 5. Setup Games (Unique results per team)
  if (isPro) {
    const games = [
      { opponent: 'North City', result: 'Win', myScore: 3, opponentScore: 1 },
      { opponent: 'Valley United', result: 'Loss', myScore: 0, opponentScore: 2 }
    ];
    games.forEach((g, i) => {
      const gid = `demo_game_${teamId}_${i}`;
      batch.set(doc(db, 'teams', teamId, 'games', gid), {
        ...g, id: gid, teamId, date: new Date(now.getTime() - 86400000 * (i + 2)).toISOString(),
        location: 'Neutral Venue', notes: 'Solid performance.', isDemo: true, createdAt: now.toISOString()
      });
    });
  }

  // 6. Setup Chat & Messages
  if (isPro) {
    const cid = `demo_chat_${teamId}`;
    const chatName = teamType === 'sub' ? `Team ${teamSuffix} Strategy` : 'Main Tactical Hub';
    batch.set(doc(db, 'teams', teamId, 'groupChats', cid), {
      id: cid, teamId, name: chatName, memberIds: [userId], createdBy: userId, 
      createdAt: now.toISOString(), lastMessage: 'See you at the match!', unread: 0, isDemo: true
    });

    const messages = [
      { content: 'Welcome to the tactical channel.', author: 'Guest Coordinator' },
      { content: 'Check out the new drills in the library.', author: 'Guest Coordinator' },
      { content: 'See you at the match!', author: 'Guest Coordinator' }
    ];

    messages.forEach((m, i) => {
      const mid = `demo_msg_${teamId}_${i}`;
      batch.set(doc(db, 'teams', teamId, 'groupChats', cid, 'messages', mid), {
        ...m, id: mid, authorId: userId, type: 'text', createdAt: new Date(now.getTime() + (i * 1000)).toISOString()
      });
    });
  }

  await batch.commit();
}

/**
 * Creates a fresh demo team for a guest user session.
 */
export async function seedGuestDemoTeam(db: Firestore, userId: string, planId: string) {
  console.log(`[Seeder] Creating unique guest demo session for user ${userId} (${planId})`);
  const timestamp = Date.now();
  const teamId = `demo_guest_${userId.slice(-4)}_${timestamp}`;
  const teamName = planId === 'starter_squad' ? 'Guest Grassroots Stars' : 
                   planId === 'squad_pro' ? 'Guest Pro Varsity' : 'City Central Academy (Club)';
  
  const code = teamId.slice(-6).toUpperCase();
  const isPro = planId !== 'starter_squad';
  const batch = writeBatch(db);
  
  // 1. User Profile
  batch.set(doc(db, 'users', userId), {
    id: userId, fullName: 'Guest Coordinator', email: 'guest@thesquad.io',
    notificationsEnabled: true, createdAt: new Date().toISOString(),
    isDemo: true, avatarUrl: `https://picsum.photos/seed/${userId}/150/150`,
    activePlanId: planId, proTeamLimit: planId === 'squad_organization' ? 15 : (planId === 'squad_pro' ? 1 : 0),
    planSource: 'free'
  }, { merge: true });

  // 2. Parent Team
  batch.set(doc(db, 'teams', teamId), {
    id: teamId, teamName, teamCode: code, createdBy: userId, ownerUserId: userId,
    createdAt: new Date().toISOString(), members: { [userId]: 'Admin' },
    isPro, planId, sport: 'Multi-Sport', isDemo: true,
    description: planId === 'squad_organization' ? 'Elite multi-team organization.' : 'Dynamic coordination for elite squads.'
  });
  
  batch.set(doc(db, 'users', userId, 'teamMemberships', teamId), {
    userId, teamId, teamName, teamCode: code, role: 'Admin', 
    isPro, planId, isDemo: true, 
    joinedAt: new Date().toISOString(), createdBy: userId, ownerUserId: userId
  });

  batch.set(doc(db, 'teams', teamId, 'members', userId), {
    id: userId, userId, teamId, name: 'Guest Coordinator', role: 'Admin',
    position: planId === 'squad_organization' ? 'Club Manager' : 'Coach', jersey: 'Staff',
    avatar: `https://picsum.photos/seed/${userId}/150/150`, joinedAt: new Date().toISOString(),
    phone: '(555) 000-1234', amountOwed: 0, feesPaid: true, isDemo: true
  });

  // 3. Unique Sub-teams for Club Plan
  if (planId === 'squad_organization') {
    const subTeams = [
      { id: `demo_sub_${userId.slice(-4)}_1`, name: 'U14 Development Squad' },
      { id: `demo_sub_${userId.slice(-4)}_2`, name: 'U16 Regional Elite' }
    ];

    for (const sub of subTeams) {
      batch.set(doc(db, 'teams', sub.id), {
        id: sub.id, teamName: sub.name, teamCode: sub.id.slice(-6).toUpperCase(), createdBy: userId, ownerUserId: userId,
        createdAt: new Date().toISOString(), members: { [userId]: 'Admin' },
        isPro: true, planId: 'squad_organization', isDemo: true, sport: 'Academy'
      });
      batch.set(doc(db, 'users', userId, 'teamMemberships', sub.id), {
        userId, teamId: sub.id, teamName: sub.name, role: 'Admin', isPro: true, 
        planId: 'squad_organization', isDemo: true, joinedAt: new Date().toISOString(), 
        createdBy: userId, ownerUserId: userId
      });
      batch.set(doc(db, 'teams', sub.id, 'members', userId), {
        id: userId, userId, teamId: sub.id, name: 'Guest Coordinator', role: 'Admin',
        position: 'Club Manager', avatar: `https://picsum.photos/seed/${userId}/150/150`, 
        isDemo: true, joinedAt: new Date().toISOString()
      });
    }
  }
  
  await batch.commit();
  
  // Seed content sequentially to ensure unique IDs and avoid write conflicts
  await seedDemoData(db, teamId, planId, userId);
  if (planId === 'squad_organization') {
    await seedDemoData(db, `demo_sub_${userId.slice(-4)}_1`, 'squad_organization', userId);
    await seedDemoData(db, `demo_sub_${userId.slice(-4)}_2`, 'squad_organization', userId);
  }

  return teamId;
}

/**
 * Resiliently resets a demo environment.
 */
export async function resetDemoEnvironment(db: Firestore, teamId: string, planId: string, userId: string) {
  try {
    const membershipsSnap = await getDocs(collection(db, 'users', userId, 'teamMemberships'));
    const teamIds = membershipsSnap.docs.map(d => d.id);

    const subcollections = ['events', 'games', 'drills', 'files', 'alerts', 'feedPosts', 'groupChats', 'members'];
    
    for (const tid of teamIds) {
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, 'teams', tid, sub));
        if (snap.empty) continue;

        const batch = writeBatch(db);
        for (const docSnap of snap.docs) {
          if (sub === 'members' && docSnap.data().userId === userId) continue;
          
          if (sub === 'groupChats') {
            const msgs = await getDocs(collection(db, 'teams', tid, sub, docSnap.id, 'messages'));
            const msgBatch = writeBatch(db);
            msgs.forEach(m => msgBatch.delete(m.ref));
            if (msgs.size > 0) await msgBatch.commit();
          }
          if (sub === 'events') {
            const regs = await getDocs(collection(db, 'teams', tid, sub, docSnap.id, 'registrations'));
            const regBatch = writeBatch(db);
            regs.forEach(r => regBatch.delete(r.ref));
            if (regs.size > 0) await regBatch.commit();
          }

          batch.delete(docSnap.ref);
        }
        if (snap.size > 0) await batch.commit();
      }
    }

    await updateDoc(doc(db, 'users', userId), { createdAt: new Date().toISOString() });

    for (const tid of teamIds) {
      await seedDemoData(db, tid, planId, userId);
    }
  } catch (error) {
    console.error("Atomic Demo Reset Failed:", error);
    throw error;
  }
}

/**
 * Launches global demo environments.
 */
export async function launchDemoEnvironments(db: Firestore, superAdminId: string) {
  const demoTeams = [
    { id: 'demo_starter_team', name: 'U10 Grassroots Stars', planId: 'starter_squad', sport: 'Soccer' },
    { id: 'demo_pro_team', name: 'Elite Solo Squad', planId: 'squad_pro', sport: 'Basketball' },
    { id: 'demo_club_team_1', name: 'City Central United', planId: 'squad_organization', sport: 'Academy' }
  ];

  for (const dt of demoTeams) {
    const teamRef = doc(db, 'teams', dt.id);
    const snap = await getDocs(query(collection(db, 'teams'), where('id', '==', dt.id)));
    
    if (snap.empty) {
      const code = dt.id.slice(0, 6).toUpperCase();
      const batch = writeBatch(db);
      batch.set(teamRef, {
        id: dt.id, teamName: dt.name, teamCode: code, createdBy: superAdminId, ownerUserId: superAdminId,
        createdAt: new Date().toISOString(), members: { [superAdminId]: 'Admin' },
        isPro: dt.planId !== 'starter_squad', planId: dt.planId, sport: dt.sport, isDemo: true
      });
      batch.set(doc(db, 'users', superAdminId, 'teamMemberships', dt.id), {
        userId: superAdminId, teamId: dt.id, teamName: dt.name, teamCode: code,
        role: 'Admin', isPro: dt.planId !== 'starter_squad', planId: dt.planId, isDemo: true, joinedAt: new Date().toISOString(),
        createdBy: superAdminId, ownerUserId: superAdminId
      });
      batch.set(doc(db, 'teams', dt.id, 'members', superAdminId), {
        id: superAdminId, userId: superAdminId, teamId: dt.id, name: 'Platform Admin', role: 'Admin',
        position: 'Platform Admin', jersey: 'HQ', avatar: `https://picsum.photos/seed/${superAdminId}/150/150`,
        joinedAt: new Date().toISOString(), phone: '(555) 000-0000', amountOwed: 0, feesPaid: true, isDemo: true
      });
      await batch.commit();
      await seedDemoData(db, dt.id, dt.planId, superAdminId);
    }
  }
}
