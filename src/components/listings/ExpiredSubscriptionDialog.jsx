import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RefreshCw, Tag, Loader2, Clock } from 'lucide-react';

// Shows after 30 days: ask if sold, if not — offer 15% discount.
// Cannot be dismissed — user MUST answer.
export default function ExpiredSubscriptionDialog({ car, open, onClose, onMarkSold, onRenew }) {
  const [step, setStep] = useState('ask'); // 'ask' | 'sold' | 'discount'
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) setStep('ask');
  }, [open]);

  if (!car || !open) return null;

  const handleSold = async () => {
    setIsLoading(true);
    await onMarkSold(car.id);
    setStep('sold');
    setIsLoading(false);
  };

  const handleRenew = async (withDiscount) => {
    setIsLoading(true);
    await onRenew(car.id, withDiscount);
    setIsLoading(false);
    onClose();
  };

  return (
    // Full-screen overlay, no click-to-close
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />

        <div className="p-6">
          {step === 'ask' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Срок размещения истёк</h2>
                  <p className="text-sm text-slate-500">30 дней активного размещения</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-1">
                Объявление <span className="font-semibold text-slate-900 dark:text-white">{car.brand} {car.model} {car.year}</span> было активно 30 дней.
              </p>
              <p className="text-slate-700 dark:text-slate-300 mt-4 font-semibold text-base">Вы продали автомобиль?</p>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <Button
                  variant="outline"
                  className="flex-1 gap-2 h-11"
                  onClick={() => setStep('discount')}
                >
                  <RefreshCw className="w-4 h-4" />
                  Нет, ещё продаю
                </Button>
                <Button
                  className="flex-1 gap-2 h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleSold}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Да, продал!
                </Button>
              </div>
            </>
          )}

          {step === 'sold' && (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Поздравляем! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Объявление помечено как «Продано». Спасибо, что воспользовались CarUnity!</p>
              <Button onClick={onClose} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white">
                Отлично!
              </Button>
            </div>
          )}

          {step === 'discount' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Специальное предложение</h2>
                  <p className="text-sm text-slate-500">Только сейчас!</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Продлите размещение со скидкой <span className="font-bold text-emerald-600 text-lg">30%</span> прямо сейчас.
              </p>

              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-400 line-through">9.99€ / 30 дней</span>
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">−30%</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600">6.99€ <span className="text-sm font-normal text-slate-500">/ 30 дней</span></div>
              </div>

              <p className="text-xs text-slate-400 mb-5">Предложение действует только сейчас. После закрытия скидка не применяется.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 text-sm text-slate-500"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Оплатить позже
                </Button>
                <Button
                  className="flex-1 gap-2 h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => handleRenew(true)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                  Продлить за 6.99€
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}