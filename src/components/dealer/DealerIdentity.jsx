import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'lucide-react';

export default function DealerIdentity({ dealer, onEdit }) {
  const { t } = useTranslation();
  const initials = dealer?.name?.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('').toUpperCase() || 'D';
  return (
    <div className="flex items-center gap-3 px-2.5 py-3">
      <div className="w-11 h-11 rounded-full bg-primary/15 text-primary font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
        {dealer?.logo ? <img src={dealer.logo} alt="" className="w-full h-full object-cover" /> : initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{dealer?.name || t('dealer.panel_title')}</p>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          <Pencil className="w-3 h-3" />{t('account.edit_profile')}
        </button>
      </div>
    </div>
  );
}