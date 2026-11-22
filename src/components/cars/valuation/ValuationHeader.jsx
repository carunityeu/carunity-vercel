import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { DialogClose, DialogTitle } from '@/components/ui/dialog';

export default function ValuationHeader() {
  const { t } = useTranslation();
  return (
    <div className="head">
      <DialogTitle className="title">{t('valuation.title')}</DialogTitle>
      <DialogClose type="button" className="close" aria-label={t('valuation.close')}>
        <X aria-hidden="true" strokeWidth={1.8} />
      </DialogClose>
    </div>
  );
}