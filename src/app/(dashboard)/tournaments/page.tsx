
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * TACTICAL HQ REDIRECT
 * Management is consolidated at /manage-tournaments to prevent routing conflicts.
 */
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-tournaments');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center animate-pulse">
      <div className="bg-primary/10 p-8 rounded-[3rem] shadow-xl mb-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
      <p className="text-xl font-black uppercase tracking-tight text-foreground">Redirecting to Hub...</p>
    </div>
  );
}
