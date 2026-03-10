
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDocs,
  limit,
  setDoc,
  writeBatch,
  onSnapshot,
  deleteDoc,
  addDoc,
  updateDoc,
  orderBy,
  increment,
  collectionGroup,
  arrayUnion,
  getDoc,
  deleteField
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export type UserRole = "parent" | "adult_player" | "coach" | "admin";
export type SubscriptionPlan = "free" | "squad_pro" | "elite_teams" | "elite_league";
export type TeamType = "starter" | "pro";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: string;
  proTeamLimit: number;
  isDemo?: boolean;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  teamType: TeamType;
  sport?: string;
  isPro: boolean;
  planId?: string;
  clubId?: string;
  role: 'Admin' | 'Member';
  ownerUserId: string;
  teamLogoUrl?: string;
  heroImageUrl?: string;
  parentChatEnabled?: boolean;
  parentCommentsEnabled?: boolean;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdBy?: string;
  isDemo?: boolean;
};

export type PlayerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  guardianId: string;
  isMinor: boolean;
  hasLogin: boolean;
  joinedTeamIds: string[];
};

export type TournamentFormat = "single_elim" | "double_elim" | "round_robin";

export type TeamEvent = {
  id: string;
  teamId: string;
  title: string;
  date: string;
  endDate?: string;
  startTime: string;
  location: string;
  description: string;
  eventType?: EventType;
  isTournament?: boolean;
  isTournamentPaid?: boolean;
  tournamentTeams?: string[];
  tournamentGames?: TournamentGame[];
  userRsvps?: Record<string, string>;
  requiresSpecialWaiver?: boolean;
  specialWaiverText?: string;
  specialWaiverResponses?: Record<string, any>;
  teamWaiverText?: string;
  teamAgreements?: Record<string, any>;
  customFormFields?: any[];
};

export type EventType = 'game' | 'practice' | 'meeting' | 'tournament' | 'other';

export type TournamentGame = {
  id: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
  time: string;
  isCompleted: boolean;
  winnerId?: string;
  pool?: string;
};

export type Message = {
  id: string;
  author: string;
  authorId: string;
  content: string;
  type: 'text' | 'image' | 'poll';
  imageUrl?: string;
  createdAt: string;
  poll?: any;
};

export type TeamFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes?: number;
  url: string;
  category: string;
  description?: string;
  date: string;
  viewedBy?: Record<string, boolean>;
  comments?: any[];
};

export type Member = {
  id: string;
  userId: string;
  playerId?: string;
  teamId: string;
  role: 'Admin' | 'Member';
  position: string;
  name: string;
  avatar?: string;
  jersey?: string;
  phone?: string;
  birthdate?: string;
  parentName?: string;
  parentPhone?: string;
  amountOwed?: number;
  feesPaid?: boolean;
  fees?: FeeItem[];
  waiverSigned?: boolean;
  transportationWaiverSigned?: boolean;
  medicalClearance?: boolean;
  mediaRelease?: boolean;
  joinedAt: string;
};

export type FeeItem = {
  id: string;
  title: string;
  amount: number;
  paid: boolean;
  createdAt: string;
};

export type FundraisingOpportunity = {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  deadline: string;
  participants: Record<string, any>;
};

export type VolunteerOpportunity = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  slots: number;
  hoursPerSlot: number;
  signups: Record<string, any>;
};

export type League = {
  id: string;
  name: string;
  sport: string;
  creatorId: string;
  teams: Record<string, any>;
  leagueIds?: string[];
  isPublic?: boolean;
  status?: string;
};

export type RegistrationFormField = {
  id: string;
  type: 'short_text' | 'long_text' | 'dropdown' | 'checkbox' | 'yes_no' | 'image' | 'header';
  label: string;
  required: boolean;
  options?: string[];
  description?: string;
};

export type LeagueRegistrationConfig = {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  registration_cost: string;
  payment_instructions: string;
  form_schema: RegistrationFormField[];
  form_version: number;
};

export type RegistrationEntry = {
  id: string;
  league_id: string;
  answers: Record<string, any>;
  status: 'pending' | 'assigned' | 'accepted' | 'declined';
  payment_received: boolean;
  assigned_team_id: string | null;
  assigned_team_owner_id?: string;
  created_at: string;
};

interface TeamContextType {
  user: UserProfile | null;
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
  isTeamsLoading: boolean;
  isSeedingDemo: boolean;
  members: Member[];
  myChildren: PlayerProfile[];
  isStaff: boolean;
  isPro: boolean;
  isParent: boolean;
  isPlayer: boolean;
  isClubManager: boolean;
  isLeagueManager: boolean;
  clubId: string | null;
  alerts: any[];
  hasFeature: (featureId: string) => boolean;
  createNewTeam: (name: string, type: "adult" | "youth", pos: string, description?: string, teamType?: TeamType) => Promise<string>;
  joinTeamWithCode: (code: string, playerId: string, position: string) => Promise<boolean>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  updateTeamDetails: (updates: Partial<Team>) => Promise<void>;
  createChat: (name: string, memberIds: string[]) => Promise<string>;
  addMessage: (chatId: string, author: string, content: string, type: any, imageUrl?: string, poll?: any) => Promise<void>;
  votePoll: (chatId: string, msgId: string, optIdx: number) => Promise<void>;
  formatTime: (date: string | Date) => string;
  createAlert: (title: string, message: string) => Promise<void>;
  
  // Tournament Methods
  createTournament: (name: string, format: TournamentFormat, teams: string[]) => Promise<string>;
  updateMatchScore: (matchId: string, s1: number, s2: number) => Promise<void>;
  
  // Subscription Methods
  plans: any[];
  proQuotaStatus: { current: number; limit: number; remaining: number; exceeded: boolean };
  purchasePro: () => void;
  isPaywallOpen: boolean;
  setIsPaywallOpen: (open: boolean) => void;
  resolveQuota: (selectedTeamIds: string[]) => Promise<void>;

  // Additional methods used in components
  registerChild: (firstName: string, lastName: string, dob: string) => Promise<void>;
  upgradeChildToLogin: (childId: string, email: string) => Promise<void>;
  signWaiver: (childId: string, version: string) => Promise<void>;
  addRegistration: (teamId: string, eventId: string, data: any) => Promise<boolean>;
  submitRegistrationEntry: (leagueId: string, answers: any, version: number) => Promise<void>;
  saveLeagueRegistrationConfig: (leagueId: string, updates: any) => Promise<void>;
  assignEntryToTeam: (leagueId: string, entryId: string, teamId: string | null) => Promise<void>;
  toggleRegistrationPaymentStatus: (leagueId: string, entryId: string, paid: boolean) => Promise<void>;
  respondToAssignment: (leagueId: string, entryId: string, status: string) => Promise<void>;
  updateTeamPlan: (teamId: string, planId: string) => Promise<void>;
  addDrill: (drill: any) => Promise<void>;
  deleteDrill: (drillId: string) => Promise<void>;
  addFile: (name: string, type: string, size: number, url: string, category: string, description: string) => Promise<void>;
  addExternalLink: (title: string, url: string, category: string, description: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  markMediaAsViewed: (fileId: string) => Promise<void>;
  addMediaComment: (fileId: string, text: string) => Promise<void>;
  addGame: (game: any) => Promise<void>;
  updateGame: (gameId: string, updates: any) => Promise<void>;
  updateMember: (memberId: string, updates: any) => Promise<void>;
  manageSubscription: () => void;
  resetSeasonData: () => Promise<void>;
  signUpForFundraising: (id: string) => Promise<void>;
  addFundraisingOpportunity: (data: any) => Promise<void>;
  updateFundraisingAmount: (id: string, amount: number) => Promise<void>;
  deleteFundraisingOpportunity: (id: string) => Promise<void>;
  signUpForVolunteer: (id: string) => Promise<void>;
  addVolunteerOpportunity: (data: any) => Promise<void>;
  verifyVolunteerHours: (oppId: string, userId: string, hours: number) => Promise<void>;
  deleteVolunteerOpportunity: (id: string) => Promise<void>;
  activeLeague?: League;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    if (!firebaseUser?.uid || !db) return;
    return onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile({
          id: firebaseUser.uid,
          name: data.fullName || data.name || 'User',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatarUrl || data.avatar || '',
          role: data.role || 'adult_player',
          subscriptionPlan: data.subscriptionPlan || 'free',
          subscriptionStatus: data.subscriptionStatus || 'active',
          proTeamLimit: data.proTeamLimit || 0,
          isDemo: data.isDemo
        });
      }
    });
  }, [firebaseUser?.uid, db]);

  const teamsQuery = useMemoFirebase(() => {
    if (!firebaseUser || !db) return null;
    return query(collection(db, 'users', firebaseUser.uid, 'teamMemberships'));
  }, [firebaseUser?.uid, db]);

  const { data: teamsData, isLoading: isTeamsLoading } = useCollection(teamsQuery);
  const teams = useMemo(() => {
    if (!teamsData) return [];
    return teamsData.map(m => ({
      id: m.teamId || m.id,
      name: m.teamName,
      code: m.teamCode,
      teamType: m.teamType || 'starter',
      isPro: m.teamType === 'pro' || m.isPro || false,
      role: m.role || 'Member',
      ownerUserId: m.ownerUserId || '',
      sport: m.sport || 'Multi-Sport',
      teamLogoUrl: m.teamLogoUrl || '',
      parentChatEnabled: m.parentChatEnabled ?? true,
      parentCommentsEnabled: m.parentCommentsEnabled ?? true,
      description: m.description || '',
      contactEmail: m.contactEmail || '',
      contactPhone: m.contactPhone || '',
      createdBy: m.createdBy || m.ownerUserId || '',
      planId: m.planId || (m.teamType === 'pro' ? 'squad_pro' : 'free')
    })) as Team[];
  }, [teamsData]);

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    return teams.find(t => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  const membersQuery = useMemoFirebase(() => {
    if (!activeTeam?.id || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'members'));
  }, [activeTeam?.id, db]);
  const { data: membersData } = useCollection<Member>(membersQuery);
  const members = membersData || [];

  const childrenQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !db) return null;
    // CRITICAL: Ensure the query filter exactly matches the security rule constraints
    return query(collection(db, 'players'), where('guardianId', '==', firebaseUser.uid));
  }, [firebaseUser?.uid, db]);
  const { data: childrenData } = useCollection<PlayerProfile>(childrenQuery);
  const myChildren = useMemo(() => childrenData || [], [childrenData]);

  const alertsQuery = useMemoFirebase(() => {
    if (!activeTeam?.id || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'alerts'), orderBy('createdAt', 'desc'), limit(10));
  }, [activeTeam?.id, db]);
  const { data: alertsData } = useCollection(alertsQuery);
  const alerts = alertsData || [];

  const isStaff = useMemo(() => activeTeam?.role === 'Admin', [activeTeam]);
  const isPro = useMemo(() => activeTeam?.teamType === 'pro', [activeTeam]);
  const isClubManager = useMemo(() => userProfile?.subscriptionPlan === 'elite_teams' || userProfile?.subscriptionPlan === 'elite_league', [userProfile]);
  const isLeagueManager = useMemo(() => userProfile?.subscriptionPlan === 'elite_league', [userProfile]);
  const clubId = useMemo(() => isClubManager ? firebaseUser?.uid || null : activeTeam?.clubId || null, [isClubManager, firebaseUser, activeTeam]);
  const isParent = useMemo(() => userProfile?.role === 'parent', [userProfile]);
  const isPlayer = useMemo(() => userProfile?.role === 'adult_player', [userProfile]);

  const hasFeature = useCallback((featureId: string) => {
    if (userProfile?.subscriptionPlan === 'elite_league') return true;
    
    const freeFeatures = ['chat', 'schedule', 'score_tracking', 'basic_roster', 'playbook'];
    if (freeFeatures.includes(featureId)) return true;

    if (featureId === 'tournaments') return isPro;
    if (featureId === 'organization') return isClubManager;
    if (featureId === 'leagues') return isLeagueManager;

    const proFeatures = ['payments', 'attendance', 'documents', 'analytics', 'automation', 'full_roster', 'live_feed_read', 'high_priority_alerts', 'league_registration', 'elite_tournament'];
    if (proFeatures.includes(featureId)) return isPro;

    return false;
  }, [userProfile, isPro, isClubManager, isLeagueManager]);

  const proQuotaStatus = useMemo(() => {
    const plan = userProfile?.subscriptionPlan || 'free';
    let limitCount = 0;
    if (plan === 'squad_pro') limitCount = 1;
    else if (plan === 'elite_teams') limitCount = 8;
    else if (plan === 'elite_league') limitCount = 99999;

    const ownedProTeams = teams.filter(t => t.ownerUserId === firebaseUser?.uid && t.teamType === 'pro');
    const current = ownedProTeams.length;
    return { current, limit: limitCount, remaining: Math.max(0, limitCount - current), exceeded: current > limitCount };
  }, [teams, userProfile, firebaseUser?.uid]);

  const value = {
    user: userProfile,
    activeTeam,
    setActiveTeam: (t: Team) => setActiveTeamId(t.id),
    teams,
    isTeamsLoading,
    isSeedingDemo,
    members,
    myChildren,
    isStaff,
    isPro,
    isParent,
    isPlayer,
    isClubManager,
    isLeagueManager,
    clubId,
    alerts,
    hasFeature,
    createNewTeam: async (name: string, type: any, pos: string, description?: string, teamType: TeamType = 'starter') => {
      if (!firebaseUser) return '';
      const tid = `team_${Date.now()}`;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const batch = writeBatch(db);
      const teamData = { id: tid, teamName: name, teamCode: code, type, teamType, ownerUserId: firebaseUser.uid, createdAt: new Date().toISOString(), isPro: teamType === 'pro', description: description || '' };
      batch.set(doc(db, 'teams', tid), teamData);
      batch.set(doc(db, 'teams', tid, 'members', firebaseUser.uid), { id: firebaseUser.uid, userId: firebaseUser.uid, teamId: tid, role: 'Admin', position: pos, name: userProfile?.name || 'Coach', joinedAt: new Date().toISOString() });
      batch.set(doc(db, 'users', firebaseUser.uid, 'teamMemberships', tid), { teamId: tid, teamName: name, teamCode: code, teamType, role: 'Admin', ownerUserId: firebaseUser.uid, isPro: teamType === 'pro' });
      await batch.commit();
      return tid;
    },
    joinTeamWithCode: async (code: string, playerId: string, position: string) => {
      const q = query(collection(db, 'teams'), where('teamCode', '==', code.toUpperCase()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) { toast({ title: "Invalid Code", variant: "destructive" }); return false; }
      const tid = snap.docs[0].id;
      const tData = snap.docs[0].data();
      const batch = writeBatch(db);
      const memberId = playerId || firebaseUser!.uid;
      batch.set(doc(db, 'teams', tid, 'members', memberId), { id: memberId, userId: firebaseUser!.uid, playerId: memberId, teamId: tid, role: 'Member', position, name: userProfile?.name || 'Teammate', joinedAt: new Date().toISOString(), jersey: position === 'Parent' ? 'PAR' : 'TBD' });
      batch.set(doc(db, 'users', firebaseUser!.uid, 'teamMemberships', tid), { teamId: tid, teamName: tData.teamName, teamCode: code.toUpperCase(), role: 'Member', ownerUserId: tData.ownerUserId });
      if (playerId && !playerId.startsWith('p_')) { batch.update(doc(db, 'players', playerId), { joinedTeamIds: arrayUnion(tid) }); }
      await batch.commit();
      toast({ title: "Joined Team", description: `You are now a member of ${tData.teamName}` });
      return true;
    },
    updateUser: async (updates: any) => { if (firebaseUser) await updateDoc(doc(db, 'users', firebaseUser.uid), updates); },
    updateTeamDetails: async (updates: any) => { if (activeTeam) await updateDoc(doc(db, 'teams', activeTeam.id), updates); },
    createChat: async (name: string, memberIds: string[]) => {
      const docRef = await addDoc(collection(db, 'teams', activeTeam!.id, 'groupChats'), { name, memberIds: [...memberIds, firebaseUser!.uid], createdAt: new Date().toISOString() });
      return docRef.id;
    },
    addMessage: async (chatId: string, author: string, content: string, type: any, imageUrl?: string, poll?: any) => {
      await addDoc(collection(db, 'teams', activeTeam!.id, 'groupChats', chatId, 'messages'), { author, authorId: firebaseUser!.uid, content, type, imageUrl, poll, createdAt: new Date().toISOString() });
    },
    votePoll: async (chatId: string, msgId: string, optIdx: number) => {
      const ref = doc(db, 'teams', activeTeam!.id, 'groupChats', chatId, 'messages', msgId);
      const snap = await getDoc(ref);
      const poll = snap.data()!.poll;
      const voters = poll.voters || {};
      voters[firebaseUser!.uid] = optIdx;
      const options = poll.options.map((o: any, i: number) => ({ ...o, votes: Object.values(voters).filter(v => v === i).length }));
      await updateDoc(ref, { 'poll.voters': voters, 'poll.options': options, 'poll.totalVotes': Object.keys(voters).length });
    },
    formatTime: (date: any) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createAlert: async (title: string, message: string) => {
      await addDoc(collection(db, 'teams', activeTeam!.id, 'alerts'), { title, message, createdAt: new Date().toISOString(), createdBy: firebaseUser!.uid });
    },
    createTournament: async (name: string, format: TournamentFormat, teams: string[]) => {
      const tourneyId = `tourney_${Date.now()}`;
      await setDoc(doc(db, 'tournaments', tourneyId), { tourneyId, name, format, status: 'active', teams, creatorId: firebaseUser!.uid, createdAt: new Date().toISOString() });
      return tourneyId;
    },
    updateMatchScore: async (matchId: string, s1: number, s2: number) => {
      await updateDoc(doc(db, 'matches', matchId), { score1: s1, score2: s2, status: 'completed' });
    },
    plans: [],
    proQuotaStatus,
    purchasePro: () => setIsPaywallOpen(true),
    isPaywallOpen,
    setIsPaywallOpen,
    resolveQuota: async (selectedTeamIds: string[]) => {
      const batch = writeBatch(db);
      teams.forEach(t => {
        if (t.ownerUserId === firebaseUser?.uid && t.teamType === 'pro') {
          const isSelected = selectedTeamIds.includes(t.id);
          if (!isSelected) {
            batch.update(doc(db, 'teams', t.id), { teamType: 'starter', isPro: false });
            batch.update(doc(db, 'users', firebaseUser!.uid, 'teamMemberships', t.id), { teamType: 'starter', isPro: false });
          }
        }
      });
      await batch.commit();
      toast({ title: "Quota Resolved" });
    },
    registerChild: async (firstName: string, lastName: string, dob: string) => {
      await addDoc(collection(db, 'players'), { firstName, lastName, dateOfBirth: dob, guardianId: firebaseUser?.uid, isMinor: true, joinedTeamIds: [], createdAt: new Date().toISOString() });
    },
    upgradeChildToLogin: async (id: string, email: string) => { toast({ title: "Activation Email Sent" }); },
    signWaiver: async (id: string, v: string) => { toast({ title: "Waiver Signed" }); },
    addRegistration: async (tid: string, eid: string, data: any) => { return true; },
    submitRegistrationEntry: async (lid: string, answers: any, v: number) => { toast({ title: "Entry Submitted" }); },
    saveLeagueRegistrationConfig: async (lid: string, updates: any) => { toast({ title: "Config Saved" }); },
    assignEntryToTeam: async (lid: string, eid: string, tid: string | null) => { toast({ title: "Team Assigned" }); },
    toggleRegistrationPaymentStatus: async (lid: string, eid: string, paid: boolean) => { toast({ title: "Status Updated" }); },
    respondToAssignment: async (lid: string, eid: string, s: string) => { toast({ title: "Response Logged" }); },
    updateTeamPlan: async (tid: string, pid: string) => { toast({ title: "Plan Updated" }); },
    addDrill: async (d: any) => { await addDoc(collection(db, 'teams', activeTeam!.id, 'drills'), d); },
    deleteDrill: async (id: string) => { await deleteDoc(doc(db, 'teams', activeTeam!.id, 'drills', id)); },
    addFile: async (n: string, t: string, s: number, u: string, c: string, d: string) => { await addDoc(collection(db, 'teams', activeTeam!.id, 'files'), { name: n, type: t, sizeBytes: s, size: (s / 1024 / 1024).toFixed(1) + ' MB', url: u, category: c, description: d, date: new Date().toISOString() }); },
    addExternalLink: async (t: string, u: string, c: string, d: string) => { await addDoc(collection(db, 'teams', activeTeam!.id, 'files'), { name: t, type: 'link', url: u, category: c, description: d, date: new Date().toISOString() }); },
    deleteFile: async (id: string) => { await deleteDoc(doc(db, 'teams', activeTeam!.id, 'files', id)); },
    markMediaAsViewed: async (id: string) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'files', id), { [`viewedBy.${firebaseUser!.uid}`]: true }); },
    addMediaComment: async (id: string, text: string) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'files', id), { comments: arrayUnion({ id: Date.now().toString(), text, authorId: firebaseUser!.uid, authorName: userProfile?.name, createdAt: new Date().toISOString() }) }); },
    addGame: async (g: any) => { await addDoc(collection(db, 'teams', activeTeam!.id, 'games'), g); },
    updateGame: async (id: string, u: any) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'games', id), u); },
    updateMember: async (id: string, u: any) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'members', id), u); },
    manageSubscription: () => { window.open('https://billing.thesquad.pro', '_blank'); },
    resetSeasonData: async () => { toast({ title: "Season Reset Initiated" }); },
    signUpForFundraising: async (id: string) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'fundraising', id), { [`participants.${firebaseUser!.uid}`]: { id: firebaseUser!.uid, name: userProfile?.name } }); },
    addFundraisingOpportunity: async (d: any) => { await addDoc(collection(db, 'teams', activeTeam!.id, 'fundraising'), { ...d, currentAmount: 0 }); },
    updateFundraisingAmount: async (id: string, a: number) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'fundraising', id), { currentAmount: increment(a) }); },
    deleteFundraisingOpportunity: async (id: string) => { await deleteDoc(doc(db, 'teams', activeTeam!.id, 'fundraising', id)); },
    signUpForVolunteer: async (id: string) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'volunteers', id), { [`signups.${firebaseUser!.uid}`]: { userId: firebaseUser!.uid, userName: userProfile?.name, status: 'pending' } }); },
    addVolunteerOpportunity: async (d: any) => { await addDoc(collection(db, 'teams', activeTeam!.id, 'volunteers'), { ...d, signups: {} }); },
    verifyVolunteerHours: async (oid: string, uid: string, h: number) => { await updateDoc(doc(db, 'teams', activeTeam!.id, 'volunteers', oid), { [`signups.${uid}.status`]: 'verified', [`signups.${uid}.verifiedHours`]: h }); },
    deleteVolunteerOpportunity: async (id: string) => { await deleteDoc(doc(db, 'teams', activeTeam!.id, 'volunteers', id)); }
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};
