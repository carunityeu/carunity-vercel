import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SaleCheckPrompt({ car, sellerEmail, daysLeft, onAnswered }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(null);

  const respond = async (answer) => {
    setSaving(answer);
    try {
      if (answer === 'sold') {
        await base44.entities.Car.update(car.id, { status: 'sold' });
      }
      await base44.entities.SaleFeedback.create({
        listing_id: car.id,
        listing_type: 'car',
        listing_title: `${car.brand || ''} ${car.model || ''} ${car.year || ''}`.trim(),
        seller_email: car.seller_id || sellerEmail,
        dealer_id: car.dealer_id || '',
        answer,
        price: car.price || 0,
        views: car.views_count || 0,
        days_listed: Math.max(0, 30 - daysLeft),
        responded_at: new Date().toISOString(),
      });
      toast.success(answer === 'sold' ? t('renewal.sold_check_saved_sold') : t('renewal.sold_check_saved_not_sold'));
      onAnswered?.(answer);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-3">
      <p className="text-[13px] font-semibold leading-snug text-white">{t('renewal.sold_check_title')}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {daysLeft > 0
          ? t('renewal.sold_check_desc', { days: daysLeft })
          : t('renewal.sold_check_desc_expired')}
      </p>
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => respond('sold')}
          disabled={!!saving}
          className="h-8 w-full px-3 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 sm:w-auto"
        >
          {t('renewal.sold_check_yes')}
        </Button>
        <Button
          onClick={() => respond('not_sold')}
          disabled={!!saving}
          variant="outline"
          className="h-8 w-full px-3 text-xs font-medium text-slate-300 bg-transparent border-[#292a32] hover:bg-[#1b1b22] hover:text-white disabled:opacity-60 sm:w-auto"
        >
          {t('renewal.sold_check_no')}
        </Button>
      </div>
    </div>
  );
}