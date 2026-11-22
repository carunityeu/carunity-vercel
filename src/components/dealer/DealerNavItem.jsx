import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function DealerNavItem({ item, active, onSelect, mobile = false }) {
  const Icon = item.icon;
  const classes = cn(
    'flex items-center gap-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    mobile ? 'h-9 px-3 border whitespace-nowrap shrink-0' : 'w-full px-2.5 py-2 text-left',
    active ? 'bg-border text-foreground font-medium border-border' : 'text-muted-foreground hover:text-foreground hover:bg-border/50 border-border',
    mobile && !active && 'bg-card'
  );
  const content = <><Icon className="w-4 h-4 shrink-0" /><span className={item.key === 'get-offers' && !mobile ? 'min-w-0 whitespace-normal break-words leading-snug' : 'truncate'}>{item.label}{item.count > 0 && <span className="ml-1 text-muted-foreground">({item.count})</span>}</span></>;
  return item.href
    ? <Link to={item.href} className={classes} aria-current={active ? 'page' : undefined}>{content}</Link>
    : <button type="button" onClick={() => onSelect(item.key)} className={classes} aria-current={active ? 'page' : undefined}>{content}</button>;
}