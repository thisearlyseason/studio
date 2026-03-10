
"use client";

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
  getDoc
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { seedGuestDemoTeam } from '@/lib/db-seeder';

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
};

export type TournamentFormat = "single_elim" | "double_elim" | "round_robin";

export type Tournament = {
  tourneyId: string;
  name: string;
  format: TournamentFormat;
  status: "draft" | "active" | "completed";
  teams: string[];
  creatorId: string;
  leagueId?: string;
  createdAt: string;
};

export type TournamentMatch = {
  matchId: string;
  tourneyId: string;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
  time: string;
  status: "scheduled" | "completed";
  round: number;
  nextMatchId?: string;
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

interface TeamContextType {
  user: UserProfile | null;
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
  isTeamsLoading: boolean;
  isSeedingDemo: boolean;
  members: any[];
  isStaff: boolean;
  isPro: boolean;
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
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser } = useUser();
  const db = useFirestore();
  const searchParams = useSearchParams();
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
      parentCommentsEnabled: m.parentCommentsEnabled ?? true
    }));
  }, [teamsData]);

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    return teams.find(t => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  const membersQuery = useMemoFirebase(() => {
    if (!activeTeam?.id || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'members'));
  }, [activeTeam?.id, db]);
  const { data: membersData } = useCollection(membersQuery);
  const members = membersData || [];

  const alertsQuery = useMemoFirebase(() => {
    if (!activeTeam?.id || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'alerts'), orderBy('createdAt', 'desc'), limit(10));
  }, [activeTeam?.id, db]);
  const { data: alertsData } = useCollection(alertsQuery);
  const alerts = alertsData || [];

  const isStaff = activeTeam?.role === 'Admin';
  const isPro = activeTeam?.teamType === 'pro';
  const isClubManager = userProfile?.subscriptionPlan === 'elite_teams' || userProfile?.subscriptionPlan === 'elite_league';
  const isLeagueManager = userProfile?.subscriptionPlan === 'elite_league';
  const clubId = isClubManager ? firebaseUser?.uid || null : activeTeam?.clubId || null;

  const hasFeature = useCallback((featureId: string) => {
    if (userProfile?.subscriptionPlan === 'elite_league') return true;
    
    const freeFeatures = ['chat', 'schedule', 'score_tracking', 'basic_roster', 'playbook'];
    if (freeFeatures.includes(featureId)) return true;

    if (featureId === 'tournaments') return isPro;
    if (featureId === 'organization') return isClubManager;
    if (featureId === 'leagues') return isLeagueManager;

    const proFeatures = ['payments', 'attendance', 'documents', 'analytics', 'automation', 'full_roster'];
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
    isStaff,
    isPro,
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
      const teamData = { id: tid, teamName: name, teamCode: code, type, teamType, ownerUserId: firebaseUser.uid, createdAt: new Date().toISOString(), isPro: teamType === 'pro' };
      batch.set(doc(db, 'teams', tid), teamData);
      batch.set(doc(db, 'teams', tid, 'members', firebaseUser.uid), { id: firebaseUser.uid, userId: firebaseUser.uid, teamId: tid, role: 'Admin', position: pos, name: userProfile?.name || 'Coach', joinedAt: new Date().toISOString() });
      batch.set(doc(db, 'users', firebaseUser.uid, 'teamMemberships', tid), { teamId: tid, teamName: name, teamCode: code, teamType, role: 'Admin', ownerUserId: firebaseUser.uid, isPro: teamType === 'pro' });
      await batch.commit();
      return tid;
    },
    joinTeamWithCode: async (code: string, playerId: string, position: string) => {
      const q = query(collection(db, 'teams'), where('teamCode', '==', code.toUpperCase()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return false;
      const tid = snap.docs[0].id;
      const tData = snap.docs[0].data();
      const batch = writeBatch(db);
      batch.set(doc(db, 'teams', tid, 'members', firebaseUser!.uid), { id: firebaseUser!.uid, userId: firebaseUser!.uid, teamId: tid, role: 'Member', position, name: userProfile?.name || 'Teammate', joinedAt: new Date().toISOString() });
      batch.set(doc(db, 'users', firebaseUser!.uid, 'teamMemberships', tid), { teamId: tid, teamName: tData.teamName, teamCode: code.toUpperCase(), role: 'Member', ownerUserId: tData.ownerUserId });
      await batch.commit();
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
      // Logic for initial match generation based on format would go here
      return tourneyId;
    },
    updateMatchScore: async (matchId: string, s1: number, s2: number) => {
      await updateDoc(doc(db, 'matches', matchId), { score1: s1, score2: s2, status: 'completed' });
    },
    plans: [],
    proQuotaStatus,
    purchasePro: () => setIsPaywallOpen(true),
    isPaywallOpen,
    setIsPaywallOpen
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};
