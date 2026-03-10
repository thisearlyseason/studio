
"use client";

import React, { useState, useEffect, memo } from 'react';
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
  Trophy,
  Bell,
  Lock,
  Dumbbell,
  Building,
  History,
  Shield,
  Zap,
  HandHelping,
  PiggyBank,
  Table as TableIcon,
  CreditCard,
  Layout,
  BarChart3,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTeam } from '@/components/providers/team-provider';
import { CreateAlertButton, AlertsHistoryDialog } from '@/components/layout/AlertOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import BrandLogo from '@/components/BrandLogo';
import { ScrollArea } from '@/components/ui/scroll-area';

const SidebarItem = memo(({ item, isActive, isLocked }: { item: any, isActive: boolean, isLocked: boolean }) => {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={isActive}
        className={cn(
          "h-11 px-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest",
          isActive 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90" 
            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
        )}
      >
        <Link href={item.href} className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-4 w-4", isActive ? "stroke-[3px]" : "stroke-[2]")} />
            <span>{item.name}</span>
          </div>
          {isLocked && <Lock className="h-3 w-3 opacity-40" />}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});
SidebarItem.displayName = "SidebarItem";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    activeTeam, setActiveTeam, teams, user, isPro, isClubManager, isStaff, hasFeature, clubId
  } = useTeam();

  const navigationGroups = [
    {
      label: "Home",
      items: [
        { name: 'Dashboard', href: '/feed', icon: LayoutDashboard }
      ]
    },
    {
      label: "Team",
      items: [
        { name: 'Roster', href: '/roster', icon: Users2 },
        { name: 'Schedule', href: '/events', icon: CalendarDays },
        { name: 'Playbook', href: '/drills', icon: Dumbbell }
      ]
    },
    {
      label: "Communication",
      items: [
        { name: 'Team Chat', href: '/chats', icon: MessageCircle }
      ]
    },
    {
      label: "Competition",
      items: [
        { name: 'Scores', href: '/games', icon: Trophy },
        { name: 'Tournaments', href: '/tournament', icon: TableIcon, pro: true, feature: 'tournaments' },
        { name: 'Standings', href: '/leagues', icon: Shield, feature: 'leagues' }
      ]
    },
    {
      label: "Finance",
      items: [
        { name: 'Fundraising', href: '/fundraising', icon: PiggyBank, pro: true, feature: 'payments' },
        { name: 'Volunteer', href: '/volunteers', icon: HandHelping, pro: true, feature: 'attendance' }
      ]
    },
    {
      label: "Documents",
      items: [
        { name: 'Library', href: '/files', icon: FolderClosed }
      ]
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen w-full bg-background selection:bg-primary/20">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsible="none" className="hidden md:flex border-r bg-muted/20 w-72 shrink-0 sticky top-0 h-screen">
            <SidebarHeader className="p-6">
              <div className="flex flex-col mb-10 px-2">
                <BrandLogo variant="light-background" className="h-10 w-44 justify-start -ml-2" priority />
                <div className="flex items-center gap-3 mt-1 ml-1">
                  <div className="h-[2px] w-6 bg-primary rounded-full" />
                  <p className="text-[10px] font-extrabold text-primary uppercase tracking-[0.25em] whitespace-nowrap">Tactical OS</p>
                </div>
              </div>

              <div className="px-2">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 px-2">Squad Selector</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-14 px-3 border-muted-foreground/10 bg-background/50 hover:bg-white rounded-2xl shadow-sm group">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 rounded-xl border-2 border-background shadow-md shrink-0">
                          <AvatarImage src={activeTeam?.teamLogoUrl} className="object-cover" />
                          <AvatarFallback className="hero-gradient text-white font-black text-xs">{activeTeam?.name?.[0] || 'T'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start min-w-0 text-left">
                          <span className="font-extrabold text-sm tracking-tight truncate w-32">{activeTeam?.name || 'Select Squad'}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{activeTeam?.sport || 'General'}</span>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 opacity-40 group-data-[state=open]:rotate-180 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="p-2 w-72 rounded-2xl shadow-2xl">
                    <ScrollArea className="max-h-[300px]">
                      {teams.map((team) => (
                        <DropdownMenuItem key={team.id} onClick={() => setActiveTeam(team)} className={cn("flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all mb-1", activeTeam?.id === team.id ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted")}>
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 rounded-xl border shadow-sm"><AvatarImage src={team.teamLogoUrl} className="object-cover" /><AvatarFallback className="bg-muted font-black text-[10px]">{team.name[0]}</AvatarFallback></Avatar>
                            <div className="flex flex-col min-w-0"><span className="font-black text-sm truncate leading-tight">{team.name}</span><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{team.sport}</span></div>
                          </div>
                          {team.isPro && <Badge className="bg-amber-500 text-white border-none font-black text-[7px] h-4 px-1 shadow-sm">PRO</Badge>}
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
              <ScrollArea className="h-full pr-2">
                {isClubManager && clubId && (
                  <SidebarGroup className="mb-4">
                    <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Organization</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarItem 
                          item={{ name: 'Club Hub', href: `/organization/${clubId}`, icon: Building }} 
                          isActive={pathname.startsWith(`/organization/${clubId}`)} 
                          isLocked={false} 
                        />
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}

                {navigationGroups.map((group) => (
                  <SidebarGroup key={group.label} className="mb-4">
                    <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">{group.label}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-1">
                        {group.items
                          .filter(item => !item.feature || hasFeature(item.feature))
                          .map((item) => (
                            <SidebarItem 
                              key={item.name} 
                              item={item} 
                              isActive={pathname === item.href} 
                              isLocked={item.pro && !isPro && isStaff} 
                            />
                          ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ))}
              </ScrollArea>
            </SidebarContent>

            <SidebarFooter className="p-6">
              <SidebarMenu>
                <SidebarItem 
                  item={{ name: 'Settings', href: '/settings', icon: Settings }} 
                  isActive={pathname === '/settings'} 
                  isLocked={false} 
                />
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>

          <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden bg-background">
            <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b h-16 md:h-20 flex items-center px-4 md:px-10 justify-between shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex flex-col min-w-0">
                  <h2 className="text-xl lg:text-2xl font-black tracking-tighter uppercase truncate">{pathname.split('/')[1] || 'Dashboard'}</h2>
                  <p className="text-[9px] lg:text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-0.5 truncate">The Squad • {activeTeam?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreateAlertButton />
                <AlertsHistoryDialog>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl relative">
                    <Bell className="h-5 w-5" />
                  </Button>
                </AlertsHistoryDialog>
                <Link href="/settings">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-background shadow-md">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="font-black text-[10px]">{user?.name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </header>
            <main className="flex-1 pb-36 md:pb-12 pt-4 md:pt-6 px-4 md:px-10 max-w-7xl mx-auto w-full overflow-y-auto custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
