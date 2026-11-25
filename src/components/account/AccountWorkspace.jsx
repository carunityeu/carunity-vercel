import React from 'react';
import { cn } from '@/lib/utils';

// Cabinet layout (dealer panel): sidebar + content. The site header scrolls away with the page
// (design code §8), so no offset for it; the sidebar sticks 16px below the top of the screen.
export default function AccountWorkspace({ sidebar, children, hideMobileSidebar = false }) {
  return (
    <div className="bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-6 lg:items-start">
          <div className={cn('min-w-0 lg:sticky lg:top-4', hideMobileSidebar && 'hidden lg:block')}>{sidebar}</div>
          <div className={cn('min-w-0 lg:mt-0', hideMobileSidebar ? 'mt-0' : 'mt-5')}>{children}</div>
        </div>
      </div>
    </div>
  );
}
