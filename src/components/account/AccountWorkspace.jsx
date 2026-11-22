import React, { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function AccountWorkspace({ sidebar, children, hideMobileSidebar = false }) {
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const header = document.querySelector('header')?.parentElement;
    if (!root || !header) return;
    const update = () => {
      const height = header.getBoundingClientRect().height;
      const pagePadding = parseFloat(window.getComputedStyle(root.closest('main')).paddingTop) || 0;
      root.style.setProperty('--workspace-header-height', `${height}px`);
      root.style.paddingTop = `${Math.max(0, height - pagePadding)}px`;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={rootRef} className="min-h-[calc(100dvh-var(--workspace-header-height,120px))] bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-6 lg:items-start">
          <div className={cn('min-w-0 lg:sticky', hideMobileSidebar && 'hidden lg:block')} style={{ top: 'calc(var(--workspace-header-height, 120px) + 16px)' }}>{sidebar}</div>
          <div className={cn('min-w-0 lg:mt-0', hideMobileSidebar ? 'mt-0' : 'mt-5')}>{children}</div>
        </div>
      </div>
    </div>
  );
}