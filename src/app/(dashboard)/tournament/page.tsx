
"use client";

import React, { useState } from 'react';
import { useTeam, TournamentFormat } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus, LayoutGrid, ArrowRight, Lock, Zap, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TournamentListingPage() {
  const { isPro, purchasePro, createTournament, user } = useTeam();
  const db = useFirestore();
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('single_elim');
  const [isCreating, setIsCreating] = useState(false);

  const tourneysQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, 'tournaments'), orderBy('createdAt', 'desc'));
  }, [db, user?.id]);

  const { data: tournaments } = useCollection(tourneysQuery);

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in fade-in">
        <div className="bg-primary/10 p-10 rounded-[3rem] ring-4 ring-primary/5">
          <Trophy className="h-20 w-20 text-primary" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">Championship Hub</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Tournament brackets and scheduling require a Pro squad tier.</p>
        </div>
        <Button onClick={purchasePro} className="h-14 px-10 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">
          Unlock Brackets
        </Button>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    const tid = await createTournament(name, format, []);
    router.push(`/tournament/${tid}`);
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Tactical Operations</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Tournament Hub</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Professional Brackets & Scoring</p>
        </div>
        
        <Button onClick={() => setIsCreateOpen(true)} className="h-14 px-8 rounded-2xl text-lg font-black shadow-xl shadow-primary/20">
          <Plus className="h-5 w-5 mr-2" /> Launch Tournament
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments?.map((t) => (
          <Card key={t.tourneyId} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5 hover:ring-primary/20 transition-all cursor-pointer group" onClick={() => router.push(`/tournament/${t.tourneyId}`)}>
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">{t.format.replace('_', ' ')}</Badge>
                <Badge className="bg-green-500 text-white border-none text-[8px] font-black uppercase h-5 px-2">{t.status}</Badge>
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight mt-4">{t.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex flex-col justify-between flex-1">
              <div className="flex items-center gap-4 mt-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5" /> {t.teams.length} SQUADS</span>
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
              <Button variant="ghost" className="w-full mt-8 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">Manage Hub</Button>
            </CardContent>
          </Card>
        ))}
        {!tournaments?.length && (
          <div className="col-span-full py-32 text-center bg-muted/10 rounded-[3rem] border-2 border-dashed space-y-6 opacity-40">
            <Trophy className="h-16 w-16 mx-auto text-primary" />
            <div className="space-y-2">
              <p className="text-lg font-black uppercase">No championship brackets found</p>
              <p className="text-xs font-bold uppercase tracking-widest">Launch your first tournament to start tracking elite performance.</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none shadow-2xl">
          <div className="h-2 bg-primary w-full" />
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">New Tournament</DialogTitle>
              <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">Define the competitive protocol</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Event Name</Label>
                <Input placeholder="e.g. Winter Regional 2024" value={name} onChange={e => setName(e.target.value)} className="h-12 rounded-xl font-bold border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Format</Label>
                <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                  <SelectTrigger className="h-12 rounded-xl font-bold border-2"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="single_elim">Single Elimination</SelectItem>
                    <SelectItem value="double_elim">Double Elimination</SelectItem>
                    <SelectItem value="round_robin">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={handleCreate} disabled={isCreating || !name.trim()}>
                Deploy Hub
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
