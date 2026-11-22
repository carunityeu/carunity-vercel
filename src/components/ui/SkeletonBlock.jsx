import React from 'react';
import { cn } from '@/lib/utils';

export default function SkeletonBlock({ className, ...props }) {
  return <div className={cn('skeleton-block rounded-md', className)} {...props} />;
}