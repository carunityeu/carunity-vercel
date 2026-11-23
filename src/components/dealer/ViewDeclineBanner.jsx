import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { TrendingDown, X, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function ViewDeclineBanner({ dealer, onPromote }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(() => {
    const ts = localStorage.getItem('view_decline_banner_dismissed');
    if (!ts) return false;
    return (Date.now() - parseInt(ts)) < 24 * 60 * 60 * 1000;
  });

  const { data: viewDeclineNotifs = [] } = useQuery({
    queryKey: ['viewDeclineNotifs', dealer?.email],
    queryFn: () => entities.Notification.filter({
      user_email: dealer.email, type: 'view_decline', is_read: false,
    }, '-created_date', 50),
    enabled: !!dealer?.email && !dismissed,
  });

  if (dismissed || viewDeclineNotifs.length === 0) return null;

  const handleDismiss = () => {
    localStorage.setItem('view_decline_banner_dismissed', Date.now().toString());
    setDismissed(true);
  };

  const handlePromote = () => {
    const carIds = viewDeclineNotifs.map(n => n.car_id).filter(Boolean);
    onPromote(carIds);
  };

  return (
    <div className="bg-[#1b1b22] border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative mb-4">
      <button onClick={handleDismiss} className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1 rounded-lg z-10">
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <TrendingDown className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm mb-1 pr-8">
            {t('view_decline.banner_title', 'Некоторые ваши объявления теряют просмотры')}
          </h3>
          <p className="text-slate-400 text-xs mb-2.5">
            {t('view_decline.banner_desc', 'Попробуйте продвинуть их, чтобы вернуть больше внимания покупателей.')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {viewDeclineNotifs.slice(0, 3).map((n, i) => (
              <span key={i} className="text-xs bg-[#101014] border border-[#292a32] rounded-lg px-2 py-1 text-slate-300 truncate max-w-[160px]">
                {n.car_title || n.title}
              </span>
            ))}
            {viewDeclineNotifs.length > 3 && (
              <span className="text-xs text-slate-500 self-center">+{viewDeclineNotifs.length - 3}</span>
            )}
          </div>
        </div>
        <Button
          onClick={handlePromote}
          className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 flex-shrink-0 whitespace-nowrap w-full sm:w-auto"
        >
          <Rocket className="w-4 h-4" />
          {t('view_decline.banner_cta', 'Продвинуть объявления')}
        </Button>
      </div>
    </div>
  );
}