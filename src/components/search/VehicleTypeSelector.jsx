import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { createPageUrl } from '@/utils';

const greenFilter = 'brightness(0) saturate(100%) invert(54%) sepia(93%) saturate(450%) hue-rotate(118deg) brightness(96%) contrast(101%)';

const vehicleTypes = [
  { key: 'car', labelKey: 'home.vtype_car', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/3ed0c0079_sedaniconcu.png' },
  { key: 'moto', labelKey: 'home.vtype_moto', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/f0312e09d_motocycleiconcu.png' },
  { key: 'bus', labelKey: 'home.vtype_bus', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/25ce6f6a7_busiconcu.png' },
  { key: 'special', labelKey: 'home.vtype_special', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/a935d278f_traktoriconcu.png' },
  { key: 'truck', labelKey: 'home.vtype_truck', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/122985056_truckiconcu.png' },
  { key: 'boat', labelKey: 'home.vtype_boat', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/3d51d9a96_boaticoncu.png' },
  { key: 'motorhome', labelKey: 'home.vtype_motorhome', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/c42e06342_housetrailericoncu.png' },
  { key: 'trailer', labelKey: 'home.vtype_trailer', img: 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/d68253701_trailericoncu.png' },
];

export default function VehicleTypeSelector({ currentType = 'car' }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const navigate = (key) => {
    if (key === currentType) return;
    if (key === 'car') {
      window.location.href = createPageUrl('Catalog');
    } else {
      window.location.href = createPageUrl('VehicleCatalog') + '?type=' + key;
    }
  };

  const topRow = vehicleTypes.slice(0, 4);

  return (
    <div className="mb-2">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
        <div className="flex gap-1">
          {topRow.map(({ key, img, labelKey }) => (
            <button
              key={key}
              type="button"
              title={t(labelKey)}
              onClick={() => navigate(key)}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                currentType === key
                  ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-emerald-400'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <img src={img} alt={t(labelKey)} className="w-8 h-5 object-contain" style={{ mixBlendMode: 'screen' }} />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center px-2 py-1.5 rounded-lg bg-transparent text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {expanded && (
          <div className="flex gap-1 mt-1">
            {vehicleTypes.slice(4).map(({ key, img, labelKey }) => (
              <button
                key={key}
                type="button"
                title={t(labelKey)}
                onClick={() => navigate(key)}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all ${
                  currentType === key
                    ? 'bg-white dark:bg-slate-700 shadow-sm ring-1 ring-emerald-400'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <img src={img} alt={t(labelKey)} className="w-8 h-5 object-contain" style={{ mixBlendMode: 'screen' }} />
              </button>
            ))}
            <div className="px-2 py-1.5 w-[calc(theme(spacing.2)*2+14px)]" />
          </div>
        )}
      </div>
    </div>
  );
}