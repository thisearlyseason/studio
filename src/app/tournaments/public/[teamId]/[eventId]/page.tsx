
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, CalendarDays, MapPin, Loader2, Share2, CheckCircle2 } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import BrandLogo from '@/components/BrandLogo';
import { ScrollArea } from '@/components/ui/scroll-area';

const formatDateRange = (start: string | Date, end?: string | Date) => {
  const startDate = new Date(start);
  if (!end) return format(startDate, 'MMM dd');
  const endDate = new Date(end);
  if (isSameDay(startDate, endDate)) return format(startDate, 'MMM dd');
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
};

export default function PublicSpectatorPage() {
  const { teamId, eventId } = useParams();
  const db = useFirestore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      if (!teamId || !eventId) return;
      try {
        const docSnap = await getDoc(doc(db, 'teams', teamId as string, 'events', eventId as string));
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error("Error loading tournament:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [db, teamId, eventId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Opening Spectator Hub...</p>
    </div>
  );

  if (!event || !event.isTournamentPaid) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-md w-full text-center p-10 rounded-[2.5rem] shadow-xl border-none">
        <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Hub Not Found</h2>
        <p className="text-muted-foreground mt-2 font-medium">This tournament may be private or has not yet enabled public spectator access.</p>
      </Card>
    </div>
  );

  const groupedGames = (event.tournamentGames || []).reduce((acc: any, game: any) => {
    if (!acc[game.date]) acc[game.date] = [];
    acc[game.date].push(game);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <nav className="bg-black text-white p-6 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto flex items-center justify-between">
          <BrandLogo variant="dark-background" className="h-8 w-32" />
          <Badge className="bg-primary text-white border-none font-black uppercase text-[8px] tracking-widest px-3 h-6">Live Spectator Hub</Badge>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-10 space-y-10">
        <header className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatDateRange(event.date, event.endDate)}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{event.location}</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary ml-1">Official Match Schedule</h3>
            <div className="space-y-12">
              {Object.entries(groupedGames).map(([date, games]: any) => (
                <div key={date} className="space-y-6">
                  <Badge className="bg-black text-white font-black uppercase text-[10px] px-4 h-7">{format(new Date(date), 'EEEE, MMM d')}</Badge>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((game: any) => (
                      <Card key={game.id} className="p-6 rounded-[2rem] border-none shadow-md ring-1 ring-black/5 bg-white relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <Badge variant="outline" className="text-[8px] font-black border-black/10 px-2 h-5">{game.time}</Badge>
                          {game.isCompleted && <Badge className="text-[8px] font-black h-5 px-2 bg-black text-white">Final</Badge>}
                        </div>
                        <div className="grid grid-cols-7 items-center gap-4">
                          <div className="col-span-3 text-right">
                            <p className="font-black text-xs uppercase truncate mb-1">{game.team1}</p>
                            <p className="text-3xl font-black text-primary leading-none">{game.score1}</p>
                          </div>
                          <div className="col-span-1 flex items-center justify-center opacity-20 font-black text-[10px]">VS</div>
                          <div className="col-span-3">
                            <p className="font-black text-xs uppercase truncate mb-1">{game.team2}</p>
                            <p className="text-3xl font-black text-primary leading-none">{game.score2}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary ml-1">Tournament Ledger</h3>
            <Card className="rounded-[2.5rem] border-none shadow-xl ring-1 ring-black/5 bg-white overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Coordinated By</p>
                  <p className="text-lg font-black uppercase tracking-tight">Official Host Squad</p>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Updates Enabled</p>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">Scores are verified by on-site officials and updated in real-time across the regional coordination network.</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
