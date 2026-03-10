
"use client";

import React, { useState, useMemo } from 'react';
import { useTeam, Team } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Building, ArrowUpRight, ShieldCheck, Zap, Loader2, Users, LayoutGrid } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

export default function OrganizationTeamsPage() {
  const { orgId } = useParams();
  const { user, createNewTeam } = useTeam();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const teamsQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    return query(collection(db, 'teams'), where('clubId', '==', orgId));
  }, [orgId, db]);

  const { data: teams, isLoading } = useCollection<Team>(teamsQuery);

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    return teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [teams, searchTerm]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    try {
      // Use the helper from team provider, it already handles clubId assignment
      await createNewTeam(newTeamName, 'adult', 'Coach', `Official squad managed by institution`, 'pro');
      setNewTeamName('');
      toast({ title: "Institution Squad Enrolled", description: `${newTeamName} is now live.` });
    } catch (e) {
      toast({ title: "Enrollment Failed", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search institution roster..." 
            className="pl-11 h-12 rounded-2xl bg-muted/50 border-none font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-xl font-black uppercase text-xs shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Add Organization Team
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Enroll New Squad</DialogTitle>
              <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">Institutional Expansion Hub</DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Squad Identity</Label>
                <Input 
                  placeholder="e.g. Academy U16 Premier" 
                  value={newTeamName} 
                  onChange={e => setNewTeamName(e.target.value)}
                  className="h-12 rounded-xl font-bold border-2" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full h-14 rounded-2xl text-lg font-black" 
                onClick={handleCreateTeam}
                disabled={isCreating || !newTeamName.trim()}
              >
                {isCreating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
                Enroll Institutional Squad
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="rounded-[2rem] border-none shadow-sm ring-1 ring-black/5 hover:shadow-xl hover:ring-primary/20 transition-all group overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="w-full md:w-24 bg-muted/30 flex items-center justify-center p-6 border-r group-hover:bg-primary/5 transition-colors shrink-0">
                  <Avatar className="h-14 w-14 rounded-2xl shadow-lg border-2 border-background ring-2 ring-primary/10">
                    <AvatarImage src={team.teamLogoUrl} className="object-cover" />
                    <AvatarFallback className="font-black bg-white text-xs">{team.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{team.name}</h3>
                    <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3 text-primary" /> Institutional Tier</span>
                      <span className="flex items-center gap-1.5"><LayoutGrid className="h-3 w-3" /> Code: {team.code}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl border">
                      <Users className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase leading-none">Roster</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Sync Active</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-12 w-12 hover:bg-primary hover:text-white shadow-sm ring-1 ring-black/5"
                      onClick={() => toast({ title: "Routing to Squad Hub..." })}
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredTeams.length === 0 && (
          <div className="text-center py-20 bg-muted/10 rounded-[2.5rem] border-2 border-dashed opacity-40">
            <p className="text-xs font-black uppercase tracking-widest">No matching institutional squads found</p>
          </div>
        )}
      </div>
    </div>
  );
}
