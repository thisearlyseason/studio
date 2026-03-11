"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Plus, 
  MapPin, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Clock, 
  ShieldCheck,
  Zap,
  Users,
  LayoutGrid,
  Filter,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useTeam, TeamEvent } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { format, isPast, isSameDay } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function TournamentsPage() {
  const { activeTeam, isStaff, isSuperAdmin, hasFeature, purchasePro } = useTeam();
  const db = useFirestore();
  const router = useRouter();
  
  const [filterMode, setFilterMode] = useState<'live' | 'past'>('live');

  const tournamentsQuery = useMemoFirebase(() => {
    if (!activeTeam?.id || !db) return null;
    return query(
      collection(db, 'teams', activeTeam.id, 'events'),
      where('isTournament', '==', true),
      orderBy('date', 'asc')
    );
  }, [activeTeam?.id, db]);

  const { data: allTournaments, isLoading } = useCollection<TeamEvent>(tournamentsQuery);

  const filteredTournaments = useMemo(() => {
    const now = new Date();
    const list = allTournaments || [];
    if (filterMode === 'live') return list.filter(e => !isPast(new Date(e.date)) || isSameDay(new Date(e.date), now));
    return list.filter(e => isPast(new Date(e.date)) && !isSameDay(new Date(e.date), now)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTournaments, filterMode]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Opening Tournament Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Competitive Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Tournaments</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Strategic Bracket Management</p>
        </div>
        
        {isStaff && (
          <Button onClick={() => router.push('/events')} className="h-14 px-8 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 active:scale-95 transition-all">
            <Plus className="h-5 w-5 mr-2" /> Launch Series
          </Button>
        )}
      </div>

      <div className="flex bg-muted/50 p-1.5 rounded-2xl border-2 w-fit">
        <Button 
          variant={filterMode === 'live' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setFilterMode('live')} 
          className="h-9 px-6 rounded-xl font-black text-[10px] uppercase transition-all"
        >
          Live Series
        </Button>
        <Button 
          variant={filterMode === 'past' ? 'default' : 'ghost'} 
          size="sm" 
          onClick={() => setFilterMode('past')} 
          className="h-9 px-6 rounded-xl font-black text-[10px] uppercase transition-all"
        >
          Historical
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredTournaments.length > 0 ? filteredTournaments.map((tournament) => (
          <Card key={tournament.id} className="rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-black/5 bg-white group cursor-pointer" onClick={() => router.push('/events')}>
            <div className="flex flex-col md:flex-row items-stretch h-full">
              <div className="w-full md:w-32 bg-black text-white flex flex-col items-center justify-center p-6 border-r shrink-0 group-hover:bg-primary transition-colors">
                <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">{format(new Date(tournament.date), 'MMM')}</span>
                <span className="text-4xl font-black tracking-tighter">{format(new Date(tournament.date), 'dd')}</span>
              </div>
              <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/5 text-primary border-none font-black text-[8px] uppercase px-2 h-5">Verified Series</Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> {tournament.startTime}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-primary transition-colors uppercase">{tournament.title}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-primary" /> {tournament.location}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 bg-muted/30 px-5 py-3 rounded-2xl border">
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-black uppercase text-muted-foreground mb-0.5">Participating</span>
                      <span className="text-lg font-black leading-none">{tournament.tournamentTeams?.length || 0} Squads</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full h-14 w-14 hover:bg-primary hover:text-white shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-all">
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )) : (
          <div className="text-center py-24 bg-muted/10 rounded-[3rem] border-2 border-dashed space-y-6 opacity-40">
            <div className="bg-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-2xl uppercase tracking-tight">No Active Series</p>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Time to establish your next tournament victory.</p>
            </div>
          </div>
        )}
      </div>

      <Card className="rounded-[3rem] border-none shadow-2xl bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 pointer-events-none">
          <Zap className="h-48 w-48" />
        </div>
        <CardContent className="p-12 relative z-10 space-y-6">
          <Badge className="bg-primary text-white border-none font-black text-[10px] px-4 h-7 shadow-lg shadow-primary/40">Elite Protocol</Badge>
          <h2 className="text-4xl font-black tracking-tight leading-tight uppercase">Tournament Management</h2>
          <p className="text-white/60 font-medium text-lg leading-relaxed max-w-2xl">
            This module provides total operational control over championship series. Coordinate brackets, verify scores, and manage multi-team logistical hubs from a single unified tactical dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
