import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Car, Settings, BarChart3, Target, ShoppingBag, Eye, MessageSquare } from 'lucide-react';
import { getPlan } from '@/lib/dealerPlans';
import DealerIdentity from '@/components/dealer/DealerIdentity';
import DealerNavItem from '@/components/dealer/DealerNavItem';

// Six sections of the dealer panel (see DealerDashboard). The look of the sidebar is unchanged.
const NAV_ITEMS = [
  { key: 'dashboard', labelKey: 'dp.nav_overview', fallback: 'Обзор', icon: LayoutDashboard },
  { key: 'cars', labelKey: 'dp.nav_listings', fallback: 'Объявления', icon: Car },
  { key: 'leads', labelKey: 'dp.nav_leads', fallback: 'Лиды', icon: Target, needs: 'hasLeads' },
  { key: 'sourcing', labelKey: 'dp.nav_sourcing', fallback: 'Закупка', icon: ShoppingBag },
  { key: 'analytics', labelKey: 'dp.nav_analytics', fallback: 'Аналитика', icon: BarChart3 },
  { key: 'profile', labelKey: 'dp.nav_salon', fallback: 'Салон', icon: Settings },
];

export default function DealerSidebar({ activeTab, onTabChange, carsCount, dealer }) {
  const { t } = useTranslation();
  const plan = getPlan(dealer?.subscription_type);
  const items = NAV_ITEMS.filter((item) => !item.needs || plan[item.needs])
    .map((item) => ({ ...item, label: t(item.labelKey, item.fallback), count: item.key === 'cars' ? carsCount : 0 }));
  const groups = [
    { label: t('dp.group_work', 'Работа'), items: items.filter((item) => ['dashboard', 'cars', 'leads', 'sourcing'].includes(item.key)) },
    { label: t('dp.group_results', 'Результаты'), items: items.filter((item) => item.key === 'analytics') },
    {
      label: t('dp.group_salon', 'Салон'),
      items: [
        ...items.filter((item) => item.key === 'profile'),
        { key: 'messages', label: t('account.nav_messages'), icon: MessageSquare, href: '/Messages' },
        ...(dealer?.id ? [{ key: 'public-profile', label: t('dp.open_salon_page', 'Страница салона'), icon: Eye, href: `/DealerProfile?id=${dealer.id}` }] : []),
      ],
    },
  ];
  return <>
    <aside className="hidden lg:block">
      <nav className="bg-card border border-border rounded-xl p-2">
        <DealerIdentity dealer={dealer} onEdit={() => onTabChange('profile')} />
        {groups.map((group, index) => <div key={index} className="border-t border-border mt-1 pt-2">
          {group.label && <p className="px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">{group.label}</p>}
          {group.items.map((item) => <DealerNavItem key={item.key} item={item} active={activeTab === item.key} onSelect={onTabChange} />)}
        </div>)}
      </nav>
    </aside>
    <div className="lg:hidden space-y-3">
      <div className="bg-card border border-border rounded-xl px-2"><DealerIdentity dealer={dealer} onEdit={() => onTabChange('profile')} /></div>
      <nav className="overflow-x-auto -mx-4 px-4 scrollbar-hide"><div className="flex gap-2 w-max pb-1">
        {groups.flatMap((group) => group.items).map((item) => <DealerNavItem key={item.key} item={item} active={activeTab === item.key} onSelect={onTabChange} mobile />)}
      </div></nav>
    </div>
  </>;
}
