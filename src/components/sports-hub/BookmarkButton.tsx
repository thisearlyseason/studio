'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  articleId: string;
  className?: string;
}

export function BookmarkButton({ articleId, className }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('sh_bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(articleId));
  }, [articleId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const bookmarks = JSON.parse(localStorage.getItem('sh_bookmarks') || '[]') as string[];
    const next = isBookmarked
      ? bookmarks.filter((id) => id !== articleId)
      : [...bookmarks, articleId];
    localStorage.setItem('sh_bookmarks', JSON.stringify(next));
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
      className={cn(
        'p-2 rounded-xl transition-all hover:bg-primary/10 active:scale-95',
        isBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary',
        className
      )}
    >
      <Bookmark className={cn('h-4 w-4', isBookmarked && 'fill-current')} />
    </button>
  );
}
