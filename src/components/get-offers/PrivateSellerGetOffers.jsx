import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import { formatPrice } from '@/utils/format';
import {
  RefreshCw, Car, Plus, Eye, CheckCircle2, Clock, X, Check, MessageSquare, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_MAP = {
  pending: { label: 'Ожидает ответа', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Принято', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-700' },
  more_info_requested: { label: 'Запрошена инфо', color: 'bg-blue-100 text-blue-700' },
};

export default function PrivateSellerGetOffers({ user }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // My cars that are opted into Get Offers
  const { data: myCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['myGetOffersCars', user?.email],
    queryFn: () => entities.Car.filter({ created_by: user.email, status: 'active' }, '-created_date'),
    enabled: !!user,
  });

  const getOffersCars = myCars.filter(c => c.features?.includes('get_offers'));

  // My incoming trade-in offers
  const { data: offers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['myTradeInOffers', user?.email],
    queryFn: () => entities.TradeInOffer.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const handleResponse = async (offer, status, response = '') => {
    await entities.TradeInOffer.update(offer.id, { status, seller_response: response });
    queryClient.invalidateQueries(['myTradeInOffers']);
    toast.success(status === 'accepted' ? 'Предложение принято!' : 'Предложение отклонено');
  };

  const pendingOffers = offers.filter(o => o.status === 'pending');
  const answeredOffers = offers.filter(o => o.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* What is this */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Продайте авто быстро через дилеров</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t('consignment.privateIntro')}
            </p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Быстрая продажа
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Только проверенные дилеры
              </div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Бесплатно для продавца
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Как это работает</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Добавьте авто', desc: t('consignment.enableHint') },
            { step: '2', title: 'Дилеры делают офферы', desc: 'Дилеры видят ваш автомобиль и присылают предложения о выкупе или комиссии' },
            { step: '3', title: 'Выберите лучшее', desc: 'Примите понравившийся оффер и договоритесь о встрече' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{step}</div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My cars in Get Offers */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {t('consignment.myCars')}
            {getOffersCars.length > 0 && (
              <Badge className="ml-2 bg-emerald-100 text-emerald-700">{getOffersCars.length}</Badge>
            )}
          </h3>
          <Link to={createPageUrl('CreateListing')}>
            <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-3.5 h-3.5" /> Добавить авто
            </Button>
          </Link>
        </div>

        {loadingCars ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
        ) : getOffersCars.length === 0 ? (
          <div className="p-10 text-center">
            <Car className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{t('consignment.myEmpty')}<br />{t('consignment.emptyHint')}</p>
            <Link to={createPageUrl('CreateListing')}>
              <Button size="sm" className="h-auto max-w-full gap-1.5 whitespace-normal py-2 bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-3.5 h-3.5 shrink-0" /> {t('consignment.addCar')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {getOffersCars.map(car => {
              const carOffers = offers.filter(o => o.car_id === car.id);
              const pending = carOffers.filter(o => o.status === 'pending').length;
              return (
                <div key={car.id} className="p-4 flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {car.images?.[0]
                      ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Car className="w-5 h-5 text-slate-400" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{car.brand} {car.model} {car.year}</p>
                    <p className="text-emerald-600 font-semibold text-sm">{formatPrice(car.price)}</p>
                  </div>
                  {pending > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700">{pending} оффер{pending > 1 ? 'а' : ''}</Badge>
                  )}
                  <Link to={getCarDetailsPath(car)}>
                    <Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Incoming offers */}
      {offers.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Предложения от дилеров
              {pendingOffers.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-700">{pendingOffers.length} новых</Badge>
              )}
            </h3>
          </div>
          {loadingOffers ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {offers.map(offer => (
                <div key={offer.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{offer.car_title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">от {offer.dealer_name}</p>
                    </div>
                    <Badge className={STATUS_MAP[offer.status]?.color}>{STATUS_MAP[offer.status]?.label}</Badge>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-3">
                    {offer.offer_type === 'instant_buy' ? (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        💰 <strong>Выкуп:</strong> {formatPrice(offer.offered_price)}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        🤝 <strong>Комиссия:</strong> {offer.commission_percent}%
                      </p>
                    )}
                    {offer.message && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">«{offer.message}»</p>
                    )}
                  </div>

                  {offer.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => handleResponse(offer, 'accepted', 'Принято')}
                      >
                        <Check className="w-3.5 h-3.5" /> Принять
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleResponse(offer, 'rejected', 'Отклонено')}
                      >
                        <X className="w-3.5 h-3.5" /> Отклонить
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}