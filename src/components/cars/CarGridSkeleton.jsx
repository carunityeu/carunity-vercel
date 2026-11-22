import React from 'react';
import SkeletonBlock from '@/components/ui/SkeletonBlock';

// widths live as literals so Tailwind keeps them
const CHIP_WIDTHS = ['w-14', 'w-16', 'w-12'];

function TileSkeleton() {
  return (
    <div>
      <SkeletonBlock className="mb-2 w-full rounded-xl" style={{ aspectRatio: '4/3' }} />
      <div className="px-0.5">
        <div className="flex items-start justify-between gap-2">
          <SkeletonBlock className="h-3.5 w-2/3 rounded" />
          <SkeletonBlock className="h-3.5 w-12 rounded" />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {CHIP_WIDTHS.map((w) => (
            <SkeletonBlock key={w} className={`h-6 rounded-md ${w}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
      <SkeletonBlock className="w-full flex-shrink-0 rounded-none sm:w-52 md:w-64" style={{ aspectRatio: '4/3' }} />
      <div className="flex-1 space-y-2 p-3 sm:p-4">
        <SkeletonBlock className="h-4 w-1/2 rounded" />
        <SkeletonBlock className="h-3 w-1/3 rounded" />
        <div className="flex flex-wrap gap-1 pt-1">
          {CHIP_WIDTHS.map((w) => (
            <SkeletonBlock key={w} className={`h-6 rounded-md ${w}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CarGridSkeleton({ count = 8, viewMode = 'grid', className }) {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className={className || 'flex flex-col gap-3'}>
        {items.map((_, index) => <ListRowSkeleton key={index} />)}
      </div>
    );
  }

  return (
    <div className={className || 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4'}>
      {items.map((_, index) => <TileSkeleton key={index} />)}
    </div>
  );
}