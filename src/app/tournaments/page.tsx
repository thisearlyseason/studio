"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ROOT REDIRECT
 * Resolves parallel route conflict by acting as a global redirect to management HQ.
 */
export default function TournamentRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-tournaments');
  }, [router]);

  return null;
}
