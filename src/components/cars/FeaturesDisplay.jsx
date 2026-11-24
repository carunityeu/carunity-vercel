import React from 'react';
import { useTranslation } from 'react-i18next';
import { Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bundledTranslations } from '@/lib/bundledTranslations';

const FEATURE_TREE = {
  interior: {
    titleKey: 'features.interior',
    items: [
      { key: 'leather_interior' },
      { key: 'velour_interior' },
      { key: 'alcantara' },
      { key: 'heated_seats', children: ['rear_heated_seats'] },
      { key: 'ventilated_seats' },
      { key: 'massage_seats' },
      { key: 'heated_steering' },
      { key: 'electric_seats' },
      { key: 'memory_seats' },
      { key: 'sport_seats' },
      { key: 'sunroof' },
      { key: 'panoramic_roof' },
      { key: 'glass_roof' },
      { key: 'climate_control', children: ['dual_zone_climate', 'triple_zone_climate'] },
      { key: 'ac' },
      { key: 'third_row' },
      { key: 'wood_trim' },
    ],
  },
  multimedia: {
    titleKey: 'features.multimedia',
    items: [
      { key: 'navigation' },
      { key: 'carplay' },
      { key: 'bluetooth' },
      { key: 'usb' },
      { key: 'aux' },
      { key: 'wireless_charging' },
      { key: 'wifi' },
      { key: 'audio_system', children: ['bose', 'harman_kardon', 'bang_olufsen'] },
      { key: 'digital_dash' },
      { key: 'hud' },
      { key: 'rear_monitor' },
      { key: 'dvd_tv' },
    ],
  },
  safety: {
    titleKey: 'features.safety',
    items: [
      { key: 'abs' },
      { key: 'esp' },
      { key: 'airbags', children: ['front_airbags', 'side_airbags', 'knee_airbags'] },
      { key: 'lane_assist' },
      { key: 'auto_emergency_braking' },
      { key: 'blind_spot' },
      { key: 'adaptive_cruise' },
      { key: 'pedestrian_warning' },
      { key: 'fatigue_sensor' },
      { key: 'lane_departure' },
      { key: 'night_vision' },
      { key: 'sign_recognition' },
      { key: 'parking_assist' },
      { key: 'auto_parking' },
    ],
  },
  exterior: {
    titleKey: 'features.exterior',
    items: [
      { key: 'alloy_wheels' },
      { key: 'winter_tires' },
      { key: 'summer_tires' },
      { key: 'second_tires' },
      { key: 'parking_sensors', children: ['front_parktronic', 'rear_parktronic'] },
      { key: 'rear_camera' },
      { key: 'camera_360' },
      { key: 'electric_trunk' },
      { key: 'tow_bar' },
      { key: 'roof_rails' },
      { key: 'side_steps' },
      { key: 'spoiler' },
      { key: 'xenon' },
      { key: 'led' },
      { key: 'matrix_lights' },
      { key: 'adaptive_light' },
      { key: 'headlight_washers' },
      { key: 'tinting' },
      { key: 'chrome' },
      { key: 'heated_mirrors' },
      { key: 'folding_mirrors' },
    ],
  },
  suspension: {
    titleKey: 'features.suspension',
    items: [
      { key: 'air_suspension' },
      { key: 'adaptive_suspension' },
      { key: 'sport_suspension' },
      { key: 'lowered_suspension' },
      { key: 'diff_lock' },
      { key: 'electronic_diff' },
      { key: 'drive_modes' },
      { key: 'regenerative_braking' },
    ],
  },
  other: {
    titleKey: 'features.other',
    items: [
      { key: 'cruise_control' },
      { key: 'electric_windows' },
      { key: 'electric_mirrors' },
      { key: 'keyless' },
      { key: 'remote_start' },
      { key: 'alarm' },
      { key: 'immobilizer' },
      { key: 'spare_wheel' },
      { key: 'space_saver' },
      { key: 'tow_hook' },
      { key: 'engine_guard' },
      { key: 'floor_mats' },
      { key: 'trunk_mats' },
      { key: 'window_deflectors' },
    ],
  },
};

const CHILD_TO_PARENT = {};
for (const cat of Object.values(FEATURE_TREE)) {
  for (const item of cat.items) {
    if (item.children) {
      for (const child of item.children) {
        CHILD_TO_PARENT[child] = item.key;
      }
    }
  }
}

const ALL_KNOWN_KEYS = new Set();
for (const cat of Object.values(FEATURE_TREE)) {
  for (const item of cat.items) {
    ALL_KNOWN_KEYS.add(item.key);
    if (item.children) item.children.forEach(c => ALL_KNOWN_KEYS.add(c));
  }
}

// Нормализация подписи для сопоставления
const normLabel = (value) => String(value || '').toLowerCase().replace(/[\s\-_/().,:]+/g, '');

// Синонимы опций, которые встречаются в объявлениях вместо словарных названий
const FEATURE_SYNONYMS = {
  parking_sensors: ['Парктроник', 'Парктроники', 'Parktronic'],
  alloy_wheels: ['Литые диски'],
};

// Старые объявления хранят читаемые названия опций, поэтому сопоставляем их
// с известными ключами (по подписям на всех языках платформы).
const LABEL_TO_KEY = (() => {
  const map = {};
  for (const dict of Object.values(bundledTranslations || {})) {
    for (const [key, label] of Object.entries(dict?.feature_items || {})) {
      const n = normLabel(label);
      if (n && !map[n]) map[n] = key;
    }
  }
  for (const [key, labels] of Object.entries(FEATURE_SYNONYMS)) {
    for (const label of labels) {
      const n = normLabel(label);
      if (n && !map[n]) map[n] = key;
    }
  }
  for (const key of ALL_KNOWN_KEYS) {
    const n = normLabel(key);
    if (n && !map[n]) map[n] = key;
  }
  return map;
})();

const resolveFeatureKey = (value) => LABEL_TO_KEY[normLabel(value)] || value;

export default function FeaturesDisplay({ features = [] }) {
  const { t } = useTranslation();
  const resolvedFeatures = features.map(resolveFeatureKey);
  const featSet = new Set(resolvedFeatures);

  // Опции, которых нет в дереве, попадают в раздел «Прочее»
  const customFeatures = [...new Set(resolvedFeatures.filter(f => !ALL_KNOWN_KEYS.has(f)))];

  const categories = Object.entries(FEATURE_TREE).map(([catKey, cat]) => {
    const visibleItems = [];

    for (const item of cat.items) {
      const itemPresent = featSet.has(item.key);

      if (item.children) {
        const presentChildren = item.children.filter(c => featSet.has(c));
        if (itemPresent || presentChildren.length > 0) {
          visibleItems.push({
            key: item.key,
            presentChildren,
            parentPresent: itemPresent,
          });
        }
      } else {
        if (itemPresent) {
          visibleItems.push({ key: item.key, presentChildren: [], parentPresent: true });
        }
      }
    }

    if (catKey === 'other') {
      customFeatures.forEach((label) => visibleItems.push({ key: label, presentChildren: [], parentPresent: true }));
    }

    if (visibleItems.length === 0) return null;

    return (
      <div key={catKey}>
        <h4 className="text-sm font-bold text-white mb-2">
          {t(cat.titleKey)}
        </h4>
        <ul className="flex flex-wrap gap-1.5 sm:flex-col sm:flex-nowrap sm:gap-2">
          {visibleItems.map(item => {
            const label = t('feature_items.' + item.key, item.key);
            return (
              <li key={item.key} className="rounded-lg bg-slate-800 px-3 py-1.5 sm:px-3.5 sm:py-2.5">
                <span className={cn(
                  'text-sm leading-5 flex flex-wrap items-center gap-x-2 gap-y-1',
                  item.parentPresent ? 'text-white' : 'text-slate-400'
                )}>
                  {label}
                  {item.presentChildren.map(child => (
                    <span key={child} className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-400">
                      <Minus className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" strokeWidth={3} />
                      {t('feature_items.' + child, child)}
                    </span>
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }).filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
      {categories}
    </div>
  );
}