import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Car, Building2, Users, Zap, MessageSquare,
  Star, AlertTriangle, BarChart3, Megaphone, Settings, X, Gem, Activity, ImageDown, Share2, CloudUpload
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'activity', label: 'Лента активности', icon: Activity },
  { key: 'analytics', label: 'Аналитика', icon: BarChart3 },
  { key: 'cars', label: 'Объявления', icon: Car },
  { key: 'dealers', label: 'Дилеры', icon: Building2 },
  { key: 'applications', label: 'Заявки дилеров', icon: Building2 },
  { key: 'aimatch', label: 'AI Match', icon: Zap },
  { key: 'users', label: 'Пользователи', icon: Users },
  { key: 'messages', label: 'Чаты', icon: MessageSquare },
  { key: 'models', label: 'Обзоры моделей', icon: Star },
  { key: 'reports', label: 'Жалобы', icon: AlertTriangle },
  { key: 'articles', label: 'Маркетинг', icon: Megaphone },
  { key: 'ads', label: 'Реклама', icon: ImageDown },
  { key: 'importrequests', label: 'Импорт', icon: CloudUpload },
  { key: 'metaads', label: 'Meta Ads', icon: Share2 },
  { key: 'settings', label: 'Настройки', icon: Settings },
];

export default function AdminSidebar({ activeTab, onTabChange, pendingAppsCount, reportsCount, messagesCount, isMobileOpen, onMobileClose, user }) {
  const navWithBadges = navItems.map(item => ({
    ...item,
    badge: item.key === 'applications' ? (pendingAppsCount || null) :
           item.key === 'reports' ? (reportsCount || null) :
           item.key === 'messages' ? (messagesCount > 0 ? messagesCount : null) : null
  }));

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-[220px] bg-[#101014] border-r border-[#292a32] z-40 flex flex-col transition-transform duration-300",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#292a32]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">CU</span>
            </div>
            <span className="text-white font-bold text-base">CarUnity</span>
          </Link>
          <button onClick={onMobileClose} className="lg:hidden text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          {navWithBadges.map(item => (
            <button
              key={item.key}
              onClick={() => { onTabChange(item.key); onMobileClose?.(); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 text-left",
                activeTab === item.key
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge != null && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center",
                  item.key === 'reports' ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="mt-3 pt-3 border-t border-[#292a32]">
            <Link to="/LuxuryAdmin" onClick={onMobileClose}>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <Gem className="w-4 h-4 flex-shrink-0" />
                <span>Люкс сегмент</span>
              </button>
            </Link>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[#292a32]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 font-bold text-sm">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.full_name || 'Admin'}</p>
              <p className="text-slate-500 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}