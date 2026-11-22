import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Car, Settings, BarChart3, Target, ShoppingBag, RefreshCw, Eye, CloudUpload, MessageSquare, Heart } from 'lucide-react';
import { getVisibleNavItems } from '@/lib/dealerPlans';
import DealerIdentity from '@/components/dealer/DealerIdentity';
import DealerNavItem from '@/components/dealer/DealerNavItem';

const NAV_ITEMS = [
  { key: 'dashboard', labelKey: 'dealer.tab_dashboard', icon: LayoutDashboard },
  { key: 'cars', labelKey: 'dealer.tab_cars', icon: Car },
  { key: 'favorites', labelKey: 'account.nav_favorites', icon: Heart },
  { key: 'analytics', labelKey: 'dealer.tab_analytics', icon: BarChart3 },
  { key: 'leads', labelKey: 'dealer.tab_leads', icon: Target },
  { key: 'fast-sale', labelKey: 'dealer.tab_fast_sale', icon: ShoppingBag },
  { key: 'get-offers', labelKey: 'dealer.tab_get_offers', icon: RefreshCw },
  { key: 'import', labelKey: 'dealer.tab_import', icon: CloudUpload },
  { key: 'profile', labelKey: 'dealer.tab_profile', icon: Settings }
];
export default function DealerSidebar({ activeTab, onTabChange, carsCount, dealer }) {
  const { t } = useTranslation();
  const flags = getVisibleNavItems(dealer?.subscription_type);
  const items = NAV_ITEMS.filter(item => !(item.key in flags) || flags[item.key]).map(item => ({ ...item, label: t(item.labelKey), count: item.key === 'cars' ? carsCount : 0 }));
  const groups = [
    { label: t('account.nav_overview'), items: items.filter(item => ['dashboard', 'favorites'].includes(item.key)) },
    { label: t('account.group_selling'), items: items.filter(item => !['dashboard', 'profile', 'favorites'].includes(item.key)) },
    { label: t('account.group_profile'), items: [...items.filter(item => item.key === 'profile'), { key: 'messages', label: t('account.nav_messages'), icon: MessageSquare, href: '/Messages' }, ...(dealer?.id ? [{ key: 'public-profile', label: t('dealer.my_profile'), icon: Eye, href: `/DealerProfile?id=${dealer.id}` }] : [])] }
  ];
  return <>
    <aside className="hidden lg:block">
      <nav className="bg-card border border-border rounded-xl p-2">
        <DealerIdentity dealer={dealer} onEdit={() => onTabChange('profile')} />
        {groups.map((group, index) => <div key={index} className="border-t border-border mt-1 pt-2">
          {group.label && <p className="px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">{group.label}</p>}
          {group.items.map(item => <DealerNavItem key={item.key} item={item} active={activeTab === item.key} onSelect={onTabChange} />)}
        </div>)}
      </nav>
    </aside>
    <div className="lg:hidden space-y-3">
      <div className="bg-card border border-border rounded-xl px-2"><DealerIdentity dealer={dealer} onEdit={() => onTabChange('profile')} /></div>
      <nav className="overflow-x-auto -mx-4 px-4 scrollbar-hide"><div className="flex gap-2 w-max pb-1">
        {groups.flatMap(group => group.items).map(item => <DealerNavItem key={item.key} item={item} active={activeTab === item.key} onSelect={onTabChange} mobile />)}
      </div></nav>
    </div>
  </>;
}