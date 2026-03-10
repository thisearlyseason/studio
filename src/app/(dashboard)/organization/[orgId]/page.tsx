
"use client";

import React, { useMemo } from 'react';
import { useTeam } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, collectionGroup, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar, 
  Megaphone, 
  ArrowUpRight, 
  Loader2, 
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter, useParams } from 'next/navigation';

export default function OrganizationDashboardPage() {
  const { orgId } = useParams();
  const { user } = useTeam();
  const db = useFirestore();
  const router = useRouter();

  // Organization-wide queries
  const teamsQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    return query(collection(db, 'teams'), where('clubId', '==', orgId));
  }, [orgId, db]);

  const membersQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    return query(collectionGroup(db, 'members'), where('clubId', '==', orgId));
  }, [orgId, db]);

  const eventsQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    const now = new Date().toISOString();
    return query(
      collectionGroup(db, 'events'), 
      where('clubId', '==', orgId),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(5)
    );
  }, [orgId, db]);

  const { data: teams, isLoading: isTeamsLoading } = useCollection(teamsQuery);
  const { data: members, isLoading: isMembersLoading } = useCollection(membersQuery);
  const { data: upcomingEvents } = useCollection(eventsQuery);

  const totalOwed = useMemo(() => {
    if (!members) return 0;
    return members.reduce((sum, m) => sum + (m.amountOwed || 0), 0);
  }, [members]);

  const isLoading = isTeamsLoading || isMembersLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Institutional Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-md bg-black text-white overflow-hidden relative group">
          <CardContent className="p-8 space-y-2">
            <div className="flex justify-between items-start">
              <Building className="h-10 w-10 text-primary opacity-40" />
              <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-widest border-none">Active</Badge>
            </div>
            <div>
              <p className="text-5xl font-black leading-none">{teams?.length || 0}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Squads</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md bg-white text-black overflow-hidden relative ring-1 ring-black/5">
          <CardContent className="p-8 space-y-2">
            <div className="flex justify-between items-start">
              <Users className="h-10 w-10 text-primary opacity-20" />
              <Badge className="bg-muted text-muted-foreground font-black text-[8px] uppercase tracking-widest border-none">Personnel</Badge>
            </div>
            <div>
              <p className="text-5xl font-black leading-none">{members?.length || 0}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Enrolled Members</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md bg-primary text-white overflow-hidden relative group">
          <CardContent className="p-8 space-y-2">
            <div className="flex justify-between items-start">
              <DollarSign className="h-10 w-10 text-white opacity-40" />
              <Badge className="bg-white/20 text-white font-black text-[8px] uppercase tracking-widest border-none">Audit</Badge>
            </div>
            <div>
              <p className="text-4xl font-black leading-none">${totalOwed.toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Outstanding Receivables</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-md bg-muted/30 overflow-hidden relative ring-1 ring-black/5">
          <CardContent className="p-8 space-y-2">
            <div className="flex justify-between items-start">
              <Activity className="h-10 w-10 text-black opacity-20" />
              <Badge className="bg-black text-white font-black text-[8px] uppercase tracking-widest border-none">Health</Badge>
            </div>
            <div>
              <p className="text-4xl font-black leading-none text-black">Active</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">System Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Institutional Itinerary</h2>
            </div>
          </div>
          <div className="space-y-4">
            {upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents.map((event) => {
              const team = teams?.find(t => t.id === event.teamId);
              return (
                <Card key={event.id} className="rounded-3xl border-none shadow-sm ring-1 ring-black/5 hover:shadow-md transition-all group overflow-hidden bg-white">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-muted flex flex-col items-center justify-center shrink-0 border group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="text-[8px] font-black uppercase opacity-60 leading-none">{format(new Date(event.date), 'MMM')}</span>
                      <span className="text-xl font-black tracking-tighter">{format(new Date(event.date), 'dd')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-base tracking-tight truncate uppercase">{event.title}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">{team?.teamName || 'Assigned Squad'} • {event.location}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="py-12 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">No upcoming cross-squad events</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Strategic Focus</h2>
            </div>
          </div>
          <Card className="rounded-[3rem] border-none shadow-2xl bg-black text-white overflow-hidden relative min-h-[300px] flex items-center">
            <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 pointer-events-none">
              <ShieldCheck className="h-48 w-48" />
            </div>
            <CardContent className="p-12 relative z-10 space-y-6">
              <Badge className="bg-primary text-white border-none font-black text-[10px] px-4 h-7">Master Coordination</Badge>
              <h2 className="text-3xl font-black tracking-tight uppercase leading-none">Scale Your <br />Legacy.</h2>
              <p className="text-white/60 font-medium text-sm leading-relaxed max-w-sm">
                As an Elite Organization, you maintain master control over every tactical decision and operational hurdle across your squads.
              </p>
              <Button onClick={() => router.push(`/organization/${orgId}/teams`)} className="h-12 px-8 rounded-xl font-black uppercase text-[10px] shadow-xl shadow-primary/20">
                Manage Squad Roster
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
