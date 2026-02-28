"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc, 
  getDocs,
  limit,
  setDoc,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Purchases } from '@revenuecat/purchases-js';

// Configuration for RevenueCat
const REVENUECAT_PUBLIC_API_KEY = 'test_zvlronFHqIFQuWTkgaeWrdyYnkZ';
const PRO_ENTITLEMENT_ID = 'The Squad Pro';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

export type Team = {
  id: string;
  name: string;
  code: string;
  sport?: string;
  teamLogoUrl?: string;
  heroImageUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  membersMap?: Record<string, string>;
  isPro?: boolean;
  role?: 'Admin' | 'Member';
};

export type MemberPosition = 'Coach' | 'Team Lead' | 'Assistant Coach' | 'Squad Leader' | 'Player' | 'Parent' | string;

export type FeeItem = {
  id: string;
  title: string;
  amount: number;
  paid: boolean;
  createdAt: string;
};

export type Member = {
  id: string;
  userId: string;
  teamId: string;
  name: string;
  role: 'Admin' | 'Member';
  position: MemberPosition;
  jersey: string;
  avatar: string;
  feesPaid?: boolean;
  amountOwed?: number;
  fees?: FeeItem[];
};

export type TeamAlert = {
  id: string;
  teamId: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
};

interface TeamContextType {
  user: UserProfile | null;
  updateUser: (updates: Partial<UserProfile>) => void;
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  updateTeamHero: (url: string) => Promise<void>;
  updateTeamDetails: (updates: Partial<Team>) => Promise<void>;
  teams: Team[];
  members: Member[];
  updateMember: (id: string, updates: Partial<Member>) => void;
  alerts: TeamAlert[];
  createAlert: (title: string, message: string) => void;
  createNewTeam: (name: string, organizerPosition: string) => Promise<void>;
  joinTeamWithCode: (code: string, position: string) => Promise<boolean>;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isPro: boolean;
  purchasePro: () => Promise<void>;
  manageSubscription: () => Promise<void>;
  isPaywallOpen: boolean;
  setIsPaywallOpen: (open: boolean) => void;
  formatTime: (date: string | Date) => string;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const SUPER_ADMIN_EMAILS = ['thisearlyseason@gmail.com', 'test@gmail.com'];

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const db = useFirestore();
  
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProEntitlementActive, setIsProEntitlementActive] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isRCInitialized, setIsRCInitialized] = useState(false);

  const isSuperAdmin = useMemo(() => firebaseUser?.email ? SUPER_ADMIN_EMAILS.includes(firebaseUser.email) : false, [firebaseUser?.email]);

  useEffect(() => {
    if (firebaseUser && !isRCInitialized) {
      if (!REVENUECAT_PUBLIC_API_KEY || REVENUECAT_PUBLIC_API_KEY.includes('placeholder') || REVENUECAT_PUBLIC_API_KEY.length < 10) {
        setIsRCInitialized(true);
        return;
      }
      try {
        Purchases.configure(REVENUECAT_PUBLIC_API_KEY, firebaseUser.uid);
        const purchases = Purchases.getSharedInstance();
        purchases.getCustomerInfo().then(info => {
          setIsProEntitlementActive(!!info.entitlements.active[PRO_ENTITLEMENT_ID]);
        }).catch(() => {});
        const unsubscribe = purchases.addCustomerInfoUpdateListener((info) => {
          setIsProEntitlementActive(!!info.entitlements.active[PRO_ENTITLEMENT_ID]);
        });
        setIsRCInitialized(true);
        return () => { if (unsubscribe) unsubscribe(); };
      } catch (e) { setIsRCInitialized(true); }
    }
  }, [firebaseUser, isRCInitialized]);

  useEffect(() => {
    if (firebaseUser) {
      const unsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            id: firebaseUser.uid,
            name: data.fullName || firebaseUser.displayName || 'Anonymous',
            email: data.email || firebaseUser.email || '',
            phone: data.phone || '',
            avatar: data.avatarUrl || `https://picsum.photos/seed/${firebaseUser.uid}/150/150`
          });
        }
      });
      return () => unsub();
    }
  }, [firebaseUser, db]);

  const teamsQuery = useMemoFirebase(() => {
    if (!firebaseUser || !db) return null;
    const base = isSuperAdmin ? collection(db, 'teams') : collection(db, 'users', firebaseUser.uid, 'teamMemberships');
    return query(base, limit(20));
  }, [firebaseUser?.uid, db, isSuperAdmin]);

  const { data: teamsRawData } = useCollection(teamsQuery);
  const teams = useMemo(() => {
    if (!teamsRawData) return [];
    return teamsRawData.map(m => isSuperAdmin ? {
      id: m.id, name: m.teamName || m.name, code: m.teamCode || m.code, sport: m.sport, teamLogoUrl: m.teamLogoUrl, heroImageUrl: m.heroImageUrl, isPro: m.isPro || false, role: 'Admin'
    } : {
      id: m.teamId, name: m.teamName, code: m.teamCode, sport: m.sport, teamLogoUrl: m.teamLogoUrl, isPro: m.isPro || false, role: m.role || 'Member'
    });
  }, [teamsRawData, isSuperAdmin]);

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    return teams.find(t => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);

  const membersQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return collection(db, 'teams', activeTeam.id, 'members');
  }, [activeTeam?.id, db]);
  const { data: membersData } = useCollection(membersQuery);
  const members = useMemo(() => (membersData || []).map(m => ({
    id: m.id, userId: m.userId, teamId: m.teamId, name: m.name || 'Member', role: m.role, position: m.position || 'Player', jersey: m.jersey || 'TBD', avatar: m.avatar || `https://picsum.photos/seed/${m.userId}/150/150`, feesPaid: m.feesPaid || false, amountOwed: m.amountOwed || 0, fees: m.fees || []
  })), [membersData]);

  const alertsQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'alerts'), limit(5));
  }, [activeTeam?.id, db]);
  const { data: alertsData } = useCollection(alertsQuery);
  const alerts = useMemo(() => (alertsData || []).map(a => ({ id: a.id, teamId: a.teamId, title: a.title, message: a.message, createdBy: a.createdBy, createdAt: a.createdAt })), [alertsData]);

  const contextValue = useMemo(() => ({
    user: userProfile, 
    updateUser: (updates: Partial<UserProfile>) => { if (firebaseUser) updateDocumentNonBlocking(doc(db, 'users', firebaseUser.uid), updates); },
    activeTeam, 
    setActiveTeam: (t: Team) => setActiveTeamId(t.id),
    updateTeamHero: async (url: string) => { if (activeTeam && firebaseUser) { updateDocumentNonBlocking(doc(db, 'teams', activeTeam.id), { heroImageUrl: url }); updateDocumentNonBlocking(doc(db, 'users', firebaseUser.uid, 'teamMemberships', activeTeam.id), { heroImageUrl: url }); } },
    updateTeamDetails: async (updates: Partial<Team>) => { if (activeTeam && firebaseUser) { const f: any = {}; if (updates.name) f.teamName = updates.name; if (updates.sport) f.sport = updates.sport; if (updates.teamLogoUrl) f.teamLogoUrl = updates.teamLogoUrl; if (Object.keys(f).length > 0) { updateDocumentNonBlocking(doc(db, 'teams', activeTeam.id), f); updateDocumentNonBlocking(doc(db, 'users', firebaseUser.uid, 'teamMemberships', activeTeam.id), f); } toast({ title: "Squad Updated" }); } },
    teams, 
    members, 
    updateMember: (id: string, u: any) => activeTeam && updateDocumentNonBlocking(doc(db, 'teams', activeTeam.id, 'members', id), u),
    alerts, 
    createAlert: (t: string, m: string) => { if (activeTeam && firebaseUser) { setDocumentNonBlocking(doc(collection(db, 'teams', activeTeam.id, 'alerts')), { teamId: activeTeam.id, title: t, message: m, createdBy: firebaseUser.uid, createdAt: new Date().toISOString() }, { merge: true }); } },
    createNewTeam: async (name: string, pos: string) => { if (!firebaseUser) return; const tid = `team_${Date.now()}`; const code = Math.random().toString(36).substring(2, 8).toUpperCase(); const batch = writeBatch(db); batch.set(doc(db, 'teams', tid), { id: tid, teamName: name, teamCode: code, createdBy: firebaseUser.uid, createdAt: new Date().toISOString(), members: { [firebaseUser.uid]: 'Admin' }, isPro: false }); batch.set(doc(db, 'teams', tid, 'members', firebaseUser.uid), { userId: firebaseUser.uid, teamId: tid, role: 'Admin', position: pos || 'Coach', name: userProfile?.name || 'Organizer', avatar: userProfile?.avatar || '', joinedAt: new Date().toISOString() }); batch.set(doc(db, 'users', firebaseUser.uid, 'teamMemberships', tid), { userId: firebaseUser.uid, teamId: tid, teamName: name, teamCode: code, role: 'Admin', isPro: false, joinedAt: new Date().toISOString() }); await batch.commit(); setActiveTeamId(tid); },
    joinTeamWithCode: async (code: string, pos: string) => { if (!firebaseUser || !userProfile) return false; const qT = query(collection(db, 'teams'), where('teamCode', '==', code.toUpperCase()), limit(1)); const snap = await getDocs(qT); if (snap.empty) return false; const tDoc = snap.docs[0]; const tid = tDoc.id; const batch = writeBatch(db); batch.update(doc(db, 'teams', tid), { [`members.${firebaseUser.uid}`]: 'Member' }); batch.set(doc(db, 'teams', tid, 'members', firebaseUser.uid), { userId: firebaseUser.uid, teamId: tid, role: 'Member', position: pos || 'Player', name: userProfile.name, avatar: userProfile.avatar, joinedAt: new Date().toISOString() }); batch.set(doc(db, 'users', firebaseUser.uid, 'teamMemberships', tid), { userId: firebaseUser.uid, teamId: tid, teamName: tDoc.data().teamName, teamCode: code.toUpperCase(), role: 'Member', isPro: tDoc.data().isPro || false, joinedAt: new Date().toISOString() }); await batch.commit(); setActiveTeamId(tid); return true; },
    isLoading: isUserLoading, 
    isSuperAdmin,
    isPro: activeTeam?.isPro || isProEntitlementActive || isSuperAdmin,
    purchasePro: async () => setIsPaywallOpen(true),
    manageSubscription: async () => { try { await Purchases.getSharedInstance().openCustomerCenter(); } catch { toast({ title: "Error", description: "Failed to open settings.", variant: "destructive" }); } },
    isPaywallOpen, setIsPaywallOpen,
    formatTime: (d: any) => (typeof d === 'string' ? new Date(d) : d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  }), [userProfile, activeTeam, teams, members, alerts, isUserLoading, isProEntitlementActive, isSuperAdmin, isPaywallOpen, db, firebaseUser]);

  return <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) throw new Error('useTeam must be used within a TeamProvider');
  return context;
}