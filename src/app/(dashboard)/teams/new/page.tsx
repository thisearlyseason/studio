
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useTeam } from '@/components/providers/team-provider';
import { ChevronLeft, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function NewTeamPage() {
  const router = useRouter();
  const { createNewTeam, teams, isSuperAdmin } = useTeam();
  const [teamName, setTeamName] = useState('');
  const [organizerPosition, setOrganizerPosition] = useState('Coach');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasExistingTeam = teams.length > 0;

  const handleCreate = async () => {
    if (teamName.trim()) {
      setIsProcessing(true);
      // Logic would go to payment here, for prototype we just simulate
      await createNewTeam(teamName, organizerPosition);
      router.push('/feed');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-4 pb-20">
      <Button variant="ghost" onClick={() => router.back()} className="-ml-2">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="h-2 hero-gradient w-full" />
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black tracking-tight">Create Your Squad</CardTitle>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <CardDescription className="font-medium">
            {hasExistingTeam 
              ? "Scale your organization with another professional hub." 
              : "Establish a new hub for coordination and communication."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="teamName" className="text-xs font-bold uppercase tracking-widest ml-1">Squad Name</Label>
            <Input 
              id="teamName" 
              placeholder="e.g. Westside Warriors" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="h-12 text-lg rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest ml-1">Your Role as Organizer</Label>
            <Select value={organizerPosition} onValueChange={setOrganizerPosition}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Select your role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Coach">Coach</SelectItem>
                <SelectItem value="Team Lead">Team Lead</SelectItem>
                <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                <SelectItem value="Squad Leader">Squad Leader</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasExistingTeam && !isSuperAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 text-white p-2 rounded-lg shadow-md">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-900 leading-tight">Multi-Team Enrollment</p>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Subscriber Discount Applied</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-800">
                  Add another team for only <span className="font-black text-amber-900">$8.50 a month</span> or <span className="font-black text-amber-900">$85 for the year</span>.
                </p>
                <ul className="text-[10px] font-bold text-amber-700/80 space-y-1">
                  <li className="flex items-center gap-2">✓ Full Pro Access for the new squad</li>
                  <li className="flex items-center gap-2">✓ Centralized dashboard management</li>
                  <li className="flex items-center gap-2">✓ Priority tournament enrollment</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all" 
            disabled={!teamName.trim() || isProcessing}
            onClick={handleCreate}
          >
            {isProcessing ? "Processing Enrollment..." : hasExistingTeam ? "Pay & Create Squad" : "Create Squad"}
          </Button>
          <div className="flex items-center justify-center gap-2 text-muted-foreground opacity-60">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Secure Checkout Powered by SquadForge</span>
          </div>
        </CardFooter>
      </Card>
      
      <div className="bg-muted/50 p-6 rounded-[2rem] text-center border-2 border-dashed">
        <p className="text-xs text-muted-foreground leading-relaxed">
          By creating a team, you become the primary administrator. Free plans include Feed, Chat, and Schedule. Pro plans unlock Games, Library, and advanced Roster logic.
        </p>
      </div>
    </div>
  );
}
