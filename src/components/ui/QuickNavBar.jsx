import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap, Bookmark, Calculator } from 'lucide-react';
import { SparkIcon, CarIcon, SuvIcon, MotorcycleIcon, TractorIcon, DamagedIcon } from '@/components/ui/QuickNavIcons';
import { Container } from '@/components/ds';

// Category shortcuts under the header (tablet and desktop). Lucide icons are drawn a bit
// smaller than the custom ones so both look the same size.
const ITEMS = [
  { labelKey: 'nav.luxury', icon: SparkIcon, to: '/LuxuryCatalog', small: true },
  { labelKey: 'nav.passenger', icon: CarIcon, to: createPageUrl('Catalog') },
  { labelKey: 'nav.electric', icon: Zap, to: createPageUrl('Catalog') + '?fuelType=electric', small: true },
  { labelKey: 'nav.suv', icon: SuvIcon, to: createPageUrl('Catalog') + '?bodyType=suv' },
  { labelKey: 'nav.moto', icon: MotorcycleIcon, to: '/VehicleCatalog?type=moto' },
  { labelKey: 'nav.special', icon: TractorIcon, to: '/VehicleCatalog?type=special' },
  { labelKey: 'nav.damaged', icon: DamagedIcon, to: createPageUrl('Catalog') + '?damaged=true' },
  { labelKey: 'nav.iam_looking', icon: Bookmark, to: createPageUrl('DetailedSearch'), small: true },
  // The valuation dialog lives in Layout and listens for this event
  { labelKey: 'nav.valuation', icon: Calculator, onClick: () => window.dispatchEvent(new CustomEvent('open-valuation')), small: true },
];

const ITEM_CLASS = 'flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-black/15';

export default function QuickNavBar() {
  const { t } = useTranslation();
  return (
    <div className="hidden w-full bg-brand-hover sm:block">
      <Container className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-1 md:justify-center">
        {ITEMS.map(({ labelKey, icon: Icon, to, onClick, small }) => {
          const content = <><Icon className={small ? 'h-4 w-4 flex-shrink-0' : 'h-5 w-5 flex-shrink-0'} />{t(labelKey)}</>;
          return to
            ? <Link key={labelKey} to={to} className={ITEM_CLASS}>{content}</Link>
            : <button key={labelKey} type="button" onClick={onClick} className={ITEM_CLASS}>{content}</button>;
        })}
      </Container>
    </div>
  );
}
