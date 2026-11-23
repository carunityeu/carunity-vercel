import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Bike, ChevronRight, ChevronLeft, Loader2, Gauge, Zap, Calendar, Cog, Wrench, Fuel, Thermometer, Bike as BikeIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MotorcycleModelDetails() {
  const { t } = useTranslation();
  const urlParams = new URLSearchParams(window.location.search);
  const modelId = urlParams.get('id');
  const [userRating, setUserRating] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const voted = localStorage.getItem(`voted_moto_${modelId}`);
    if (voted) setHasVoted(true);
  }, [modelId]);

  const { data: model, isLoading } = useQuery({
    queryKey: ['motorcycleModel', modelId],
    queryFn: () => entities.MotorcycleModelInfo.filter({ id: modelId }),
    select: (data) => data[0],
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
  });

  const { data: relatedModels = [] } = useQuery({
    queryKey: ['motorcycleRelated', model?.brand],
    queryFn: () => entities.MotorcycleModelInfo.filter({ brand: model.brand }, 'model', 6),
    enabled: !!model?.brand,
    select: (data) => data.filter(m => m.id !== modelId).slice(0, 4),
    staleTime: 5 * 60 * 1000,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
  });

  const voteMutation = useQuery({
    queryKey: ['voteMoto'],
    enabled: false
  });

  const handleVote = async (rating) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    const currentRating = model.user_rating || 0;
    const currentVotes = model.rating_votes || 0;
    const newVotes = currentVotes + 1;
    const newRating = ((currentRating * currentVotes) + rating) / newVotes;
    await entities.MotorcycleModelInfo.update(modelId, {
      user_rating: Math.round(newRating * 10) / 10,
      rating_votes: newVotes
    });
    setUserRating(rating);
    setHasVoted(true);
    localStorage.setItem(`voted_moto_${modelId}`, '1');
    window.location.reload();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!model) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Bike className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">{t('moto_details.not_found', 'Модель не найдена')}</p>
        <Link to="/MotorcycleBrands"><Button className="mt-4">{t('moto_details.to_brands', 'К маркам мотоциклов')}</Button></Link>
      </div>
    </div>
  );

  const specs = [
    { label: t('moto_specs.displacement', 'Объём двигателя'), value: model.displacement_cc, unit: t('moto_specs.cc', 'куб.см'), icon: Gauge },
    { label: t('moto_specs.power', 'Мощность'), value: model.power_hp, unit: t('moto_specs.hp', 'л.с.'), icon: Zap },
    { label: t('moto_specs.torque', 'Крутящий момент'), value: model.torque_nm, unit: 'Нм', icon: Zap },
    { label: t('moto_specs.weight', 'Сухой вес'), value: model.dry_weight_kg, unit: t('moto_specs.kg', 'кг'), icon: Cog },
    { label: t('moto_specs.bore', 'Диаметр цилиндра'), value: model.bore_mm, unit: 'мм', icon: Wrench },
    { label: t('moto_specs.stroke', 'Ход поршня'), value: model.stroke_mm, unit: 'мм', icon: Wrench },
    { label: t('moto_specs.fuel_capacity', 'Объём бака'), value: model.fuel_capacity_l, unit: 'л', icon: Fuel },
    { label: t('moto_specs.wheelbase', 'Колёсная база'), value: model.wheelbase_mm, unit: 'мм', icon: Gauge },
    { label: t('moto_specs.seat_height', 'Высота сиденья'), value: model.seat_height_mm, unit: 'мм', icon: Gauge },
  ];

  const textSpecs = [
    { label: t('moto_specs.engine_cylinder', 'Двигатель'), value: model.engine_cylinder },
    { label: t('moto_specs.engine_stroke', 'Такт двигателя'), value: model.engine_stroke },
    { label: t('moto_specs.gearbox', 'Коробка передач'), value: model.gearbox },
    { label: t('moto_specs.cooling', 'Охлаждение'), value: model.cooling_system },
    { label: t('moto_specs.transmission', 'Тип трансмиссии'), value: model.transmission_type },
    { label: t('moto_specs.fuel_system', 'Система питания'), value: model.fuel_system },
    { label: t('moto_specs.fuel_control', 'Управление топливом'), value: model.fuel_control },
    { label: t('moto_specs.front_brakes', 'Передние тормоза'), value: model.front_brakes },
    { label: t('moto_specs.rear_brakes', 'Задние тормоза'), value: model.rear_brakes },
    { label: t('moto_specs.front_suspension', 'Передняя подвеска'), value: model.front_suspension },
    { label: t('moto_specs.rear_suspension', 'Задняя подвеска'), value: model.rear_suspension },
    { label: t('moto_specs.front_tire', 'Передняя шина'), value: model.front_tire },
    { label: t('moto_specs.rear_tire', 'Задняя шина'), value: model.rear_tire },
    { label: t('moto_specs.category', 'Категория'), value: model.category },
    { label: t('moto_specs.color_options', 'Цвета'), value: model.color_options },
  ].filter(s => s.value);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 flex-wrap">
          <Link to="/MotorcycleBrands" className="hover:text-emerald-600 transition-colors">{t('moto_details.breadcrumb_brands', 'Марки мотоциклов')}</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/MotorcycleModels?brand=${encodeURIComponent(model.brand)}`} className="hover:text-emerald-600 transition-colors">{model.brand}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 dark:text-slate-300">{model.model}</span>
        </div>

        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.back', 'Назад')}
        </button>

        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {model.title}
            </h1>
            {model.year_start && (
              <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {model.year_start}{model.year_end && model.year_end !== model.year_start ? ` — ${model.year_end}` : ''}
                {model.category && <span className="ml-2 text-emerald-600 dark:text-emerald-400">· {model.category}</span>}
              </p>
            )}
          </div>
          {model.rating > 0 && (
            <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl px-4 py-3 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{t('moto_details.bikez_rating', 'Bikez рейтинг')}</p>
              <p className="text-2xl font-bold text-white">{model.rating.toFixed(1)}<span className="text-sm text-slate-400">/5</span></p>
            </div>
          )}
        </div>

        {/* Key specs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {specs.filter(s => s.value && s.value > 0).map((spec, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <spec.icon className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{spec.label}</span>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {spec.value} <span className="text-sm font-normal text-slate-400">{spec.unit}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Detailed specs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-500" />
            {t('moto_details.tech_specs', 'Технические характеристики')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {textSpecs.map((spec, i) => (
              <div key={i} className="flex justify-between items-start gap-2 py-2 border-b border-slate-100 dark:border-slate-700/50">
                <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">{spec.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User rating */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 mb-6">
          {model.user_rating > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white dark:text-white font-medium">
                  {t('moto_details.user_rating', 'Оценка пользователей')} — {model.user_rating.toFixed(1)} / 10
                </p>
                {model.rating_votes > 0 && (
                  <p className="text-slate-400 text-sm mt-1">
                    {t('moto_details.votes', 'На основе')} {model.rating_votes} {t('moto_details.votes_suffix', 'голосов')}
                  </p>
                )}
              </div>
            </div>
          )}
          <p className="font-semibold text-slate-900 dark:text-white mb-3">
            {hasVoted ? t('moto_details.voted', 'Вы уже оценили') : t('moto_details.rate_this', 'Оцените этот мотоцикл')}
          </p>
          {!hasVoted ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleVote(score)}
                  className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 font-semibold text-sm text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {score}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600">
              <span className="font-medium">{t('moto_details.voted_msg', 'Ваш голос учтён')}{userRating ? ` (${userRating}/10)` : ''}!</span>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 mb-6 space-y-3">
          <Link
            to={`/MotorcycleModels?brand=${encodeURIComponent(model.brand)}`}
            className="flex items-center justify-between text-emerald-600 hover:text-emerald-700 font-medium group"
          >
            <span>{t('moto_details.all_brand_models', 'Все')} {model.brand}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <div className="border-t border-slate-100 dark:border-slate-700" />
          <Link
            to="/MotorcycleBrands"
            className="flex items-center justify-between text-emerald-600 hover:text-emerald-700 font-medium group"
          >
            <span>{t('moto_details.all_brands', 'Все марки мотоциклов')}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Related models */}
        {relatedModels.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {t('moto_details.related', 'Похожие модели')} {model.brand}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedModels.map(m => (
                <Link
                  key={m.id}
                  to={`/MotorcycleModelDetails?id=${m.id}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-sm">
                    {m.title}
                  </h3>
                  {m.category && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{m.category}</p>}
                  {m.year_start && <p className="text-xs text-slate-400 mt-1">{m.year_start}{m.year_end && m.year_end !== m.year_start ? ` — ${m.year_end}` : ''}</p>}
                  <div className="flex gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {m.displacement_cc > 0 && <span>{Math.round(m.displacement_cc)} {t('moto_specs.cc', 'куб.см')}</span>}
                    {m.power_hp > 0 && <span>{Math.round(m.power_hp)} {t('moto_specs.hp', 'л.с.')}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}