
"use client";

/**
 * TACTICAL FILE RENAMED TO REDIRECT
 * Resolves Next.js 15 parallel route error.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootTournamentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-tournaments');
  }, [router]);

  return null;
}
