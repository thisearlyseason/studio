
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  MapPin, 
  Trophy, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Table as TableIcon
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import BrandLogo from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

export default function SpectatorHubPage() {
  const { teamId, eventId } = useParams();
  const db = useFirestore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId || !eventId || !db) return;

    // Use onSnapshot for real-time score updates
    const unsub = onSnapshot(doc(db, 'teams', teamId as string, 'events', eventId as string), (snap) => {
      if (snap.exists()) {
        setEvent({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }, (err) => {
      console.error("Public load error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [db, teamId, eventId]);

  const formatDateRange = (start: string | Date, end?: string | Date) => {
    const startDate = new Date(start);
    if (!end) return format(startDate, 'MMM dd, yyyy');
    const endDate = new Date(end);
    if (isSameDay(startDate, endDate)) return format(startDate, 'MMM dd, yyyy');
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const calculateStandings = (teams: string[], games: any[]) => {
    const standings = teams.reduce((acc, team) => {
      acc[team] = { name: team, wins: 0, losses: 0, ties: 0, points: 0 };
      return acc;
    }, {} as Record<string, any>);

    games.forEach(game => {
      if (!game.isCompleted) return;
      const t1 = game.team1;
      const t2 = game.team2;
      if (!standings[t1]) standings[t1] = { name: t1, wins: 0, losses: 0, ties: 0, points: 0 };
      if (!standings[t2]) standings[t2] = { name: t2, wins: 0, losses: 0, ties: 0, points: 0 };

      if (game.score1 > game.score2) {
        standings[t1].wins += 1; standings[t1].points += 1;
        standings[t2].losses += 1; standings[t2].points -= 1;
      } else if (game.score2 > game.score1) {
        standings[t2].wins += 1; standings[t2].points += 1;
        standings[t1].losses += 1; standings[t1].points -= 1;
      } else {
        standings[t1].ties += 1; standings[t2].ties += 1;
      }
    });

    return Object.values(standings).sort((a, b) => b.points - a.points || b.wins - a.wins);
  };

  const standings = useMemo(() => {
    if (!event?.tournamentTeams || !event?.tournamentGames) return [];
    return calculateStandings(event.tournamentTeams, event.tournamentGames);
  }, [event]);

  const groupedGames = useMemo(() => {
    if (!event?.tournamentGames) return {};
    const groups: Record<string, any[]> = {};
    [...event.tournamentGames]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(game => {
        if (!groups[game.date]) groups[game.date] = [];
        groups[game.date].push(game);
      });
    return groups;
  }, [event?.tournamentGames]);

  if (loading) return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-4">Opening Spectator Hub...</p>
    </div>
  );

  if (!event || !event.isTournamentPaid) return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
      <BrandLogo variant="light-background" className="h-10 w-40 mb-10" />
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-4 max-w-md ring-1 ring-black/5">
        <ShieldAlert className="h-12 w-12 text-primary mx-auto opacity-20" />
        <h2 className="text-2xl font-black uppercase tracking-tight">Hub Not Active</h2>
        <p className="text-sm font-bold text-muted-foreground uppercase leading-relaxed">
          The requested tournament hub is either private or has not been activated for public spectators.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-black text-white py-10 px-6">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <BrandLogo variant="dark-background" className="h-8 w-32 justify-start" />
            <Badge className="bg-primary text-white border-none font-black text-[10px] h-6 px-4 uppercase tracking-widest">Live Hub</Badge>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/60">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {formatDateRange(event.date, event.endDate)}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl -mt-8 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Match Schedule */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl ring-1 ring-black/5 p-8 md:p-10 space-y-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary"><CalendarDays className="h-5 w-5" /></div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Match Schedule</h2>
            </div>

            <div className="space-y-12">
              {Object.entries(groupedGames).map(([date, games]) => (
                <div key={date} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-black text-white font-black uppercase text-[10px] px-4 h-7 shadow-lg">
                      {format(new Date(date), 'EEEE, MMM d')}
                    </Badge>
                    <div className="h-px bg-muted flex-1" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {games.map((game) => (
                      <div key={game.id} className="p-6 bg-muted/20 rounded-3xl border shadow-sm transition-all text-left relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-4">
                          <Badge variant="outline" className="text-[10px] font-black uppercase border-black/10 tracking-widest px-3 h-6">{game.time}</Badge>
                          {game.isCompleted && <Badge className="text-[10px] font-black uppercase h-6 px-3 bg-primary text-white">Final Result</Badge>}
                        </div>
                        <div className="grid grid-cols-7 items-center gap-4">
                          <div className="col-span-3 text-right">
                            <div className="flex items-center justify-end gap-2 mb-1">
                              <p className="font-black text-sm uppercase truncate">{game.team1}</p>
                              {game.winnerId === game.team1 && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                            </div>
                            <p className="text-4xl font-black text-primary leading-none">{game.score1}</p>
                          </div>
                          <div className="col-span-1 flex items-center justify-center opacity-20 font-black text-xs uppercase">VS</div>
                          <div className="col-span-3">
                            <div className="flex items-center gap-2 mb-1">
                              {game.winnerId === game.team2 && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                              <p className="font-black text-sm uppercase truncate">{game.team2}</p>
                            </div>
                            <p className="text-4xl font-black text-primary leading-none">{game.score2}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Standings */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-black/5 overflow-hidden bg-black text-white">
            <CardHeader className="bg-primary/5 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-black uppercase">Live Standings</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {standings.map((team, idx) => (
                  <div key={team.name} className="flex justify-between items-center px-8 py-5 group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-xs font-black text-primary w-4">{idx + 1}</span>
                      <p className="text-sm font-black uppercase truncate pr-4">{team.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-primary leading-none">{team.points}</p>
                      <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Points</p>
                    </div>
                  </div>
                ))}
              </div>
              {standings.length === 0 && (
                <div className="p-10 text-center space-y-2 opacity-40">
                  <TableIcon className="h-8 w-8 mx-auto" />
                  <p className="text-[10px] font-black uppercase">Syncing results...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-primary p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl shadow-primary/20">
            <Zap className="h-8 w-8 text-white/40" />
            <h3 className="text-xl font-black uppercase leading-tight">Coordinating a team?</h3>
            <p className="text-xs font-bold text-white/80 uppercase leading-relaxed">Join The Squad to manage schedules, tactical chats, and elite performance tracking for your own team.</p>
            <button className="w-full h-12 bg-white text-primary font-black uppercase text-[10px] rounded-xl tracking-widest shadow-lg">Get Started Free</button>
          </div>
        </aside>
      </main>

      <footer className="mt-20 py-10 border-t bg-white text-center">
        <div className="container mx-auto px-6 space-y-4">
          <BrandLogo variant="light-background" className="h-6 w-24 mx-auto opacity-40" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Built for Champions • Powered by The Squad</p>
        </div>
      </footer>
    </div>
  );
}
