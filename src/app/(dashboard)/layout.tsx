"use client";

import Shell from '@/components/layout/Shell';
import { AlertOverlay } from '@/components/layout/AlertOverlay';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { RevenueCatPaywall } from '@/components/RevenueCatPaywall';
import { QuotaResolutionOverlay } from '@/components/layout/QuotaResolutionOverlay';
import { useTeam } from '@/components/providers/team-provider';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const { teams, isTeamsLoading, isSeedingDemo, user: userProfile } = useTeam();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    // Force demo users to land on the feed first, regardless of access
    if (user?.isDemo && pathname === '/') {
      router.push('/feed');
      return;
    }

    // Standard redirect to setup if no teams exist, BUT skip if seeding a demo
    // CRITICAL: We MUST exclude settings and pricing to allow logout and account management
    const isSetupPage = pathname === '/teams/new' || 
                        pathname === '/teams/join' || 
                        pathname === '/family' || 
                        pathname === '/settings' || 
                        pathname === '/pricing';
    
    if (user && userProfile && !isTeamsLoading && !isSeedingDemo && teams.length === 0 && !isSetupPage) {
      if (userProfile.role === 'coach') {
        router.push('/teams/new');
      } else {
        router.push('/teams/join');
      }
    }
  }, [user, userProfile, teams, isTeamsLoading, isSeedingDemo, pathname, router]);

  if (isUserLoading || !user || isSeedingDemo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="bg-primary/10 p-6 rounded-[2.5rem] shadow-xl relative">
            <div className="h-16 w-16 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-black uppercase tracking-widest text-primary">
              {isSeedingDemo ? "Seeding Demo Environment..." : "Authenticating..."}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              {isSeedingDemo ? "Building Guest Squad Data" : "Verifying Elite Credentials"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertOverlay />
      <RevenueCatPaywall />
      <QuotaResolutionOverlay />
      <Shell>{children}</Shell>
    </>
  );
}
