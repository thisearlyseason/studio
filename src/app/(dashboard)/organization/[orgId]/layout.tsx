
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeam } from '@/components/providers/team-provider';
import { ShieldAlert, Loader2, Building, Layout, Users, MapPin, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { orgId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isClubManager } = useTeam();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Plan Guard: Only Elite Plans can access Organization routes
  if (!isClubManager) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 animate-in fade-in">
        <div className="bg-primary/10 p-10 rounded-[3rem] ring-4 ring-primary/5">
          <ShieldAlert className="h-20 w-20 text-primary" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-4xl font-black uppercase tracking-tight leading-none">Access Restricted</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Organization tools require an Elite subscription tier.</p>
        </div>
        <Button onClick={() => router.push('/pricing')} className="h-14 px-10 rounded-2xl font-black uppercase shadow-xl shadow-primary/20">
          Upgrade to Elite
        </Button>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: `/organization/${orgId}`, icon: Layout },
    { name: 'Squads', href: `/organization/${orgId}/teams`, icon: Building },
    { name: 'Personnel', href: `/organization/${orgId}/members`, icon: Users },
    { name: 'Facilities', href: `/organization/${orgId}/facilities`, icon: MapPin },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-1">
          <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest text-[9px] h-6 px-3">Elite Organization</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">Command Center</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Institutional Coordination Ledger</p>
        </div>

        <nav className="flex bg-muted/50 p-1 rounded-2xl border-2 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "rounded-xl font-black text-[10px] uppercase tracking-widest px-6 h-11 transition-all",
                    isActive ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 mr-2" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </div>
    </div>
  );
}
