"use client";

import Shell from '@/components/layout/Shell';
import { AlertOverlay } from '@/components/layout/AlertOverlay';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { RevenueCatPaywall } from '@/components/RevenueCatPaywall';
import { useTeam } from '@/components/providers/team-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { teams, isTeamsLoading } = useTeam();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // If user is logged in, has finished loading teams, but has ZERO teams
    // and isn't already trying to create one, send them to the setup page.
    if (user && !isTeamsLoading && teams.length === 0 && pathname !== '/teams/new') {
      router.push('/teams/new');
    }
  }, [user, teams, isTeamsLoading, pathname, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertOverlay />
      <RevenueCatPaywall />
      <Shell>{children}</Shell>
    </>
  );
}