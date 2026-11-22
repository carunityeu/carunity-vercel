import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap, Bookmark, Calculator } from 'lucide-react';
import {
  SparkIcon,
  CarIcon,
  SuvIcon,
  MotorcycleIcon,
  TractorIcon,
  DamagedIcon
} from '@/components/ui/QuickNavIcons';

export default function QuickNavBar({ onValuationClick }) {
  const { t } = useTranslation();
  const navItems = [
    { labelKey: 'nav.passenger', icon: CarIcon, href: createPageUrl('Catalog') },
    { labelKey: 'nav.electric', icon: Zap, href: createPageUrl('Catalog') + '?fuelType=electric', iconClass: 'w-4 h-4' },
    { labelKey: 'nav.suv', icon: SuvIcon, href: createPageUrl('Catalog') + '?bodyType=suv' },
    { labelKey: 'nav.moto', icon: MotorcycleIcon, href: '/VehicleCatalog?type=moto' },
    { labelKey: 'nav.special', icon: TractorIcon, href: '/VehicleCatalog?type=special' },
    { labelKey: 'nav.damaged', icon: DamagedIcon, href: createPageUrl('Catalog') + '?damaged=true' },
    { labelKey: 'nav.iam_looking', icon: Bookmark, href: createPageUrl('DetailedSearch'), iconClass: 'w-4 h-4' },
    { labelKey: 'nav.valuation', icon: Calculator, href: null, isValuation: true, iconClass: 'w-4 h-4' },
  ];

  const luxuryItem = { labelKey: 'nav.luxury', icon: SparkIcon, href: '/LuxuryCatalog' };
  const LuxuryIcon = luxuryItem.icon;
  return (
    <div className="hidden sm:block bg-emerald-600 w-full shadow-md">
      <div className="mx-auto px-3 sm:px-4 max-w-7xl md:px-6">
          <div className="flex items-center justify-start md:justify-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide py-1">
            <Link
              to={luxuryItem.href}
              className="flex items-center gap-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-white rounded hover:bg-emerald-700 transition-colors whitespace-nowrap flex-shrink-0">
              <LuxuryIcon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{t(luxuryItem.labelKey)}</span>
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.isValuation) {
                return (
                  <button
                    key={item.labelKey}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-valuation'))}
                    className="text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded flex items-center gap-1 hover:bg-emerald-700 transition-colors whitespace-nowrap flex-shrink-0">
                    <Icon className={`${item.iconClass || 'w-5 h-5'} flex-shrink-0`} />
                    <span className="hidden sm:inline">{t(item.labelKey)}</span>
                  </button>
                );
              }
              return (
                <Link
                  key={item.labelKey || item.label}
                  to={item.href} className="text-white px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded flex items-center gap-1 hover:bg-emerald-700 transition-colors whitespace-nowrap flex-shrink-0">
                  <Icon className={`${item.iconClass || 'w-5 h-5'} flex-shrink-0`} />
                  <span className="hidden sm:inline">{item.label || t(item.labelKey)}</span>
                </Link>);

            })}
          </div>
        </div>
    </div>);

}