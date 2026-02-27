import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant: 'dark-background' | 'light-background';
  className?: string;
  priority?: boolean;
}

/**
 * Centralized BrandLogo component for SquadForge.
 * - 'dark-background' variant renders logo-light.png (for visibility on dark surfaces).
 * - 'light-background' variant renders logo-dark.png (for visibility on light surfaces).
 */
export function BrandLogo({ variant, className, priority }: BrandLogoProps) {
  const isDarkBg = variant === 'dark-background';
  
  // Use the specific assets required by business goals
  const src = isDarkBg ? '/logo-light.png' : '/logo-dark.png';
  const alt = "THE SQUAD.";
  const hint = isDarkBg ? "white logo" : "black logo";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        data-ai-hint={hint}
        priority={priority}
      />
    </div>
  );
}
