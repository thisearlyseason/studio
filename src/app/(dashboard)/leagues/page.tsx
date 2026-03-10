
"use client";

import React, { useState, useMemo } from 'react';
import { useTeam, League, LeagueInvite, Member } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Trophy, 
  UserPlus, 
  Plus, 
  ChevronRight, 
  Mail, 
  Search, 
  Zap, 
  Loader2,
  Users,
  ClipboardList,
  ArrowUpRight,
  Info,
  MessageSquare
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

function TeamRosterScout({ teamId, teamName, isOpen, onOpenChange }: { teamId: string | null, teamName: string | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const db = useFirestore();
  
  const rosterQuery = useMemoFirebase(() => {
    if (!teamId || !db || teamId.startsWith('manual_')) return null;
    return query(collection(db, 'teams', teamId, 'members'), orderBy('name', 'asc'));
  }, [teamId, db]);

  const { data: roster, isLoading } = useCollection<Member>(rosterQuery);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none shadow-2xl overflow-hidden p-0 bg-white">
        <div className="h-2 bg-primary w-full" />
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase">{teamName} Roster</DialogTitle>
            <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">
              Strategic Personnel Audit
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] pr-4">
            {teamId?.startsWith('manual_') ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center opacity-40">
                <Info className="h-10 w-10" />
                <p className="text-[10px] font-black uppercase tracking-widest">Roster scouting unavailable for external manual squads.</p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scouting Roster...</p>
              </div>
            ) : roster && roster.length > 0 ? (
              <div className="space-y-3">
                {roster.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                    <Avatar className="h-10 w-10 rounded-xl border shadow-sm shrink-0">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="font-black text-xs">{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm truncate leading-none mb-1">{member.name}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{member.position}</p>
                    </div>
                    {member.jersey && <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">#{member.jersey}</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 opacity-30">
                <Users className="h-10 w-10 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Roster data protected or empty.</p>
              </div>
            )}
          </ScrollArea>
          
          <Button className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest" onClick={() => onOpenChange(false)}>Close Scout Hub</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LeaguesPage() {
  const { activeTeam, user, createLeague, inviteTeamToLeague, manuallyAddTeamToLeague, acceptLeagueInvite, isStaff, createChat } = useTeam();
  const db = useFirestore();
  const router = useRouter();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [manualTeamName, setManualTeamName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scoutTeamId, setScoutTeamId] = useState<string | null>(null);
  const [scoutTeamName, setScoutTeamName] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Explicit collection-level query for query-safe rules
  const allLeaguesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'leagues'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: leaguesData, isLoading: isLeaguesLoading } = useCollection<League>(allLeaguesQuery);
  
  const { myLeagues, otherLeagues } = useMemo(() => {
    const all = leaguesData || [];
    const my = all.filter(l => l.teams && activeTeam && l.teams[activeTeam.id]);
    const others = all.filter(l => !activeTeam || !l.teams || !l.teams[activeTeam.id]);
    return { myLeagues: my, otherLeagues: others };
  }, [leaguesData, activeTeam]);

  const invitesQuery = useMemoFirebase(() => {
    if (!user?.email || !db) return null;
    return query(
      collection(db, 'leagues', 'global', 'invites'), 
      where('invitedEmail', '==', user.email.toLowerCase()), 
      where('status', '==', 'pending')
    );
  }, [user?.email, db]);

  const { data: rawInvites } = useCollection<LeagueInvite>(invitesQuery);
  const invites = useMemo(() => rawInvites || [], [rawInvites]);

  const handleCreateLeague = async () => {
    if (!leagueName.trim()) return;
    setIsProcessing(true);
    await createLeague(leagueName);
    setIsCreateOpen(false);
    setLeagueName('');
    setIsProcessing(false);
    toast({ title: "Hub Established", description: `${leagueName} is now active.` });
  };

  const handleSendInvite = async (leagueId: string, lName: string) => {
    if (!inviteEmail.trim()) return;
    setIsProcessing(true);
    await inviteTeamToLeague(leagueId, lName, inviteEmail.toLowerCase());
    setIsInviteOpen(false);
    setInviteEmail('');
    setIsProcessing(false);
    toast({ title: "Invite Dispatched", description: `Challenge sent to ${inviteEmail}.` });
  };

  const handleManualEnroll = async (leagueId: string) => {
    if (!manualTeamName.trim()) return;
    setIsProcessing(true);
    await manuallyAddTeamToLeague(leagueId, manualTeamName, '', '');
    setIsInviteOpen(false);
    setManualTeamName('');
    setIsProcessing(false);
    toast({ title: "External Team Enrolled" });
  };

  if (isLeaguesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Tactical Standings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Competitive Hub</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">League Ledger</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Official Multi-Team Coordination</p>
        </div>
        
        {isStaff && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-95">
                <Plus className="h-5 w-5 mr-2" /> Start New Hub
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-md border-none shadow-2xl p-0 overflow-hidden bg-white">
              <div className="h-2 bg-primary w-full" />
              <div className="p-8 space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Establish Hub</DialogTitle>
                  <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">Create a new competitive coordination hub</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">League Identity</Label>
                  <Input placeholder="e.g. Regional Premier Varsity" value={leagueName} onChange={e => setLeagueName(e.target.value)} className="h-12 rounded-xl font-bold border-2" />
                </div>
                <DialogFooter>
                  <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={handleCreateLeague} disabled={isProcessing || !leagueName.trim()}>
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Hub"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-md ring-1 ring-black/5 bg-white overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Search Standings</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Tactical search..." 
                    className="pl-9 h-11 rounded-xl bg-muted/30 border-none font-bold"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Brief</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-muted-foreground">Joined Hubs</span>
                    <span>{myLeagues.length}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-muted-foreground">Global Challenges</span>
                    <span>{invites.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {invites.length > 0 && (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-500">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 px-2 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" /> Pending Challenges
              </p>
              {invites.map((invite) => (
                <Card key={invite.id} className="rounded-2xl border-none shadow-lg ring-2 ring-amber-500/20 bg-amber-50 overflow-hidden">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm border shrink-0">
                        <Shield className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="font-black text-xs uppercase truncate leading-tight">{invite.leagueName}</p>
                    </div>
                    <Button 
                      className="w-full h-10 rounded-xl font-black text-[10px] uppercase bg-amber-600 hover:bg-amber-700 shadow-lg text-white"
                      onClick={() => acceptLeagueInvite(invite.id, invite.leagueId)}
                    >
                      Authorize Participation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </aside>

        <div className="lg:col-span-3 space-y-10">
          {myLeagues.length > 0 ? myLeagues.map((league) => (
            <section key={league.id} className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-black text-white relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Trophy className="h-40 w-40" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <Badge className="bg-primary text-white mb-1.5 h-5 text-[8px] uppercase tracking-[0.2em] font-black px-3">Master Hub</Badge>
                        <h2 className="text-3xl font-black tracking-tight leading-none uppercase">{league.name}</h2>
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2">{Object.keys(league.teams || {}).length} Squads Enrolled</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {league.creatorId === user?.id && (
                        <Button asChild variant="outline" className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest border-white/20 bg-white/10 text-white hover:bg-white/20 shadow-lg transition-all">
                          <Link href={`/leagues/registration/${league.id}`}>
                            <ClipboardList className="h-4 w-4 mr-2" /> Registration Portal
                          </Link>
                        </Button>
                      )}
                      {league.creatorId === user?.id && (
                        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                          <DialogTrigger asChild>
                            <Button variant="secondary" className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                              <UserPlus className="h-4 w-4 mr-2" /> Enroll Squad
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-[2.5rem] sm:max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white">
                            <Tabs defaultValue="invite" className="w-full">
                              <div className="bg-primary/5 p-8 border-b">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Expand Hub</DialogTitle>
                                  <DialogDescription className="font-bold text-primary/60 uppercase text-[10px] tracking-widest">Add squads to the competitive ledger</DialogDescription>
                                </DialogHeader>
                                <TabsList className="grid w-full grid-cols-2 rounded-xl h-12 p-1 bg-muted/50 border-2 mt-6">
                                  <TabsTrigger value="invite" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Digital Invite</TabsTrigger>
                                  <TabsTrigger value="manual" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Manual Entry</TabsTrigger>
                                </TabsList>
                              </div>
                              <div className="p-8">
                                <TabsContent value="invite" className="mt-0 space-y-6">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Head Coach Email</Label>
                                      <Input placeholder="coach@rivalsquad.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="h-12 rounded-xl font-bold border-2" />
                                    </div>
                                  </div>
                                  <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={() => handleSendInvite(league.id, league.name)} disabled={isProcessing || !inviteEmail.trim()}>
                                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Dispatch Challenge"}
                                  </Button>
                                </TabsContent>
                                <TabsContent value="manual" className="mt-0 space-y-6">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Squad Name</Label>
                                      <Input placeholder="e.g. Northside United" value={manualTeamName} onChange={e => setManualTeamName(e.target.value)} className="h-12 rounded-xl font-bold border-2" />
                                    </div>
                                  </div>
                                  <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={handleManualEnroll(league.id)} disabled={isProcessing || !manualTeamName.trim()}>
                                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Archive Manual Squad"}
                                  </Button>
                                </TabsContent>
                              </div>
                            </Tabs>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                      <tr>
                        <th className="px-8 py-5">Squad Status</th>
                        <th className="px-4 py-5 text-center">W</th>
                        <th className="px-4 py-5 text-center">L</th>
                        <th className="px-4 py-5 text-center">T</th>
                        <th className="px-8 py-5 text-right text-primary">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/50">
                      {Object.entries(league.teams || {})
                        .map(([id, stats]) => ({ id, ...stats }))
                        .sort((a, b) => b.points - a.points || b.wins - a.wins)
                        .map((team, idx) => (
                          <tr 
                            key={team.id} 
                            className={cn(
                              "hover:bg-primary/5 transition-all group cursor-pointer",
                              team.id === activeTeam?.id && "bg-primary/5"
                            )}
                            onClick={() => { setScoutTeamId(team.id); setScoutTeamName(team.teamName); }}
                          >
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-muted-foreground/40 w-4">{idx + 1}</span>
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="h-10 w-10 rounded-xl border shadow-inner shrink-0">
                                    <AvatarImage src={team.teamLogoUrl} className="object-cover" />
                                    <AvatarFallback className="font-black text-xs bg-muted">{team.teamName[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-sm uppercase tracking-tight group-hover:text-primary transition-colors truncate max-w-[180px]">{team.teamName}</span>
                                      {team.id.startsWith('manual_') && <Badge className="text-[6px] h-3.5 bg-muted text-muted-foreground font-black border-none px-1">MANUAL</Badge>}
                                    </div>
                                    {team.id === activeTeam?.id && <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black uppercase h-4 px-1.5 w-fit mt-1">My Squad</Badge>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-6 text-center font-bold text-sm">{team.wins}</td>
                            <td className="px-4 py-6 text-center font-bold text-sm text-muted-foreground">{team.losses}</td>
                            <td className="px-4 py-6 text-center font-bold text-sm text-muted-foreground">{team.ties}</td>
                            <td className="px-8 py-6 text-right font-black text-lg text-primary">{team.points}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )) : (
            <div className="text-center py-32 bg-muted/10 border-2 border-dashed rounded-[3rem] space-y-6">
              <div className="bg-white w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl relative">
                <Shield className="h-12 w-12 text-primary opacity-20" />
                <Trophy className="absolute -top-3 -right-3 h-10 w-10 text-amber-500 animate-bounce" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-2xl font-black uppercase tracking-tight">Hub Frontier</h3>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Your squad hasn't joined a hub yet. Establish your own coordination center or accept a global challenge.
                </p>
              </div>
              {isStaff && (
                <Button className="h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20" onClick={() => setIsCreateOpen(true)}>Create Hub Ledger</Button>
              )}
            </div>
          )}
        </div>
      </div>

      <TeamRosterScout 
        teamId={scoutTeamId} 
        teamName={scoutTeamName} 
        isOpen={!!scoutTeamId} 
        onOpenChange={(open) => { if (!open) setScoutTeamId(null); }} 
      />
    </div>
  );
}
