import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const featureSections = [
  { titleKey: 'features.interior', items: ['Кожаный салон', 'Велюровый салон', 'Алькантара', 'Подогрев сидений', 'Вентиляция сидений', 'Массаж сидений', 'Подогрев руля', 'Электрорегулировка сидений', 'Память сидений', 'Спортивные сиденья', 'Люк', 'Панорамная крыша', 'Стеклянная крыша', 'Климат-контроль', 'Двухзонный климат-контроль', 'Трёхзонный климат-контроль', 'Кондиционер', 'Подогрев задних сидений', 'Третий ряд сидений', 'Отделка деревом'] },
  { titleKey: 'features.multimedia', items: ['Навигация', 'CarPlay / Android Auto', 'Bluetooth', 'USB', 'AUX', 'Беспроводная зарядка', 'Wi-Fi роутер', 'Аудиосистема', 'Аудиосистема Bose', 'Аудиосистема Harman Kardon', 'Аудиосистема Bang & Olufsen', 'Цифровая приборная панель', 'Проекционный дисплей (HUD)', 'Задний монитор', 'DVD / TV'] },
  { titleKey: 'features.safety', items: ['ABS', 'ESP', 'Airbags', 'Система удержания полосы', 'Автоэкстренное торможение', 'Слепые зоны', 'Адаптивный круиз-контроль', 'Подушки безопасности боковые', 'Подушки безопасности фронтальные', 'Предупреждение о пешеходах', 'Датчик усталости водителя', 'Ночное видение', 'Распознавание знаков', 'Ассистент парковки', 'Автоматическая парковка'] },
  { titleKey: 'features.exterior', items: ['Легкосплавные диски', 'Зимняя резина', 'Второй комплект резины', 'Парктроник передний', 'Парктроник задний', 'Камера заднего вида', 'Камера 360°', 'Электропривод багажника', 'Фаркоп', 'Рейлинги', 'Ксеноновые фары', 'LED фары', 'Матричные фары', 'Адаптивный свет', 'Тонировка', 'Электрические зеркала с подогревом', 'Складывающиеся зеркала'] },
  { titleKey: 'features.suspension', items: ['Пневмоподвеска', 'Адаптивная подвеска', 'Спортивная подвеска', 'Блокировка дифференциала', 'Электронный дифференциал', 'Режимы езды (Sport/Eco/Comfort)', 'Рекуперативное торможение'] },
  { titleKey: 'features.other', items: ['Круиз-контроль', 'Электростеклоподъёмники', 'Бесключевой доступ', 'Автозапуск', 'Сигнализация', 'Иммобилайзер', 'Запасное колесо', 'Докатка', 'Буксировочный крюк', 'Защита картера'] },
];

const featureSectionTitles = {
  'features.interior': 'Салон',
  'features.multimedia': 'Мультимедиа',
  'features.safety': 'Безопасность',
  'features.exterior': 'Внешнее оборудование',
  'features.suspension': 'Подвеска и трансмиссия',
  'features.other': 'Прочее',
};

export default function FeaturesFilter({ selected, onChange }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const toggle = (item) => {
    if (selected.includes(item)) {
      onChange(selected.filter(f => f !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const query = search.toLowerCase().trim();

  const filteredSections = featureSections.map(section => ({
    ...section,
    items: query
      ? section.items.filter(item => item.toLowerCase().includes(query))
      : section.items,
  })).filter(section => section.items.length > 0);

  return (
    <div className="pt-2 space-y-3">
      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <Input
          placeholder={t('filters.search_feature', 'Поиск опции...')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-xs"
        />
      </div>

      {/* Sections */}
      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {filteredSections.map(section => (
          <div key={section.titleKey}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {t(section.titleKey, featureSectionTitles[section.titleKey])}
            </p>
            <div className="space-y-1.5">
              {section.items.map(item => (
                <div key={item} className="flex items-center gap-2">
                  <Checkbox
                    id={`feat-${item}`}
                    checked={selected.includes(item)}
                    onCheckedChange={() => toggle(item)}
                    className="h-4 w-4 flex-shrink-0"
                  />
                  <label htmlFor={`feat-${item}`} className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer leading-snug">
                    {item}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredSections.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-3">
            {t('filters.no_features_found', 'Ничего не найдено')}
          </p>
        )}
      </div>
    </div>
  );
}