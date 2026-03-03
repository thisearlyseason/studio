
"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TeamEvent, TournamentGame } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CalendarDays, Trophy, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import BrandLogo from '@/components/BrandLogo';

function calculatePublicStandings(teams: string[], games: TournamentGame[]) {
  const standings = teams.reduce((acc, team) => {
    acc[team] = { name: team, wins: 0, losses: 0, ties: 0, points: 0 };
    return acc;
  }, {} as Record<string, any>);

  games.forEach(game => {
    if (!game.isCompleted) return;
    const t1 = game.team1;
    const t2 = game.team2;
    if (!standings[t1] || !standings[t2]) return;

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

function PublicHubContent() {
  const { teamId, eventId } = useParams();
  const db = useFirestore();
  const [event, setEvent] = useState<TeamEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!teamId || !eventId) return;
      try {
        const snap = await getDoc(doc(db, 'teams', teamId as string, 'events', eventId as string));
        if (snap.exists()) setEvent({ id: snap.id, ...snap.data() } as TeamEvent);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db, teamId, eventId]);

  const standings = useMemo(() => {
    if (!event || !event.isTournamentPaid || !event.tournamentTeams) return [];
    return calculatePublicStandings(event.tournamentTeams, event.tournamentGames || []);
  }, [event]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center font-black">TOURNAMENT NOT FOUND</div>;

  const groupedGames = (event.tournamentGames || []).reduce((acc, g) => {
    if (!acc[g.date]) acc[g.date] = [];
    acc[g.date].push(g);
    return acc;
  }, {} as Record<string, TournamentGame[]>);

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <nav className="h-20 bg-black flex items-center px-6 sticky top-0 z-50">
        <BrandLogo variant="dark-background" className="h-8 w-32" />
      </nav>

      <header className="bg-black text-white py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Badge className="bg-primary text-white font-black uppercase text-[10px] tracking-widest px-4 h-7">Spectator Hub</Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-white/60 font-bold uppercase tracking-widest text-xs">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {format(new Date(event.date), 'MMM dd, yyyy')}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="p-8 border-b bg-muted/30">
              <CardTitle className="text-2xl font-black uppercase tracking-tight">Match Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-12">
              {Object.entries(groupedGames).sort().map(([date, games]) => (
                <div key={date} className="space-y-6">
                  <Badge className="bg-black text-white font-black uppercase text-[10px] px-4 h-7">{format(new Date(date), 'EEEE, MMM d')}</Badge>
                  <div className="grid gap-4">
                    {games.map((game) => (
                      <div key={game.id} className="p-6 bg-muted/30 rounded-3xl border-2 border-transparent hover:border-primary/10 transition-all">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{game.time}</span>
                          {game.isCompleted && <Badge className="text-[8px] font-black uppercase h-5 px-2 bg-black text-white">Final</Badge>}
                        </div>
                        <div className="grid grid-cols-7 items-center gap-4">
                          <div className="col-span-3 text-right">
                            <p className="font-black text-xs uppercase truncate mb-1">{game.team1}</p>
                            <p className="text-4xl font-black text-primary leading-none">{game.score1}</p>
                          </div>
                          <div className="col-span-1 flex items-center justify-center opacity-20 font-black text-[10px]">VS</div>
                          <div className="col-span-3">
                            <p className="font-black text-xs uppercase truncate mb-1">{game.team2}</p>
                            <p className="text-4xl font-black text-primary leading-none">{game.score2}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
          {event.isTournamentPaid && standings.length > 0 && (
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5">
              <CardHeader className="bg-primary text-white p-6">
                <CardTitle className="text-lg font-black uppercase flex items-center gap-2"><Trophy className="h-5 w-5" /> Live Standings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {standings.map((team, i) => (
                  <div key={team.name} className="flex justify-between items-center px-6 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-primary w-4">{i + 1}</span>
                      <span className="text-xs font-black uppercase truncate">{team.name}</span>
                    </div>
                    <Badge variant="outline" className="font-black text-[9px] border-primary/20 text-primary">{team.points} PTS</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-black text-white overflow-hidden p-8 text-center space-y-4">
            <BrandLogo variant="dark-background" className="h-6 w-24 mx-auto opacity-40" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Powered by The Squad</p>
          </Card>
        </aside>
      </main>
    </div>
  );
}

export default function PublicTournamentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PublicHubContent />
    </Suspense>
  );
}
