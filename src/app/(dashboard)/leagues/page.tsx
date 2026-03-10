
"use client";

import React, { useState, useMemo } from 'react';
import { useTeam, League, Member } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  Trophy, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  LayoutGrid, 
  Users,
  Search,
  ChevronRight,
  Target,
  Globe,
  Loader2,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  Table as TableIcon,
  Filter,
  Eye,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, collectionGroup } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

function RosterScoutTool({ teamId, teamName }: { teamId: string, teamName: string }) {
  const db = useFirestore();
  const scoutQuery = useMemoFirebase(() => {
    if (!db || !teamId) return null;
    return query(collection(db, 'teams', teamId, 'members'), orderBy('name', 'asc'));
  }, [db, teamId]);

  const { data: roster, isLoading } = useCollection<Member>(scoutQuery);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
          <Eye className="h-3 w-3 mr-1.5" /> Scout Roster
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none shadow-2xl overflow-hidden p-0">
        <div className="h-2 bg-primary w-full" />
        <div className="p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">{teamName}</DialogTitle>
            <DialogDescription className="font-bold text-primary uppercase text-[10px] tracking-widest">Tactical Roster Audit</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-72 mt-6 bg-muted/30 rounded-2xl p-4 border-2 border-dashed">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
            ) : roster && roster.length > 0 ? (
              <div className="space-y-2">
                {roster.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-lg border shadow-inner"><AvatarFallback className="font-black text-[10px] bg-muted">{m.name[0]}</AvatarFallback></Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase truncate leading-none mb-1">{m.name}</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">{m.position}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-4 font-black border-primary/20 text-primary">#{m.jersey || '??'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 opacity-30"><Users className="h-8 w-8 mx-auto mb-2" /><p className="text-[10px] font-black uppercase">No personnel detected</p></div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LeagueHubPage() {
  const { isLeagueManager, isClubManager, purchasePro, user, teams, hasFeature } = useTeam();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const canManageLeagues = hasFeature('leagues');

  const leaguesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leagues'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: rawLeagues, isLoading } = useCollection<League>(leaguesQuery);
  const allLeagues = useMemo(() => rawLeagues || [], [rawLeagues]);

  const myManagedLeagues = useMemo(() => 
    allLeagues.filter(l => l.creatorId === user?.id), 
  [allLeagues, user?.id]);

  const availableLeagues = useMemo(() => 
    allLeagues.filter(l => l.creatorId !== user?.id && (l.isPublic || l.status === 'active')),
  [allLeagues, user?.id]);

  const filteredManaged = useMemo(() => 
    myManagedLeagues.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [myManagedLeagues, searchTerm]);

  if (!canManageLeagues) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in fade-in duration-700">
        <div className="relative">
          <div className="bg-primary/10 p-10 rounded-[3rem] ring-4 ring-primary/5">
            <Shield className="h-20 w-20 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 bg-black text-white p-3 rounded-full shadow-lg border-4 border-background">
            <Lock className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-4 max-w-md mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">League Hub Locked</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs leading-relaxed">
            Multi-squad standings and recruitment ledgers require an Elite League subscription tier.
          </p>
        </div>
        <Button onClick={purchasePro} className="h-14 px-10 rounded-2xl font-black uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
          Upgrade to Elite League
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Competitive headquarters</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Strategic Hub</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Managed Recruitment & Competitive Standings</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tactical search..." 
              className="pl-9 h-12 rounded-xl bg-muted/50 border-none font-bold text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => router.push('/leagues/new')} className="h-12 px-8 rounded-xl font-black uppercase text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all">
            <Plus className="h-4 w-4 mr-2" /> Launch Hub
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Managed Tactical Hubs</h2>
              <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">{myManagedLeagues.length} TOTAL</Badge>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>
              ) : filteredManaged.length > 0 ? filteredManaged.map((league) => (
                <Card key={league.id} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5 hover:ring-primary/20 transition-all cursor-pointer group" onClick={() => router.push(`/leagues/registration/${league.id}`)}>
                  <CardContent className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <Shield className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{league.name}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{league.sport}</span>
                          <Badge variant="secondary" className="h-5 text-[8px] font-black px-2 shadow-sm">{Object.keys(league.teams || {}).length} ENROLLED SQUADS</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase text-muted-foreground opacity-60">Recruitment</span>
                        <span className="text-xs font-black text-primary uppercase">Portal Active</span>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-2 border-dashed space-y-4 opacity-40">
                  <Shield className="h-12 w-12 mx-auto" />
                  <p className="text-sm font-black uppercase tracking-widest">No managed hubs established.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Available Global Challenges</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {availableLeagues.map((league) => (
                <Card key={league.id} className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden ring-1 ring-black/5 group hover:shadow-xl transition-all">
                  <div className="h-1.5 w-full bg-muted group-hover:bg-primary transition-colors" />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">{league.sport}</Badge>
                      <Badge className="bg-black text-white h-5 text-[8px] font-black uppercase">{league.status || 'Active'}</Badge>
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight truncate">{league.name}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Managed ID: {league.id.slice(-6)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-2 hover:bg-primary hover:text-white transition-all"
                      onClick={() => router.push(`/register/league/${league.id}`)}
                    >
                      Enter Enrollment Portal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-black text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Trophy className="h-48 w-48" />
            </div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="space-y-1">
                <Badge className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-[0.2em] px-3">Elite Tier</Badge>
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9]">Master <br />Coordination.</h3>
              </div>
              <p className="text-white/60 text-sm font-medium leading-relaxed">
                Admins manage public enrollment, automated squad assignments, and institutional payment verification within the hub.
              </p>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary"><Target className="h-4 w-4" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Roster Scout Tool</span>
                </div>
                <p className="text-[10px] font-medium leading-relaxed italic text-white/40">Analyze opponent lineups and team capacity across the hub ledger.</p>
              </div>
              <Button variant="secondary" className="w-full h-12 rounded-xl font-black uppercase text-[10px] bg-white text-black hover:bg-white/90 shadow-lg" onClick={() => router.push('/how-to')}>Review Manual</Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden ring-1 ring-black/5">
            <CardHeader className="bg-muted/30 border-b p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Metrics</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Total Hubs</p>
                  <p className="text-2xl font-black">{allLeagues.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Active Talent</p>
                  <p className="text-2xl font-black">5.2k+</p>
                </div>
              </div>
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium leading-relaxed text-muted-foreground italic">Public hubs are discoverable across the global coordination ledger.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
