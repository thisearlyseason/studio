
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  CalendarDays, 
  MapPin, 
  CheckCircle2, 
  ChevronLeft, 
  Clock, 
  Loader2,
  ShieldCheck,
  Zap,
  LayoutGrid
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import BrandLogo from '@/components/BrandLogo';

function calculateStandings(teams: string[], games: any[]) {
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
      standings[t1].wins += 1;
      standings[t1].points += 1;
      standings[t2].losses += 1;
      standings[t2].points -= 1;
    } else if (game.score2 > game.score1) {
      standings[t2].wins += 1;
      standings[t2].points += 1;
      standings[t1].losses += 1;
      standings[t1].points -= 1;
    } else {
      standings[t1].ties += 1;
      standings[t2].ties += 1;
    }
  });

  return Object.values(standings).sort((a, b) => b.points - a.points || b.wins - a.wins);
}

export default function PublicTournamentPage() {
  const { teamId, eventId } = useParams();
  const router = useRouter();
  const db = useFirestore();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!teamId || !eventId) return;
      try {
        const docRef = doc(db, 'teams', teamId as string, 'events', eventId as string);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setEvent({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error("Error loading public tournament data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [db, teamId, eventId]);

  const sortedStandings = useMemo(() => {
    if (!event || !event.tournamentTeams) return [];
    return calculateStandings(event.tournamentTeams, event.tournamentGames || []);
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Syncing Live Results...</p>
      </div>
    );
  }

  if (!event || !event.isTournament) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Zap className="h-16 w-16 text-primary opacity-20" />
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Hub Not Found</h1>
        <p className="text-white/60 font-medium max-w-xs">The tournament link may have expired or is incorrect.</p>
        <Button onClick={() => window.close()} variant="outline" className="border-white/20 text-white">Close Tab</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-primary/20">
      <nav className="bg-black text-white h-20 flex items-center px-6 md:px-12 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto flex items-center justify-between">
          <BrandLogo variant="dark-background" className="h-10 w-40" />
          <div className="flex flex-col items-end">
            <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-widest px-3 h-5 mb-1">Live Tournament Hub</Badge>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Powered by The Squad</p>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">{event.title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" /> {format(new Date(event.date), 'MMMM do, yyyy')}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</span>
            {event.lastUpdated && (
              <span className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-[10px]">
                <Clock className="h-3.5 w-3.5 opacity-40" /> Updated: {format(new Date(event.lastUpdated), 'h:mm a')}
              </span>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Schedule */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="bg-primary/10 p-2 rounded-lg text-primary"><Trophy className="h-5 w-5" /></div>
              <h2 className="text-lg font-black uppercase tracking-tight">Match Schedule</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {event.tournamentGames?.map((game: any) => (
                <Card key={game.id} className="rounded-[2rem] border-none shadow-md overflow-hidden ring-1 ring-black/5 hover:shadow-xl transition-all group">
                  <CardContent className="p-0">
                    <div className="bg-muted/30 px-6 py-3 border-b flex justify-between items-center">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-black/10">{game.date} @ {game.time}</Badge>
                      {game.isCompleted && <Badge className="bg-black text-white text-[9px] font-black uppercase h-5 px-3">Final Result</Badge>}
                    </div>
                    <div className="p-8 flex items-center justify-between gap-8">
                      <div className="flex-1 space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-black text-xs md:text-sm uppercase truncate max-w-[120px]">{game.team1}</p>
                          {game.winnerId === game.team1 && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                        </div>
                        <p className={cn("text-5xl font-black tracking-tighter", game.winnerId === game.team1 ? "text-primary" : "opacity-20")}>{game.score1}</p>
                      </div>
                      <div className="text-xs font-black opacity-10 uppercase tracking-widest">VS</div>
                      <div className="flex-1 space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {game.winnerId === game.team2 && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                          <p className="font-black text-xs md:text-sm uppercase truncate max-w-[120px]">{game.team2}</p>
                        </div>
                        <p className={cn("text-5xl font-black tracking-tighter", game.winnerId === game.team2 ? "text-primary" : "opacity-20")}>{game.score2}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Standings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="bg-black text-white p-2 rounded-lg"><LayoutGrid className="h-5 w-5" /></div>
              <h2 className="text-lg font-black uppercase tracking-tight">Standings</h2>
            </div>
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5">
              <CardContent className="p-0">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Squad</th>
                      <th className="px-4 py-4 text-center">W</th>
                      <th className="px-4 py-4 text-center">L</th>
                      <th className="px-6 py-4 text-right">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/50">
                    {sortedStandings.map((team, idx) => (
                      <tr key={team.name} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-muted-foreground/40 w-4">{idx + 1}</span>
                            <span className="font-black text-xs uppercase truncate max-w-[100px] group-hover:text-primary transition-colors">{team.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center font-bold text-xs">{team.wins}</td>
                        <td className="px-4 py-5 text-center font-bold text-xs text-muted-foreground">{team.losses}</td>
                        <td className="px-6 py-5 text-right font-black text-primary text-sm">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 -rotate-12"><Trophy className="h-24 w-24" /></div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-none relative z-10">Coordinate <br />Success.</h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest relative z-10">Real-time brackets, live scores, and elite tactical control.</p>
              <Button onClick={() => router.push('/')} variant="secondary" className="w-full h-12 rounded-xl font-black bg-white text-primary hover:bg-white/90 relative z-10">
                Join The Squad
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-6 text-center space-y-4">
          <BrandLogo variant="light-background" className="h-8 w-32 mx-auto" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Elite Coordination for Professional Squads • © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
