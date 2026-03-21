"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ROOT REDIRECT
 * Consolidated redirect hub to resolve parallel route conflicts with (dashboard)/tournaments.
 * Professional championship HQ is managed at /manage-tournaments.
 */
export default function TournamentRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-tournaments');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      <div className="animate-pulse font-black uppercase tracking-widest text-muted-foreground text-xs">
        Redirecting to Championship Command...
      </div>
    </div>
  );
}
