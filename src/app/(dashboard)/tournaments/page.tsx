"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * TACTICAL LOADING HUB
 * This file is neutralized to resolve parallel route conflicts with /app/tournaments.
 * The management interface has been moved to /manage-tournaments.
 */
export default function TournamentLoadingNeutralizer() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-tournaments');
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="bg-primary/10 p-6 rounded-[2.5rem] shadow-xl">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Tactical Hub...</p>
    </div>
  );
}
