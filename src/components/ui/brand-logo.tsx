
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface BrandLogoProps {
  variant: 'dark-background' | 'light-background';
  className?: string;
  priority?: boolean;
}

/**
 * Standardized BrandLogo component.
 * - 'dark-background' uses the placeholder with 'white logo' hint.
 * - 'light-background' uses the placeholder with 'black logo' hint.
 * The system automatically replaces these placeholders with your uploaded image assets.
 */
export function BrandLogo({ variant, className, priority }: BrandLogoProps) {
  const isDarkBg = variant === 'dark-background';
  
  // Find the correct placeholder configuration
  const placeholderId = isDarkBg ? 'brand-logo-light' : 'brand-logo-dark';
  const logoData = PlaceHolderImages.find(img => img.id === placeholderId);

  if (!logoData) return null;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Image
        src={logoData.imageUrl}
        alt="The Squad"
        width={400}
        height={120}
        className="object-contain w-full h-full"
        data-ai-hint={logoData.imageHint}
        priority={priority}
      />
    </div>
  );
}
