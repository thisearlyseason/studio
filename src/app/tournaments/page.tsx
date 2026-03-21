"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * PUBLIC ROUTE REDIRECT
 * This page was causing a parallel routing conflict with (dashboard)/tournaments.
 * Public spectator and scorekeeper routes remain at /tournaments/...
 * Management is now strictly at /dashboard/tournaments via (dashboard) grouping.
 */
export default function TournamentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/feed');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
