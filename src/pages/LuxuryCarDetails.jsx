import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LuxuryCarDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      base44.entities.LuxuryCar.filter({ id }).then(([data]) => {
        setCar(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-500">
      {t('car.not_found_title', 'Автомобиль не найден')}
    </div>
  );

  const price = new Intl.NumberFormat('ru-RU').format(car.price);

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-300" />
        </button>
        {car.location && (
          <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2 text-sm text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{car.location}</span>
          </div>
        )}
      </div>

      {/* MAIN CONTENT — desktop: overlay cards, mobile: stacked */}
      <div className="flex-1 px-4 sm:px-8 pb-6">

        {/* Title */}
        <div className="mb-4">
          {car.condition && (
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">{car.condition}</p>
          )}
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-none">
            {car.brand} {car.model}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {car.subtitle || [
              car.fuel_type ? t('fuel_types.' + car.fuel_type, car.fuel_type) : '',
              car.year ? `${car.year} ${t('catalog.year_suffix', 'г.')}` : ''
            ].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Car image */}
        <div className="flex items-center justify-center my-4 sm:my-6">
          {car.image ? (
            <img
              src={car.image}
              alt={`${car.brand} ${car.model}`}
              className="w-full object-contain drop-shadow-2xl"
              style={{ maxHeight: '320px' }}
            />
          ) : (
            <div className="text-slate-700 text-sm py-16">{t('luxury.photo_soon', 'Фото не добавлено')}</div>
          )}
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

          {/* Card 1 — Engine */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">{t('car_specs.engine', 'Двигатель')}</p>
            <div className="space-y-2">
              {car.engine_power && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_power', 'Мощность')}</span>
                  <span className="text-sm font-bold text-white">{car.engine_power} {t('car.hp', 'л.с.')}</span>
                </div>
              )}
              {car.engine_volume && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_engine_vol', 'Объём')}</span>
                  <span className="text-sm font-bold text-white">{car.engine_volume} {t('car.liters', 'л')}</span>
                </div>
              )}
              {car.fuel_type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_fuel', 'Топливо')}</span>
                  <span className="text-sm font-bold text-white">{t('fuel_types.' + car.fuel_type, car.fuel_type)}</span>
                </div>
              )}
              {car.transmission && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_gearbox', 'КПП')}</span>
                  <span className="text-sm font-bold text-white">{t('transmission_types.' + car.transmission, car.transmission)}</span>
                </div>
              )}
              {car.drive_type && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_drive', 'Привод')}</span>
                  <span className="text-sm font-bold text-white">{t('drive_types.' + car.drive_type, car.drive_type)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2 — General Info */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">{t('car.specs', 'Характеристики')}</p>
            <div className="space-y-2">
              {car.year && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_year', 'Год')}</span>
                  <span className="text-sm font-bold text-white">{car.year}</span>
                </div>
              )}
              {car.mileage > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_mileage', 'Пробег')}</span>
                  <span className="text-sm font-bold text-white">{new Intl.NumberFormat('ru-RU').format(car.mileage)} {t('car.km', 'км')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_mileage', 'Пробег')}</span>
                  <span className="text-sm font-bold text-emerald-400">{t('conditions.new', 'Новый')}</span>
                </div>
              )}
              {car.color && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_color', 'Цвет')}</span>
                  <span className="text-sm font-bold text-white">{car.color}</span>
                </div>
              )}
              {car.condition && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('car.spec_condition', 'Состояние')}</span>
                  <span className="text-sm font-bold text-white">{car.condition}</span>
                </div>
              )}
              {car.features?.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{t('luxury_details.options', 'Опции')}</span>
                  <span className="text-sm font-bold text-white">{car.features.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3 — Price & Actions */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{t('luxury_details.price', 'Цена')}</p>
            <p className="text-3xl font-bold text-white mb-3">
              {price} <span className="text-lg text-slate-500">€</span>
            </p>
            {car.features?.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {car.features.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-slate-400 truncate">{f}</span>
                  </div>
                ))}
                {car.features.length > 3 && (
                  <p className="text-xs text-slate-600">+{car.features.length - 3} {t('luxury_details.more_options', 'опций')}</p>
                )}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Link to="/Messages">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                  {t('car.write_seller', 'Связаться с продавцом')}
                </button>
              </Link>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors">
                {t('luxury_details.test_drive', 'Запросить тест-драйв')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}