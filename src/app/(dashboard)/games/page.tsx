
"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Plus, MapPin, Calendar, Info, TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTeam, GameResult } from '@/components/providers/team-provider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function GamesPage() {
  const { activeTeam, games, addGame, user } = useTeam();
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeTeam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
        <div className="h-12 w-12 bg-primary/10 rounded-full mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading scoreboard...</p>
      </div>
    );
  }

  const isAdmin = activeTeam.membersMap?.[user?.id || ''] === 'Admin';

  const wins = games.filter(g => g.result === 'Win').length;
  const losses = games.filter(g => g.result === 'Loss').length;
  const ties = games.filter(g => g.result === 'Tie').length;

  const handleRecordGame = () => {
    if (!opponent || !date || !myScore || !opponentScore) return;

    const myS = parseInt(myScore);
    const oppS = parseInt(opponentScore);
    let result: GameResult = 'Tie';
    if (myS > oppS) result = 'Win';
    if (myS < oppS) result = 'Loss';

    addGame({
      opponent,
      date: new Date(date),
      myScore: myS,
      opponentScore: oppS,
      result,
      location,
      notes
    });

    setIsRecordOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setOpponent(''); setDate(''); setMyScore(''); setOpponentScore(''); setLocation(''); setNotes('');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Games & Results</h1>
          <p className="text-muted-foreground text-sm font-medium">Track your squad's season progress.</p>
        </div>
        {isAdmin && (
          <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Record Game
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record Game Result</DialogTitle>
                <DialogDescription>Enter the details of a completed match.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Opponent Name</Label>
                  <Input placeholder="e.g. Riverside Rovers" value={opponent} onChange={e => setOpponent(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Location</Label><Input placeholder="Arena/Field" value={location} onChange={e => setLocation(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{activeTeam.name} Score</Label><Input type="number" value={myScore} onChange={e => setMyScore(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Opponent Score</Label><Input type="number" value={opponentScore} onChange={e => setOpponentScore(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Notes / Summary</Label><Textarea placeholder="Highlights or MVPs..." value={notes} onChange={e => setNotes(e.target.value)} /></div>
              </div>
              <DialogFooter>
                <Button className="w-full h-12 rounded-xl text-base font-bold" onClick={handleRecordGame}>Post Result</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-none shadow-sm bg-green-50/50 dark:bg-green-950/20">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-1">Wins</div>
            <div className="text-3xl font-black text-green-600">{wins}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">Losses</div>
            <div className="text-3xl font-black text-red-600">{losses}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4 text-center">
            <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Ties</div>
            <div className="text-3xl font-black text-blue-600">{ties}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Recent Match History</h2>
        {games.length > 0 ? games.map((game) => (
          <Card key={game.id} className="overflow-hidden border-none shadow-sm ring-1 ring-black/5 rounded-3xl hover:shadow-md transition-all">
            <CardContent className="p-0 flex items-stretch">
              <div className={cn(
                "w-3 shrink-0",
                game.result === 'Win' ? "bg-green-500" : game.result === 'Loss' ? "bg-red-500" : "bg-blue-500"
              )} />
              <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Vs. Opponent</span>
                      {game.result === 'Win' && <Badge className="bg-green-500 h-4 text-[9px] uppercase">Victory</Badge>}
                    </div>
                    <h3 className="text-xl font-bold">{game.opponent}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{activeTeam.name[0]}</span>
                      <span className="text-2xl font-black">{game.myScore}</span>
                    </div>
                    <div className="text-muted-foreground font-black text-xl">:</div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{game.opponent[0]}</span>
                      <span className="text-2xl font-black">{game.opponentScore}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-y-2 gap-x-5 pt-2 border-t border-muted/50 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {game.date.toLocaleDateString()}</div>
                  {game.location && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {game.location}</div>}
                  {game.result === 'Win' ? (
                    <div className="flex items-center gap-1.5 text-green-600"><TrendingUp className="h-3 w-3" /> Win</div>
                  ) : game.result === 'Loss' ? (
                    <div className="flex items-center gap-1.5 text-red-600"><TrendingDown className="h-3 w-3" /> Loss</div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-blue-600"><MinusCircle className="h-3 w-3" /> Draw</div>
                  )}
                </div>

                {game.notes && (
                  <div className="bg-muted/30 p-3 rounded-2xl">
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">"{game.notes}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-[2.5rem] space-y-4">
            <Trophy className="h-12 w-12 text-muted-foreground opacity-20 mx-auto" />
            <div>
              <p className="font-bold text-lg">No games recorded yet</p>
              <p className="text-sm text-muted-foreground">Start tracking your season performance.</p>
            </div>
            {isAdmin && <Button variant="outline" className="rounded-full" onClick={() => setIsRecordOpen(true)}>Record First Game</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
