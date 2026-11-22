import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, HelpCircle, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const REASONS = [
  { id: 'sold', label: '🎉 Продал на платформе', icon: CheckCircle2, color: 'emerald', desc: 'Нашёл покупателя здесь' },
  { id: 'sold_elsewhere', label: '🔄 Продал в другом месте', icon: XCircle, color: 'amber', desc: 'Продал через другой канал' },
  { id: 'not_selling', label: '⏸ Пока не продаю', icon: Clock, color: 'slate', desc: 'Решил пока не продавать' },
  { id: 'other', label: '💬 Другая причина', icon: HelpCircle, color: 'slate', desc: 'Иная причина' },
];

const colorMap = {
  emerald: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
  amber: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  slate: 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
};

export default function RemoveListingDialog({ car, open, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!car) return null;

  const createdDate = new Date(car.created_date);
  const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const isEarly = daysSinceCreated < 30;

  const handleConfirm = async () => {
    if (!selectedReason) return;
    setIsDeleting(true);
    await onConfirm(car.id, selectedReason);
    setIsDeleting(false);
    setSelectedReason(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setSelectedReason(null); onClose(); } }}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            {t('remove_listing.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">{car.brand} {car.model} {car.year}</span>
          </DialogDescription>
        </DialogHeader>

        {isEarly && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {t('remove_listing.early', { elapsed: `${daysSinceCreated} ${t('promote.days', { count: daysSinceCreated })}`, remaining: `${30 - daysSinceCreated} ${t('promote.days', { count: 30 - daysSinceCreated })}` })}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{t('remove_listing.question')}</p>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReason(r.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 transition-all",
                  selectedReason === r.id
                    ? colorMap[r.color]
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                )}
              >
                <div className="font-medium text-sm">{t(`remove_listing.reasons.${r.id}.label`)}</div>
                <div className="text-xs opacity-70 mt-0.5">{t(`remove_listing.reasons.${r.id}.desc`)}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedReason === 'sold' && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{t('remove_listing.congratulations')}</span>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => { setSelectedReason(null); onClose(); }}>
            {t('remove_listing.cancel')}
          </Button>
          <Button
            disabled={!selectedReason || isDeleting}
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t('remove_listing.title')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}