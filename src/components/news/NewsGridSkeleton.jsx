import React from 'react';
import SkeletonBlock from '@/components/ui/SkeletonBlock';

export default function NewsGridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <SkeletonBlock className="mb-3 aspect-[16/10] w-full rounded-xl" />
          <SkeletonBlock className="mb-2 h-5 w-5/6 rounded" />
          <SkeletonBlock className="h-4 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}