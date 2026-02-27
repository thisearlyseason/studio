"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant: 'dark-background' | 'light-background';
  className?: string;
  priority?: boolean;
}

/**
 * Standardized BrandLogo component.
 * - 'dark-background' renders logo-light.png (white version for dark surfaces).
 * - 'light-background' renders logo-dark.png (black version for light surfaces).
 * This is the single source of truth for all branding in the app.
 */
export function BrandLogo({ variant, className, priority }: BrandLogoProps) {
  const isDarkBg = variant === 'dark-background';
  
  // Core asset mapping as per business requirements
  const logoSrc = isDarkBg ? '/logo-light.png' : '/logo-dark.png';
  const logoHint = isDarkBg ? 'white logo' : 'black logo';

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Image
        src={logoSrc}
        alt="The Squad"
        width={400}
        height={120}
        className="object-contain w-full h-full"
        data-ai-hint={logoHint}
        priority={priority}
      />
    </div>
  );
}
