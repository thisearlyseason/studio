
"use client";

import React, { useState } from 'react';
import { useTeam } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Trophy, ArrowRight, Lock, Sparkles, LayoutGrid, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

export default function LeagueHubPage() {
  const { isLeagueManager, isClubManager, purchasePro, user } = useTeam();
  const db = useFirestore();
  const router = useRouter();

  const leaguesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leagues'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: leagues, isLoading } = useCollection(leaguesQuery);

  if (!isLeagueManager && !isClubManager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in fade-in">
        <div className="bg-primary/10 p-10 rounded-[3rem] ring-4 ring-primary/5">
          <Shield className="h-20 w-20 text-primary" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">League Hub Locked</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">League management requires an Elite League subscription tier.</p>
        </div>
        <Button onClick={purchasePro} className="h-14 px-10 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">
          Upgrade to Elite League
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Master Coordination</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">League Center</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Official Multi-Team Coordination Hub</p>
        </div>
        
        <Button onClick={() => toast({ title: "Module Under Maintenance", description: "League creation is being optimized." })} className="h-14 px-8 rounded-2xl text-lg font-black shadow-xl shadow-primary/20">
          <Plus className="h-5 w-5 mr-2" /> Start New League
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {leagues?.length ? (
            leagues.map((league) => (
              <Card key={league.id} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5 hover:ring-primary/20 transition-all cursor-pointer group" onClick={() => router.push(`/leagues/registration/${league.id}`)}>
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Shield className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">{league.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{league.sport}</span>
                        <Badge variant="secondary" className="h-5 text-[8px] font-black px-2">{Object.keys(league.teams || {}).length} SQUADS</Badge>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-2 border-dashed space-y-4 opacity-40">
              <Shield className="h-12 w-12 mx-auto" />
              <p className="text-sm font-black uppercase tracking-widest">No active leagues recorded</p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <Card className="rounded-[2rem] border-none shadow-2xl bg-black text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 pointer-events-none">
              <Trophy className="h-32 w-32" />
            </div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="space-y-1">
                <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-[0.2em] px-3">Protocol</Badge>
                <h3 className="text-2xl font-black uppercase tracking-tight">Recruitment Ledgers</h3>
              </div>
              <p className="text-white/60 text-sm font-medium leading-relaxed">
                Admins can now manage public signups, automated squad assignments, and institutional payment verification directly within the hub.
              </p>
              <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase text-[10px] bg-white text-black" onClick={() => router.push('/how-to')}>Review Manual</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
