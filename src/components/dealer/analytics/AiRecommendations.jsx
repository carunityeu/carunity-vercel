import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Lightbulb, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/format';

const LANGUAGE_NAMES = { ru: 'Russian', en: 'English', et: 'Estonian', lv: 'Latvian', lt: 'Lithuanian' };

export default function AiRecommendations({ car, carViews, carContacts }) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState(null);

  const handleGetRecs = async () => {
    if (!car) return;
    setLoading(true);
    const lang = LANGUAGE_NAMES[i18n.language?.slice(0, 2)] || 'English';
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a car sales expert. Analyse this listing and give 3 concrete recommendations to sell it faster. Be brief and specific.

Respond in ${lang}. Every text field in the JSON must be written in ${lang}.

Car: ${car.brand} ${car.model} ${car.year}
Price: ${formatPrice(car.price)}
Mileage: ${car.mileage || 'not specified'} km
Photos: ${(car.images || []).length}
Description: ${car.description ? `present (${car.description.length} characters)` : 'missing'}
Views: ${carViews}
Contacts: ${carContacts}
Specs: engine ${car.engine_power || '?'} hp, fuel ${car.fuel_type || '?'}, body ${car.body_type || '?'}`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_price: { type: 'number' },
          recommendations: { type: 'array', items: { type: 'string' } },
          priority_action: { type: 'string' }
        }
      }
    });
    setRecs(result);
    setLoading(false);
  };

  return (
    <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t('dealer.ai_recs')}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleGetRecs}
          disabled={loading}
          className="gap-2 text-xs"
        >
          <Zap className="w-3 h-3" />
          {loading ? t('dealer.ai_analyzing') : recs ? t('dealer.ai_refresh') : t('dealer.ai_get_recs')}
        </Button>
      </div>
      {!recs && !loading && <p className="text-sm text-slate-400">{t('dealer.ai_recs_hint')}</p>}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          {t('dealer.ai_analyzing_listing')}
        </div>
      )}
      {recs && (
        <div className="space-y-3">
          {recs.recommended_price && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-[#101014] rounded-xl">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('dealer.current_price')}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPrice(car.price)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('dealer.recommended_price')}</p>
                <p className={cn('text-xl font-bold', recs.recommended_price < car.price ? 'text-amber-500' : 'text-emerald-600')}>
                  {formatPrice(recs.recommended_price)}
                </p>
              </div>
            </div>
          )}
          {recs.priority_action && (
            <div className="flex gap-3 p-3 bg-[#101014] border border-[#292a32] text-white rounded-xl">
              <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{t('dealer.priority_1')}</p>
                <p className="text-sm font-medium">{recs.priority_action}</p>
              </div>
            </div>
          )}
          {(recs.recommendations || []).map((rec, i) => (
            <div key={i} className="flex gap-2 p-3 bg-[#101014] rounded-xl">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300">{rec}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}