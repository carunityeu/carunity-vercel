import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

/**
 * Tip — shows a tooltip with explanation on hover (desktop) or tap (mobile).
 * Renders the wrapped term with a dotted underline.
 * @param {string} children — the term to wrap (e.g. "Smart Match")
 * @param {string|ReactNode} content — the explanation text
 */
export default function Tip({ children, content, className }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      // Don't close if clicking inside the tooltip content (rendered in a portal)
      if (e.target.closest('[data-radix-popper-content-wrapper]')) return;
      // Don't close if clicking the trigger itself
      if (e.target.closest('[data-tip-trigger]')) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <span
            data-tip-trigger
            className={cn(
              'cursor-help underline decoration-dotted decoration-slate-400/60 underline-offset-2 hover:decoration-slate-300 transition-colors inline-flex',
              className
            )}
            onPointerDown={(e) => {
              if (e.pointerType === 'touch') {
                e.preventDefault();
                setOpen(o => !o);
              }
            }}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="max-w-[260px] sm:max-w-[300px] text-xs leading-relaxed p-3 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </Tooltip>
    </TooltipProvider>
  );
}