import React from 'react';
import SkeletonBlock from '@/components/ui/SkeletonBlock';

export default function CarModelGridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <SkeletonBlock className="aspect-[16/9] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <SkeletonBlock className="h-4 w-2/3 rounded" />
            <SkeletonBlock className="h-3 w-1/2 rounded" />
            <SkeletonBlock className="h-3 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}