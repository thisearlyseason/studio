
"use client";

import React, { useMemo } from 'react';
import { useTeam } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, collectionGroup, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  Trophy, 
  Zap, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  ArrowUpRight, 
  Loader2, 
  ShieldCheck,
  Megaphone,
  TrendingUp,
  Activity,
  Layout
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ClubDashboardPage() {
  const { user, isClubManager, clubId } = useTeam();
  const db = useFirestore();
  const router = useRouter();

  // Queries filtered by clubId
  const teamsQuery = useMemoFirebase(() => {
    if (!clubId || !db) return null;
    return query(collection(db, 'teams'), where('clubId', '==', clubId));
  }, [clubId, db]);

  const membersQuery = useMemoFirebase(() => {
    if (!clubId || !db) return null;
    return query(collectionGroup(db, 'members'), where('clubId', '==', clubId));
  }, [clubId, db]);

  const eventsQuery = useMemoFirebase(() => {
    if (!clubId || !db) return null;
    const now = new Date().toISOString();
    return query(
      collectionGroup(db, 'events'), 
      where('clubId', '==', clubId),
      where('date', '>=', now),
      orderBy('date', 'asc'),
      limit(5)
    );
  }, [clubId, db]);

  const alertsQuery = useMemoFirebase(() => {
    if (!clubId || !db) return null;
    return query(
      collectionGroup(db, 'alerts'), 
      where('clubId', '==', clubId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [clubId, db]);

  const { data: teams, isLoading: isTeamsLoading } = useCollection(teamsQuery);
  const { data: members, isLoading: isMembersLoading } = useCollection(membersQuery);
  const { data: upcomingEvents } = useCollection(eventsQuery);
  const { data: recentAlerts } = useCollection(alertsQuery);

  const totalOwed = useMemo(() => {
    if (!members) return 0;
    return members.reduce((sum, m) => sum + (m.amountOwed || 0), 0);
  }, [members]);

  if (!isClubManager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <Building className="h-16 w-16 opacity-20" />
        <h1 className="text-2xl font-black uppercase">Institutional Access Only</h1>
        <p className="text-muted-foreground font-bold">This dashboard is reserved for organization managers.</p>
      </div>
    );
  }

  const isLoading = isTeamsLoading || isMembersLoading;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="space-y-1">
        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Strategic HQ</Badge>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Strategic Dashboard</h1>
        <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Cross-Squad Intelligence Aggregation</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Synchronizing Organization Data...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-[2.5rem] border-none shadow-md bg-black text-white overflow-hidden relative group">
              <CardContent className="p-8 space-y-2">
                <div className="flex justify-between items-start">
                  <Building className="h-10 w-10 text-primary opacity-40" />
                  <Badge className="bg-primary text-white font-black text-[8px] uppercase tracking-widest border-none">Squads</Badge>
                </div>
                <div>
                  <p className="text-5xl font-black leading-none">{teams?.length || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Active Teams</p>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Members</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-md bg-primary text-white overflow-hidden relative group">
              <CardContent className="p-8 space-y-2">
                <div className="flex justify-between items-start">
                  <DollarSign className="h-10 w-10 text-white opacity-40" />
                  <Badge className="bg-white/20 text-white font-black text-[8px] uppercase tracking-widest border-none">Receivables</Badge>
                </div>
                <div>
                  <p className="text-4xl font-black leading-none">${totalOwed.toLocaleString()}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Outstanding Balance</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-md bg-muted/30 overflow-hidden relative ring-1 ring-black/5">
              <CardContent className="p-8 space-y-2">
                <div className="flex justify-between items-start">
                  <Activity className="h-10 w-10 text-black opacity-20" />
                  <Badge className="bg-black text-white font-black text-[8px] uppercase tracking-widest border-none">Engagement</Badge>
                </div>
                <div>
                  <p className="text-4xl font-black leading-none text-black">Active</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">System Health</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em]">Upcoming Itinerary</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/events')} className="text-[10px] font-black uppercase tracking-widest h-8">View All</Button>
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
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate">{team?.name || 'Assigned Squad'} • {event.location}</p>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-primary opacity-20 group-hover:opacity-100 transition-all" />
                      </CardContent>
                    </Card>
                  );
                }) : (
                  <div className="py-12 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed opacity-40">
                    <p className="text-xs font-black uppercase tracking-widest">No upcoming squad events</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <h2 className="text-xs font-black uppercase tracking-[0.2em]">Recent Broadcasts</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/feed')} className="text-[10px] font-black uppercase tracking-widest h-8">Full Feed</Button>
              </div>
              <div className="space-y-4">
                {recentAlerts && recentAlerts.length > 0 ? recentAlerts.map((alert) => {
                  const team = teams?.find(t => t.id === alert.teamId);
                  return (
                    <Card key={alert.id} className="rounded-3xl border-none shadow-sm ring-1 ring-red-500/10 bg-red-50/30 overflow-hidden">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className="bg-red-500/10 p-2 rounded-xl text-red-600 shrink-0">
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-sm tracking-tight leading-tight">{alert.title}</h4>
                          <p className="text-[10px] font-medium text-muted-foreground leading-relaxed mt-1 line-clamp-2">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[7px] h-4 font-black uppercase border-red-200 text-red-600 px-1">{team?.name || 'SQUAD'}</Badge>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">{format(new Date(alert.createdAt), 'MMM d, p')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }) : (
                  <div className="py-12 text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed opacity-40">
                    <p className="text-xs font-black uppercase tracking-widest">No active alerts recorded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="rounded-[3rem] border-none shadow-2xl bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 pointer-events-none">
          <ShieldCheck className="h-48 w-48" />
        </div>
        <CardContent className="p-12 relative z-10 space-y-6">
          <Badge className="bg-primary text-white border-none font-black text-[10px] px-4 h-7">Institutional Ledger</Badge>
          <h2 className="text-4xl font-black tracking-tight leading-[0.9] uppercase">Centralised <br />Coordination.</h2>
          <p className="text-white/60 font-medium text-lg leading-relaxed max-w-2xl">
            As a Club Manager, you have visibility into every tactical decision, financial transaction, and operational hurdle across your entire roster of squads. This dashboard aggregates live intelligence to help you scale your legacy.
          </p>
          <div className="pt-4 flex gap-4">
            <Button onClick={() => router.push('/club')} className="h-14 px-8 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20">Manage Organization Roster</Button>
            <Button variant="outline" onClick={() => router.push('/pricing')} className="h-14 px-8 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase text-xs">Review Allocation Seats</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
