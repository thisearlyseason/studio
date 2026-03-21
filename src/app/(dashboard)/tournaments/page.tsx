"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * REDIRECT HUB
 * Neutralizes the route conflict with public /tournaments paths.
 * Management is consolidated at /manage-tournaments.
 */
export default function RedirectToManage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/manage-tournaments');
  }, [router]);

  return null;
}
