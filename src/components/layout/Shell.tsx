
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  MessageCircle, 
  Users2, 
  FolderClosed, 
  Settings,
  ChevronDown,
  PlusCircle,
  Trophy,
  Bell,
  Info,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeam } from '@/components/providers/team-provider';
import { CreateAlertButton } from '@/components/layout/AlertOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

const tabs = [
  { name: 'Feed', href: '/feed', icon: LayoutDashboard, pro: false },
  { name: 'Schedule', href: '/events', icon: CalendarDays, pro: false },
  { name: 'Games', href: '/games', icon: Trophy, pro: true },
  { name: 'Chats', href: '/chats', icon: MessageCircle, pro: false },
  { name: 'Roster', href: '/roster', icon: Users2, pro: true },
  { name: 'Library', href: '/files', icon: FolderClosed, pro: true },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTeam, setActiveTeam, teams, user, isPro } = useTeam();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 w-full glass shadow-sm">
        <div className="container flex h-16 items-center justify-between px-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 h-12 hover:bg-muted/50 transition-all active:scale-95 group">
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9 rounded-xl border-2 border-background shadow-md">
                      <AvatarImage src={activeTeam?.teamLogoUrl} className="object-cover" />
                      <AvatarFallback className="hero-gradient text-white font-black text-xs rounded-xl">
                        {activeTeam?.name?.[0] || 'T'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col items-start min-w-0 max-w-[120px] sm:max-w-[200px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm tracking-tight truncate leading-tight">
                        {activeTeam?.name || 'Select Squad'}
                      </span>
                      {activeTeam?.isPro && <Badge className="bg-amber-500 text-[8px] h-3 px-1 font-black uppercase">PRO</Badge>}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
                      {activeTeam?.sport || 'General'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-40 group-data-[state=open]:rotate-180 transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 rounded-xl shadow-xl border-muted">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest opacity-50 px-3 py-2">My Squads</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {teams.length > 0 ? teams.map((team) => (
                  <DropdownMenuItem 
                    key={team.id} 
                    onClick={() => setActiveTeam(team)}
                    className="flex items-center justify-between p-3 cursor-pointer rounded-lg mx-1 my-1"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-md shrink-0">
                        <AvatarImage src={team.teamLogoUrl} />
                        <AvatarFallback className="bg-muted font-bold text-xs rounded-md">
                          {team.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold truncate">{team.name}</span>
                    </div>
                    {team.isPro && <Badge className="bg-amber-500 text-[8px] h-3 px-1">PRO</Badge>}
                  </DropdownMenuItem>
                )) : (
                  <div className="px-4 py-3 text-sm text-muted-foreground italic">No squads yet</div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => router.push('/team')}
                  className="flex items-center gap-3 p-3 cursor-pointer rounded-lg mx-1 my-1 font-bold"
                >
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Squad Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push('/teams/new')}
                  className="flex items-center gap-3 p-3 text-primary cursor-pointer rounded-lg mx-1 my-1 font-bold"
                >
                  <PlusCircle className="h-5 w-5" />
                  Create New Squad
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-3">
            <CreateAlertButton />
            <Link href="/settings">
              <Avatar className="h-9 w-9 border-2 border-background shadow-sm hover:ring-4 hover:ring-primary/10 transition-all">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="font-bold">{user?.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 pt-6 px-4 max-w-5xl mx-auto w-full animate-in fade-in duration-700 slide-in-from-bottom-2">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl glass rounded-2xl shadow-2xl border-white/40 p-1.5 transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname.startsWith(tab.href);
            const isTabLocked = tab.pro && !isPro;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl transition-all relative",
                  isActive 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                  {isTabLocked && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 text-white ring-1 ring-white">
                      <Lock className="h-2 w-2" />
                    </div>
                  )}
                </div>
                <span className={cn("text-[9px] font-bold tracking-tight uppercase", !isActive && "opacity-70")}>
                  {tab.name}
                </span>
                {isActive && (
                  <span className="absolute -top-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
