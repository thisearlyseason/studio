
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useRef } from 'react';
import { useFirebase, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
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
  arrayUnion,
  getDoc,
  deleteField,
  collectionGroup
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { seedGuestDemoTeam } from '@/lib/db-seeder';

export type UserRole = "parent" | "adult_player" | "coach" | "admin";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  createdAt?: string;
  isDemo?: boolean;
  activePlanId?: string | null;
  proTeamLimit?: number | null;
};

export type PlayerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ageGroup?: string;
  isMinor: boolean;
  parentId: string | null;
  userId: string | null;
  hasLogin: boolean;
  createdAt: string;
  joinedTeamIds?: string[];
};

export type Household = {
  id: string;
  parentIds: string[];
  playerIds: string[];
  billingEmail?: string;
  createdAt: string;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  type: "adult" | "youth";
  sport?: string;
  description?: string;
  teamLogoUrl?: string;
  heroImageUrl?: string;
  isPro?: boolean;
  planId?: string;
  role?: 'Admin' | 'Member';
  ownerUserId?: string;
  parentChatEnabled?: boolean;
  parentCommentsEnabled?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  leagueIds?: string[];
  createdBy?: string;
  createdAt?: string;
};

export type Member = {
  id: string;
  userId: string;
  playerId: string;
  teamId: string;
  name: string;
  role: 'Admin' | 'Member';
  position: string;
  jersey: string;
  avatar: string;
  isMinor?: boolean;
  feesPaid?: boolean;
  amountOwed?: number;
  fees?: FeeItem[];
  birthdate?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  waiverSigned?: boolean;
  transportationWaiverSigned?: boolean;
  medicalClearance?: boolean;
  mediaRelease?: boolean;
  joinedAt?: string;
};

export type FeeItem = {
  id: string;
  title: string;
  amount: number;
  paid: boolean;
  createdAt: string;
};

export type EventType = 'game' | 'practice' | 'meeting' | 'tournament' | 'other';

export type TeamEvent = {
  id: string;
  teamId: string;
  title: string;
  date: string;
  endDate?: string;
  startTime: string;
  endTime?: string;
  location: string;
  description: string;
  eventType: EventType;
  teamName?: string; // Denormalized for family view
};

interface TeamContextType {
  user: UserProfile | null;
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
  isTeamsLoading: boolean;
  isSeedingDemo: boolean;
  members: Member[];
  isMembersLoading: boolean;
  currentMember: Member | null;
  isStaff: boolean;
  isPro: boolean;
  isParent: boolean;
  isPlayer: boolean;
  isSuperAdmin: boolean;
  isClubManager: boolean;
  household: Household | null;
  householdEvents: TeamEvent[];
  householdBalance: number;
  createNewTeam: (name: string, type: "adult" | "youth", pos: string, description?: string, planId?: string) => Promise<string>;
  joinTeamWithCode: (code: string, playerId: string, position: string) => Promise<boolean>;
  registerChild: (firstName: string, lastName: string, dob: string) => Promise<string>;
  upgradeChildToLogin: (playerId: string, email: string) => Promise<void>;
  myChildren: PlayerProfile[];
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<Member>) => Promise<void>;
  updateTeamDetails: (updates: Partial<Team>) => Promise<void>;
  signWaiver: (playerId: string, version: string) => Promise<void>;
  purchasePro: () => void;
  isPaywallOpen: boolean;
  setIsPaywallOpen: (open: boolean) => void;
  plans: any[];
  isPlansLoading: boolean;
  proQuotaStatus: { current: number; limit: number; remaining: number; exceeded: boolean };
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

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

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isAuthResolved } = useFirebase();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [myChildren, setMyChildren] = useState<PlayerProfile[]>([]);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdEvents, setHouseholdEvents] = useState<TeamEvent[]>([]);
  const [householdBalance, setHouseholdBalance] = useState(0);

  const plansQuery = useMemoFirebase(() => (db && isAuthResolved && firebaseUser) ? collection(db, 'plans') : null, [db, isAuthResolved, firebaseUser]);
  const { data: plansData, isLoading: isPlansLoading } = useCollection(plansQuery);
  const plans = plansData || [];

  // 1. User Profile Sync
  useEffect(() => {
    if (!firebaseUser?.uid || !db || !isAuthResolved) return;
    return onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile({
          id: firebaseUser.uid,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          avatar: data.avatarUrl || data.avatar || '',
          role: data.role || 'adult_player',
          activePlanId: data.activePlanId,
          proTeamLimit: data.proTeamLimit || 0,
          createdAt: data.createdAt,
          isDemo: data.isDemo
        });
      }
    });
  }, [firebaseUser?.uid, db, isAuthResolved]);

  // 2. Household Management
  useEffect(() => {
    if (!firebaseUser?.uid || !db || !isAuthResolved || userProfile?.role !== 'parent') return;
    
    const hRef = doc(db, 'households', firebaseUser.uid);
    return onSnapshot(hRef, async (snap) => {
      if (snap.exists()) {
        setHousehold({ id: snap.id, ...snap.data() } as Household);
      } else {
        // Create initial household for parent
        const initial = {
          id: firebaseUser.uid,
          parentIds: [firebaseUser.uid],
          playerIds: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(hRef, initial);
      }
    });
  }, [firebaseUser?.uid, db, userProfile?.role, isAuthResolved]);

  // 3. Children Management
  useEffect(() => {
    if (!firebaseUser?.uid || !db || !isAuthResolved || userProfile?.role !== 'parent') return;
    const q = query(collection(db, 'players'), where('parentId', '==', firebaseUser.uid));
    return onSnapshot(q, (snap) => {
      const children = snap.docs.map(d => ({ id: d.id, ...d.data() } as PlayerProfile));
      setMyChildren(children);
      
      // Update household playerIds if needed
      if (household && children.length !== household.playerIds.length) {
        updateDoc(doc(db, 'households', firebaseUser.uid), {
          playerIds: children.map(c => c.id)
        });
      }
    });
  }, [firebaseUser?.uid, db, userProfile?.role, isAuthResolved, household?.id]);

  // 4. Aggregate Household Data (Schedules & Fees)
  useEffect(() => {
    if (!myChildren.length || !db) return;

    const allTeamIds = Array.from(new Set(myChildren.flatMap(c => c.joinedTeamIds || [])));
    if (!allTeamIds.length) {
      setHouseholdEvents([]);
      setHouseholdBalance(0);
      return;
    }

    // Fetch Events for all teams in household
    const eventsQ = query(collectionGroup(db, 'events'), where('teamId', 'in', allTeamIds.slice(0, 30)));
    const unsubEvents = onSnapshot(eventsQ, (snap) => {
      const evs = snap.docs.map(d => ({ id: d.id, ...d.data() } as TeamEvent));
      setHouseholdEvents(evs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    });

    // Fetch total balance for all children across all rosters
    const membersQ = query(collectionGroup(db, 'members'), where('playerId', 'in', myChildren.map(c => c.id)));
    const unsubMembers = onSnapshot(membersQ, (snap) => {
      const total = snap.docs.reduce((sum, d) => sum + (d.data().amountOwed || 0), 0);
      setHouseholdBalance(total);
    });

    return () => {
      unsubEvents();
      unsubMembers();
    };
  }, [myChildren, db]);

  // Existing Teams/Members Logic
  const teamsQuery = useMemoFirebase(() => {
    if (!isAuthResolved || !firebaseUser?.uid || !db) return null;
    return query(collection(db, 'users', firebaseUser.uid, 'teamMemberships'));
  }, [isAuthResolved, firebaseUser?.uid, db]);
  const { data: teamsData, isLoading: isTeamsLoading } = useCollection(teamsQuery);
  const teams = useMemo(() => {
    if (!teamsData) return [];
    return teamsData.map(m => ({
      id: m.teamId || m.id,
      name: m.teamName || 'Unnamed Team',
      code: m.teamCode || '......',
      type: m.type || 'adult',
      isPro: m.isPro || false,
      planId: m.planId || 'starter_squad',
      role: m.role || 'Member',
      ownerUserId: m.ownerUserId || '',
      sport: m.sport || 'Multi-Sport',
      parentChatEnabled: m.parentChatEnabled ?? true,
      parentCommentsEnabled: m.parentCommentsEnabled ?? true,
      heroImageUrl: m.heroImageUrl || '',
      teamLogoUrl: m.teamLogoUrl || '',
      leagueIds: m.leagueIds || [],
      createdBy: m.createdBy
    }));
  }, [teamsData]);

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    return teams.find(t => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  const membersQuery = useMemoFirebase(() => {
    if (!isAuthResolved || !activeTeam?.id || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'members'));
  }, [isAuthResolved, activeTeam?.id, db]);
  const { data: membersData, isLoading: isMembersLoading } = useCollection<Member>(membersQuery);
  const members = useMemo(() => membersData || [], [membersData]);

  const proQuotaStatus = useMemo(() => {
    const limitCount = userProfile?.proTeamLimit ?? 0;
    const ownedProTeams = teams.filter(t => t.ownerUserId === firebaseUser?.uid && t.isPro);
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
    isMembersLoading,
    currentMember: members.find(m => m.userId === firebaseUser?.uid) || null,
    isStaff: activeTeam?.role === 'Admin',
    isPro: activeTeam?.isPro || false,
    isParent: userProfile?.role === 'parent',
    isPlayer: userProfile?.role === 'adult_player',
    isSuperAdmin: userProfile?.email === 'thisearlyseason@gmail.com' || userProfile?.email === 'test@gmail.com',
    isClubManager: !!userProfile?.activePlanId?.includes('squad_organization'),
    household,
    householdEvents,
    householdBalance,
    myChildren,
    plans,
    isPlansLoading,
    proQuotaStatus,
    isPaywallOpen,
    setIsPaywallOpen,
    purchasePro: () => setIsPaywallOpen(true),
    createNewTeam: async (name: string, type: "adult" | "youth", pos: string, description?: string, planId?: string) => {
      if (!firebaseUser) return '';
      const tid = `team_${Date.now()}`;
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const pId = planId || 'starter_squad';
      const batch = writeBatch(db);
      const teamData = clean({ 
        id: tid, teamName: name, teamCode: code, type, 
        createdBy: firebaseUser.uid, ownerUserId: firebaseUser.uid, 
        createdAt: new Date().toISOString(), isPro: pId !== 'starter_squad', 
        planId: pId, sport: 'Multi-Sport', members: { [firebaseUser.uid]: 'admin' }
      });
      batch.set(doc(db, 'teams', tid), teamData);
      batch.set(doc(db, 'teams', tid, 'members', firebaseUser.uid), clean({ id: firebaseUser.uid, userId: firebaseUser.uid, teamId: tid, role: 'Admin', position: pos, name: userProfile?.name || 'Coach', avatar: userProfile?.avatar || '', joinedAt: new Date().toISOString(), jersey: 'HQ' }));
      batch.set(doc(db, 'users', firebaseUser.uid, 'teamMemberships', tid), clean({ teamId: tid, teamName: name, teamCode: code, type, role: 'Admin', isPro: pId !== 'starter_squad', planId: pId, ownerUserId: firebaseUser.uid, teamLogoUrl: '', sport: 'Multi-Sport' }));
      await batch.commit();
      return tid;
    },
    joinTeamWithCode: async (code: string, playerId: string, position: string) => {
      if (!firebaseUser || !db) return false;
      const q = query(collection(db, 'teams'), where('teamCode', '==', (code || '').toUpperCase()), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) { toast({ title: "Invalid Code", variant: "destructive" }); return false; }
      const tDoc = snap.docs[0]; const tid = tDoc.id; const tData = tDoc.data();
      const playerSnap = await getDoc(doc(db, 'players', playerId)); const pData = playerSnap.data();
      const batch = writeBatch(db);
      batch.update(doc(db, 'players', playerId), { joinedTeamIds: arrayUnion(tid) });
      batch.set(doc(db, 'teams', tid, 'members', playerId), clean({ id: playerId, userId: firebaseUser.uid, playerId, teamId: tid, role: 'Member', position, name: `${pData?.firstName || ''} ${pData?.lastName || ''}`, avatar: '', isMinor: !!pData?.isMinor, joinedAt: new Date().toISOString(), jersey: 'TBD' }));
      if (playerId !== `p_${firebaseUser.uid}`) {
        batch.set(doc(db, 'teams', tid, 'members', firebaseUser.uid), clean({ id: firebaseUser.uid, userId: firebaseUser.uid, playerId: 'guardian', teamId: tid, role: 'Member', position: 'Parent', name: userProfile?.name || 'Guardian', avatar: userProfile?.avatar || '', joinedAt: new Date().toISOString(), jersey: 'HQ' }));
      }
      batch.set(doc(db, 'users', firebaseUser.uid, 'teamMemberships', tid), clean({ teamId: tid, teamName: tData.teamName, teamCode: (code || '').toUpperCase(), type: tData.type, role: 'Member', ownerUserId: tData.ownerUserId || '', isPro: !!tData.isPro, planId: tData.planId || 'starter_squad', teamLogoUrl: tData.teamLogoUrl || '', sport: tData.sport || 'Multi-Sport' }));
      batch.update(doc(db, 'teams', tid), { [`members.${firebaseUser.uid}`]: 'member' });
      await batch.commit();
      toast({ title: "Welcome to the Squad!" });
      return true;
    },
    registerChild: async (firstName: string, lastName: string, dob: string) => {
      if (!firebaseUser) return '';
      const docRef = await addDoc(collection(db, 'players'), clean({ firstName, lastName, dateOfBirth: dob, isMinor: true, parentId: firebaseUser.uid, hasLogin: false, createdAt: new Date().toISOString(), joinedTeamIds: [] }));
      return docRef.id;
    },
    upgradeChildToLogin: async (playerId: string, email: string) => {
      if (!firebaseUser) return;
      await updateDoc(doc(db, 'players', playerId), { hasLogin: true, inviteEmail: (email || '').toLowerCase() });
      toast({ title: "Invite Dispatched" });
    },
    signWaiver: async (playerId: string, version: string) => {
      if (!firebaseUser) return;
      await addDoc(collection(db, 'waivers'), clean({ playerId, signedByUserId: firebaseUser.uid, signedByRole: userProfile?.role === 'parent' ? 'parent' : 'player', signedAt: new Date().toISOString(), version }));
    },
    updateUser: async (updates: Partial<UserProfile>) => {
      if (!firebaseUser) return;
      await updateDoc(doc(db, 'users', firebaseUser.uid), clean(updates));
    },
    updateMember: async (memberId: string, updates: Partial<Member>) => {
      if (!activeTeam) return;
      await updateDoc(doc(db, 'teams', activeTeam.id, 'members', memberId), clean(updates));
    },
    updateTeamDetails: async (updates: Partial<Team>) => {
      if (!activeTeam) return;
      await updateDoc(doc(db, 'teams', activeTeam.id), clean(updates));
    }
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
};
