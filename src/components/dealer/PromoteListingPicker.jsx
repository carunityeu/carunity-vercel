import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Car, Eye, TrendingDown, TrendingUp, Rocket, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPromotionActive } from '@/components/listings/PromoteListingModal';

export default function PromoteListingPicker({
  open, onClose, dealerCars, dealerId, preselectedCarIds = [], onPromoteSelected,
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(new Set());

  const { data: dynamics = {}, isLoading: dynamicsLoading } = useQuery({
    queryKey: ['dealerCarDynamics', dealerId],
    queryFn: async () => {
      const res = await base44.functions.invoke('getDealerCarDynamics', { dealerId });
      return res.data?.dynamics || {};
    },
    enabled: !!dealerId && open,
  });

  useEffect(() => {
    if (open && preselectedCarIds.length > 0) {
      setSelected(new Set(preselectedCarIds));
    }
  }, [open, preselectedCarIds]);

  useEffect(() => {
    if (!open) setSelected(new Set());
  }, [open]);

  const toggleSelect = (carId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(carId)) next.delete(carId);
      else next.add(carId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === selectableCars.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableCars.map(c => c.id)));
    }
  };

  const handlePromote = () => {
    const selectedCars = selectableCars.filter(c => selected.has(c.id));
    if (selectedCars.length === 0) return;
    onClose();
    onPromoteSelected(selectedCars);
  };

  const selectableCars = dealerCars.filter(c => c.status === 'active');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#1b1b22] border-[#292a32] text-white w-[calc(100vw-2rem)] sm:w-full sm:max-w-3xl p-0 overflow-hidden h-[88dvh] sm:h-auto sm:max-h-[88dvh] !flex flex-col gap-0 rounded-2xl">
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-[#292a32] flex-shrink-0 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Rocket className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              {t('view_decline.picker_title', 'Продвижение объявлений')}
            </DialogTitle>
            {selectableCars.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
              >
                {selected.size === selectableCars.length
                  ? t('view_decline.picker_deselect_all', 'Снять выделение')
                  : t('view_decline.picker_select_all', 'Выбрать все')}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 pr-6">{t('promote.picker_hint', 'Шаг 1 из 2 · выберите машины')}</p>
        </DialogHeader>

        <div className="p-4 sm:p-5 space-y-2 overflow-y-auto flex-1">
          {selectableCars.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">{t('view_decline.picker_no_cars', 'У вас нет активных объявлений')}</p>
            </div>
          ) : (
            <>
              {dynamicsLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('view_decline.picker_loading', 'Загрузка динамики просмотров...')}
                </div>
              )}
              {selectableCars.map(car => {
                const isSelected = selected.has(car.id);
                const dyn = dynamics[car.id] || { recent_views: 0, prev_views: 0, decline_percent: 0 };
                const hasPromo = isPromotionActive(car);
                const isDeclining = dyn.decline_percent >= 30 && dyn.prev_views > 0;
                const isGrowing = dyn.prev_views > 0 && dyn.recent_views > dyn.prev_views;

                return (
                  <div
                    key={car.id}
                    onClick={() => toggleSelect(car.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/5"
                        : "border-[#292a32] hover:border-[#292a32] bg-[#101014]"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(car.id)}
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="w-14 h-12 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                      {car.images?.[0] ? (
                        <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-slate-600" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm font-medium truncate">{car.brand} {car.model}</span>
                        <span className="text-slate-500 text-xs">{car.year}</span>
                        {hasPromo && (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0">
                            {t('promote.premium_until_short', 'Премиум')}
                          </Badge>
                        )}
                        {isDeclining && (
                          <Badge className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] px-1.5 py-0 gap-0.5">
                            <TrendingDown className="w-2.5 h-2.5" />-{dyn.decline_percent}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-emerald-400 text-sm font-semibold">{car.price?.toLocaleString()} €</span>
                        <span className="text-slate-500 text-xs flex items-center gap-0.5">
                          <Eye className="w-3 h-3" /> {car.views_count || 0}
                        </span>
                        {dyn.prev_views > 0 && (
                          <span className={cn("text-xs flex items-center gap-0.5", isDeclining ? "text-red-400" : isGrowing ? "text-emerald-400" : "text-slate-500")}>
                            {isDeclining ? <TrendingDown className="w-3 h-3" /> : isGrowing ? <TrendingUp className="w-3 h-3" /> : null}
                            {dyn.recent_views}/{dyn.prev_views}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {selectableCars.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#292a32] flex-shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-slate-400 text-sm">
                {t('view_decline.picker_selected_count', { count: selected.size, defaultValue: `Выбрано: ${selected.size}` })}
              </span>
              <Button
                onClick={handlePromote}
                disabled={selected.size === 0}
                className="bg-emerald-500 hover:bg-emerald-600 gap-2 w-full sm:w-auto h-11"
              >
                <Rocket className="w-4 h-4" />
                {t('promote.picker_next', 'Далее: выбрать тарифы')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}