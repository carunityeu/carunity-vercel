import React from 'react';
import { Calendar, Gauge, Fuel, Cog, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DealerProfileCarSpecs({ car }) {
  const { t, i18n } = useTranslation();
  const specs = [
    car.year && { key: 'year', icon: Calendar, label: car.year },
    car.mileage != null && { key: 'mileage', icon: Gauge, label: `${new Intl.NumberFormat(i18n.language).format(car.mileage)} ${t('car.km')}` },
    car.fuel_type && { key: 'fuel', icon: Fuel, label: t(`fuel_types.${car.fuel_type}`, car.fuel_type) },
    car.transmission && { key: 'transmission', icon: Cog, label: t(`transmission_types.${car.transmission}`, car.transmission) },
    car.engine_power && { key: 'power', icon: Zap, label: `${car.engine_power} ${t('car.hp')}` },
    car.body_type && { key: 'body', label: t(`body_types.${car.body_type}`, car.body_type) },
    car.drive_type && { key: 'drive', label: t(`home.drive_${car.drive_type}`, car.drive_type) }
  ].filter(Boolean);
  return <div className="flex flex-wrap gap-1.5">{specs.map(({ key, icon: Icon, label }) => <span key={key} className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-input px-2 py-1 text-xs font-medium text-foreground sm:text-sm">{Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}<span className="break-words">{label}</span></span>)}</div>;
}