import React from 'react';
import { useTranslation } from 'react-i18next';
import { translateColor } from '@/utils/colorUtils';
import { translateCountry } from '@/utils/locationUtils';
import { isElectricFuel } from '@/lib/fuelBadge';

// Силуэты по типу кузова (боковой и фронтальный вид)
const bodySilhouettes = {
  sedan: {
    side: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/sedan_side.png',
    front: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/sedan_front.png',
  },
  default: {
    side: null,
    front: null,
  }
};

function SpecRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-sm text-slate-400 pr-4">{label}</span>
      <span className="text-sm font-bold text-white text-right">{value}</span>
    </div>
  );
}

function SpecGroup({ title, rows }) {
  const filled = rows.filter(r => r.value != null && r.value !== '' && r.value !== false);
  if (filled.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <div>
        {filled.map((row, i) => (
          <SpecRow key={i} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

export default function CarSpecsGrouped({ car, plateRevealed, onRevealPlate }) {
  const { t, i18n } = useTranslation();

  const fuelLabels = {
    petrol: t('fuel_types.petrol', 'Бензин'), diesel: t('fuel_types.diesel', 'Дизель'),
    electric: t('fuel_types.electric', 'Электро'), hybrid: t('fuel_types.hybrid', 'Гибрид'),
    plugin_hybrid: t('fuel_types.plugin_hybrid', 'Plug-in гибрид'), gas: t('fuel_types.gas', 'Газ')
  };
  const transmissionLabels = {
    manual: t('transmission_types.manual', 'Механика'),
    automatic: t('transmission_types.automatic', 'Автомат')
  };
  const bodyLabels = {
    sedan: t('body_types.sedan', 'Седан'), hatchback: t('body_types.hatchback', 'Хэтчбек'),
    suv: t('body_types.suv', 'Внедорожник'), crossover: t('body_types.crossover', 'Кроссовер'),
    wagon: t('body_types.wagon', 'Универсал'), coupe: t('body_types.coupe', 'Купе'),
    convertible: t('body_types.convertible', 'Кабриолет'), minivan: t('body_types.minivan', 'Минивэн'),
    pickup: t('body_types.pickup', 'Пикап')
  };
  const driveLabels = {
    fwd: t('drive_types.fwd', 'Передний'), rwd: t('drive_types.rwd', 'Задний'), awd: t('drive_types.awd', 'Полный')
  };

  const monthNames = [
    t('months.jan','Янв'), t('months.feb','Фев'), t('months.mar','Мар'), t('months.apr','Апр'),
    t('months.may','Май'), t('months.jun','Июн'), t('months.jul','Июл'), t('months.aug','Авг'),
    t('months.sep','Сен'), t('months.oct','Окт'), t('months.nov','Ноя'), t('months.dec','Дек')
  ];
  const yearLabel = car.month_of_manufacture
    ? `${monthNames[car.month_of_manufacture - 1]} ${car.year}`
    : `${car.year}`;

  return (
    <div>
      {/* Grouped specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        <div>
          <SpecGroup title={t('car.specs_general', 'Общая информация')} rows={[
            { label: t('car.spec_class', 'Класс'), value: car.car_class },
            { label: t('car.spec_body', 'Тип кузова'), value: bodyLabels[car.body_type] || car.body_type },
            { label: t('car.spec_doors', 'Дверей'), value: car.doors },
            { label: t('car.spec_seats', 'Мест'), value: car.seats },
            { label: t('car.spec_color', 'Цвет'), value: translateColor(car.color, i18n) },
            { label: t('car.spec_color_interior', 'Цвет интерьера'), value: translateColor(car.color_interior, i18n) },
            { label: t('car.spec_year', 'Год выпуска'), value: yearLabel },
            { label: t('car.spec_owners', 'Владельцев'), value: car.owners_count != null ? car.owners_count : null },
            { label: t('car.spec_trim', 'Комплектация'), value: car.trim_level },
            { label: t('car.spec_country', 'Страна'), value: car.country ? translateCountry(t, car.country) : null },
            { label: 'VIN', value: car.vin },
            { label: t('car.spec_inspection', 'Техосмотр до'), value: car.technical_inspection_until ? (() => { const d = car.technical_inspection_until.split('-'); return `${monthNames[parseInt(d[1])-1]} ${d[0]}`; })() : null },
            { label: t('car.spec_condition', 'Состояние'), value: car.condition === 'new' ? t('conditions.new','Новый') : car.condition === 'used' ? t('conditions.used','С пробегом') : car.condition === 'accident_free' ? t('conditions.accident_free','Б/у, без аварий') : null },
          ]} />

          <SpecGroup title={t('car.specs_engine', 'Двигатель')} rows={[
            { label: t('car.spec_fuel', 'Тип топлива'), value: fuelLabels[car.fuel_type] || car.fuel_type },
            { label: t('car.spec_engine_volume', 'Объём'), value: car.engine_volume ? `${car.engine_volume} ${t('car.liters')}` : null },
            { label: t('car.spec_engine_volume_cc', 'Объём (см³)'), value: car.engine_volume_cc ? `${car.engine_volume_cc} ${t('car.cc')}` : null },
            { label: t('car.spec_power', 'Мощность'), value: car.engine_power ? `${car.engine_power} ${t('car.hp','л.с.')} / ${Math.round(car.engine_power * 0.7355)} ${t('car.kw')}` : null },
            { label: t('car.spec_cylinders', 'Цилиндров'), value: car.cylinders },
            { label: t('car.spec_engine_code', 'Код двигателя'), value: car.engine_code },
            { label: t('car.spec_fuel_system', 'Система питания'), value: car.fuel_system },
            { label: t('car.spec_turbo', 'Тип наддува'), value: car.turbo_type },
            { label: t('car.spec_engine_layout', 'Расположение'), value: car.engine_layout },
            { label: t('car.spec_emission', 'Экол. класс'), value: car.emission_class },
            { label: 'CO₂', value: car.co2_emissions ? `${car.co2_emissions} ${t('car.g_km')}` : null },
          ]} />

          <SpecGroup title={t('car.specs_transmission', 'Трансмиссия и привод')} rows={[
            { label: t('car.spec_gearbox', 'Коробка передач'), value: transmissionLabels[car.transmission] || car.transmission },
            { label: t('car.spec_transmission_type', 'Тип КПП'), value: car.transmission_type },
            { label: t('car.spec_drive', 'Привод'), value: driveLabels[car.drive_type] || car.drive_type },
          ]} />
        </div>

        <div>
          <SpecGroup title={t('car.specs_suspension', 'Подвеска и тормоза')} rows={[
            { label: t('car.spec_front_suspension', 'Передняя подвеска'), value: car.front_suspension },
            { label: t('car.spec_rear_suspension', 'Задняя подвеска'), value: car.rear_suspension },
            { label: t('car.spec_front_brakes', 'Передние тормоза'), value: car.front_brakes },
            { label: t('car.spec_rear_brakes', 'Задние тормоза'), value: car.rear_brakes },
          ]} />

          <SpecGroup title={t('car.specs_dimensions', 'Размеры и масса')} rows={[
            { label: t('car.spec_length', 'Длина'), value: car.length_mm ? `${car.length_mm} ${t('car.mm','мм')}` : null },
            { label: t('car.spec_width', 'Ширина'), value: car.width_mm ? `${car.width_mm} ${t('car.mm','мм')}` : null },
            { label: t('car.spec_height', 'Высота'), value: car.height_mm ? `${car.height_mm} ${t('car.mm','мм')}` : null },
            { label: t('car.spec_wheelbase', 'Колёсная база'), value: car.wheelbase_mm ? `${car.wheelbase_mm} ${t('car.mm','мм')}` : null },
            { label: t('car.spec_clearance', 'Клиренс'), value: car.clearance_mm ? `${car.clearance_mm} ${t('car.mm','мм')}` : null },
            { label: t('car.spec_weight_empty', 'Масса снаряж.'), value: car.weight_empty_kg ? `${car.weight_empty_kg} ${t('car.kg','кг')}` : null },
            { label: t('car.spec_weight_max', 'Масса макс.'), value: car.weight_max_kg ? `${car.weight_max_kg} ${t('car.kg','кг')}` : null },
            { label: t('car.spec_trunk', 'Объём багажника'), value: car.trunk_volume ? `${car.trunk_volume} ${t('car.liters')}` : null },
          ]} />

          <SpecGroup title={t('car.specs_performance', 'Эксплуатационные показатели')} rows={[
            { label: t('car.spec_max_speed', 'Макс. скорость'), value: car.max_speed_kmh ? `${car.max_speed_kmh} ${t('car.kmh','км/ч')}` : null },
            { label: t('car.spec_acceleration', 'Разгон 0–100'), value: car.acceleration_0_100 ? `${car.acceleration_0_100} ${t('car.sec','с')}` : null },
            { label: t('car.spec_fuel_city', 'Расход: город'), value: car.fuel_consumption_city ? `${car.fuel_consumption_city} ${t('car.l_100km')}` : null },
            { label: t('car.spec_fuel_highway', 'Расход: трасса'), value: car.fuel_consumption_highway ? `${car.fuel_consumption_highway} ${t('car.l_100km')}` : null },
            { label: t('car.spec_fuel_combined', 'Расход: комбо'), value: car.fuel_consumption_combined ? `${car.fuel_consumption_combined} ${t('car.l_100km')}` : null },
            { label: t('car.spec_energy_consumption', 'Расход (электро)'), value: isElectricFuel(car.fuel_type) && car.energy_consumption ? `${car.energy_consumption} ${t('car.kwh_100km', 'кВт·ч/100км')}` : null },
            { label: t('car.spec_fuel_tank', 'Объём бака'), value: car.fuel_tank_volume ? `${car.fuel_tank_volume} ${t('car.liters')}` : null },
            { label: t('car.spec_power_to_weight', 'Удельная масса'), value: car.power_to_weight ? `${car.power_to_weight} ${t('car.kg','кг')}/${t('car.hp','л.с.')}` : null },
          ]} />

          {car.license_plate && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{t('car.specs_documents', 'Документы')}</h3>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('car.spec_plate', 'Номерной знак')}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-sm font-mono tracking-widest text-slate-900 dark:text-white ${!plateRevealed ? 'blur-sm select-none' : ''}`}>
                    {car.license_plate}
                  </span>
                  {!plateRevealed && (
                    <button onClick={onRevealPlate} className="text-xs px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors">
                      {t('common.show', 'Показать')}
                    </button>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}