
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  CalendarDays,
  Trophy,
  CheckCircle2,
  Table as TableIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TeamEvent, TournamentGame } from '@/components/providers/team-provider';
import { format, isSameDay } from 'date-fns';
import BrandLogo from '@/components/BrandLogo';

const formatDateRange = (start: string | Date, end?: string | Date) => {
  const startDate = new Date(start);
  if (!end) return format(startDate, 'MMM dd');
  const endDate = new Date(end);
  if (isSameDay(startDate, endDate)) return format(startDate, 'MMM dd');
  
  if (startDate.getMonth() === endDate.getMonth()) {
    return `${format(startDate, 'MMM d')}-${format(endDate, 'd')}`;
  }
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
};

function calculateTournamentStandings(teams: string[], games: TournamentGame[]) {
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
}

function PublicTournamentView() {
  const { teamId, eventId } = useParams();
  const db = useFirestore();
  const [event, setEvent] = useState<TeamEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      if (!teamId || !eventId) return;
      try {
        const snap = await getDoc(doc(db, 'teams', teamId as string, 'events', eventId as string));
        if (snap.exists() && (snap.data().isTournament || snap.data().isTournamentPaid)) {
          setEvent({ id: snap.id, ...snap.data() } as TeamEvent);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [db, teamId, eventId]);

  const standings = useMemo(() => {
    if (!event || !event.tournamentTeams) return [];
    return calculateTournamentStandings(event.tournamentTeams, event.tournamentGames || []);
  }, [event]);

  const groupedGames = useMemo(() => {
    if (!event?.tournamentGames) return {};
    const groups: Record<string, TournamentGame[]> = {};
    [...event.tournamentGames]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach(game => {
        if (!groups[game.date]) groups[game.date] = [];
        groups[game.date].push(game);
      });
    return groups;
  }, [event]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center p-6"><Card className="max-w-md w-full text-center p-8"><AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" /><h2 className="text-xl font-bold">Tournament Not Found</h2></Card></div>;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <nav className="bg-black text-white py-6 border-b border-white/10">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <BrandLogo variant="dark-background" className="h-8 w-32" />
          <Badge className="bg-primary text-white border-none font-black uppercase text-[10px] px-4 h-7">Live Spectator Hub</Badge>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <Badge className="bg-black text-white border-none font-black uppercase text-[9px] px-3 h-6">Official Event</Badge>
              <h1 className="text-5xl font-black tracking-tighter leading-[0.9] uppercase">{event.title}</h1>
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 font-bold text-muted-foreground"><CalendarDays className="h-5 w-5 text-primary" /><span>{formatDateRange(event.date, event.endDate)}</span></div>
                <div className="flex items-center gap-3 font-bold text-muted-foreground"><MapPin className="h-5 w-5 text-primary" /><span>{event.location}</span></div>
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1"><Trophy className="h-4 w-4 text-primary" /><h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Global Standings</h3></div>
              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5">
                <CardContent className="p-0">
                  {standings.length > 0 ? standings.map((team, i) => (
                    <div key={team.name} className="flex justify-between items-center px-6 py-5 border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4"><span className="text-[10px] font-black text-primary w-4">{i + 1}</span><span className="text-sm font-black uppercase truncate">{team.name}</span></div>
                      <Badge className="bg-primary text-white border-none font-black text-[10px] px-3 h-6">{team.points} PTS</Badge>
                    </div>
                  )) : <div className="p-10 text-center text-xs font-bold text-muted-foreground italic uppercase">No match data synced</div>}
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-2"><div className="flex items-center gap-2"><TableIcon className="h-5 w-5 text-primary" /><h2 className="text-xl font-black uppercase tracking-tight">Match Schedule</h2></div></div>
            <div className="space-y-12">
              {Object.entries(groupedGames).map(([date, games]) => (
                <div key={date} className="space-y-6">
                  <div className="flex items-center gap-4 px-2"><Badge className="bg-black text-white font-black uppercase text-[10px] px-4 h-7 shadow-lg">{format(new Date(date), 'EEEE, MMM d')}</Badge><div className="h-px bg-muted flex-1" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {games.map((game) => (
                      <Card key={game.id} className="p-6 rounded-[2rem] border-none shadow-md ring-1 ring-black/5 bg-white">
                        <div className="flex justify-between items-center mb-6"><Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest">{game.time}</Badge>{game.isCompleted && <Badge className="bg-black text-white border-none text-[9px] font-black uppercase px-2 h-5">Final</Badge>}</div>
                        <div className="grid grid-cols-7 items-center gap-4">
                          <div className="col-span-3 text-right"><p className="font-black text-xs uppercase truncate mb-1">{game.team1}</p><p className="text-4xl font-black text-primary leading-none">{game.score1}</p></div>
                          <div className="col-span-1 flex items-center justify-center opacity-20 font-black text-[10px]">VS</div>
                          <div className="col-span-3"><p className="font-black text-xs uppercase truncate mb-1">{game.team2}</p><p className="text-4xl font-black text-primary leading-none">{game.score2}</p></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PublicTournamentPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><PublicTournamentView /></Suspense>;
}
