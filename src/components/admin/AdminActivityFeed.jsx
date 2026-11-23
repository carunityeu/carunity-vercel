import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Loader2, Search, Activity as ActivityIcon, Users, Clock, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/utils/format';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Event type metadata ───────────────────────────────────────────────
const EVENT_META = {
  listing_created:    { label: 'Объявление создано',     badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',  category: 'listing' },
  listing_sold:      { label: 'Объявление продано',       badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',           category: 'listing' },
  listing_rejected:  { label: 'Объявление отклонено',     badge: 'bg-red-500/15 text-red-400 border-red-500/30',             category: 'listing' },
  listing_pending:   { label: 'Объявление на модерации',   badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       category: 'listing' },
  dealer_created:    { label: 'Дилер зарегистрирован',     badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',  category: 'dealer' },
  dealer_app:        { label: 'Заявка дилера',             badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       category: 'dealer' },
  dealer_approved:   { label: 'Заявка одобрена',           badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',  category: 'dealer' },
  dealer_rejected:   { label: 'Заявка отклонена',           badge: 'bg-red-500/15 text-red-400 border-red-500/30',             category: 'dealer' },
  message_sent:      { label: 'Сообщение',                 badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',     category: 'message' },
  offer_made:        { label: 'Оффер / цена',              badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',     category: 'offer' },
  favorite_added:    { label: 'В избранное',               badge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',         category: 'favorite' },
  search_saved:     { label: 'Поиск сохранён',            badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',         category: 'search' },
  review_posted:     { label: 'Отзыв',                    badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',     category: 'review' },
  article_published: { label: 'Статья опубликована',        badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',     category: 'article' },
  lead_created:     { label: 'Лид создан',                badge: 'bg-teal-500/15 text-teal-400 border-teal-500/30',         category: 'lead' },
  tradein_created:   { label: 'Trade-in заявка',            badge: 'bg-teal-500/15 text-teal-400 border-teal-500/30',         category: 'tradein' },
};

const CATEGORY_LABELS = {
  listing: 'Объявления',
  dealer:  'Дилеры',
  message: 'Сообщения',
  offer:   'Офферы',
  favorite:'Избранное',
  search:  'Поиски',
  review:  'Отзывы',
  article: 'Статьи',
  lead:    'Лиды',
  tradein: 'Trade-in',
};

// ─── Data transformation ───────────────────────────────────────────────
function transformEntity(record, type, entityLabel) {
  const meta = EVENT_META[type];
  if (!meta) return null;

  let user = record.created_by_id || record.seller_phone || record.sender_email || record.buyer_email || record.user_email || record.applicant_email || record.owner_email || record.reporter_email || '—';
  let description = '';
  let title = '';

  switch (type) {
    case 'listing_created':
    case 'listing_sold':
    case 'listing_rejected':
    case 'listing_pending':
      title = record.title || `${record.brand || ''} ${record.model || ''} ${record.year || ''}`.trim();
      description = title;
      if (record.price) description += ' · ' + formatPrice(record.price);
      break;
    case 'dealer_created':
      title = record.name || '';
      description = record.name || '';
      if (record.city) description += ' · ' + record.city;
      break;
    case 'dealer_app':
    case 'dealer_approved':
    case 'dealer_rejected':
      title = record.dealer_name || '';
      description = record.dealer_name || '';
      if (record.applicant_name) description += ' · ' + record.applicant_name;
      break;
    case 'message_sent':
      title = record.receiver_email || '';
      description = (record.content || '').substring(0, 120);
      user = record.sender_email;
      break;
    case 'offer_made':
      title = 'Оффер: ' + formatPrice(record.offered_price);
      description = 'Оффер: ' + formatPrice(record.offered_price);
      user = record.buyer_email;
      break;
    case 'favorite_added':
      title = 'Кар: ' + (record.car_id || '').substring(0, 8);
      description = 'Добавлено в избранное';
      user = record.user_email;
      break;
    case 'search_saved':
      title = record.name || 'Сохранённый поиск';
      description = record.name || record.description || 'Сохранённый поиск';
      user = record.user_email;
      break;
    case 'review_posted':
      title = record.title || record.dealer_name || 'Отзыв';
      description = (record.content || record.text || '').substring(0, 120) || 'Отзыв';
      user = record.user_email || record.author_email || '—';
      break;
    case 'article_published':
      title = record.title || '';
      description = record.title || '';
      user = record.author_email || record.author_name || '—';
      break;
    case 'lead_created':
      title = record.name || record.customer_name || 'Лид';
      description = record.name || record.customer_name || 'Новый лид';
      if (record.phone) description += ' · ' + record.phone;
      break;
    case 'tradein_created':
      title = record.customer_name || record.vehicle_info || 'Trade-in';
      description = record.customer_name || record.vehicle_info || 'Trade-in заявка';
      if (record.phone) description += ' · ' + record.phone;
      break;
    default:
      description = entityLabel || '';
  }

  let finalType = type;
  if (type === 'listing_created') {
    if (record.status === 'sold') finalType = 'listing_sold';
    else if (record.status === 'rejected') finalType = 'listing_rejected';
    else if (record.status === 'pending') finalType = 'listing_pending';
  }
  if (type === 'dealer_app') {
    if (record.status === 'approved') finalType = 'dealer_approved';
    else if (record.status === 'rejected') finalType = 'dealer_rejected';
  }

  return {
    id: record.id + '_' + finalType,
    type: finalType,
    meta: EVENT_META[finalType],
    user,
    description,
    title,
    created_date: record.created_date,
    recordId: record.id,
  };
}

// Build entries from an array using map/filter
function buildEntries(records, type, label) {
  if (!records || !records.length) return [];
  return records.map(function(r) { return transformEntity(r, type, label); }).filter(Boolean);
}

// ─── Vehicle entity list ──────────────────────────────────────────────
const VEHICLE_ENTITIES = [
  ['Boat', 'Лодка'],
  ['Truck', 'Грузовик'],
  ['Bus', 'Автобус'],
  ['Trailer', 'Прицеп'],
  ['Motorcycle', 'Мото'],
  ['Motorhome', 'Автодом'],
  ['RentalCar', 'Аренда'],
  ['LuxuryCar', 'Люкс'],
  ['SpecialEquipment', 'Спецтехника'],
];

// ─── Main component ───────────────────────────────────────────────────
export default function AdminActivityFeed(props) {
  const { t } = useTranslation();
  var allCars = props.allCars || [];
  var dealers = props.dealers || [];
  var applications = props.applications || [];
  var allMessages = props.allMessages || [];
  var dealerLeads = props.dealerLeads || [];
  var reports = props.reports || [];

  var viewMode = useState('events');
  var categoryFilter = useState('all');
  var searchQuery = useState('');
  var dateFilter = useState('all');
  var expandedUsers = useState({});

  // ─── Additional queries ──────────────────────────────────────────────
  var vehQueries = useQuery({
    queryKey: ['activity_vehicles'],
    queryFn: async function() {
      var results = await Promise.all(
        VEHICLE_ENTITIES.map(async function(v) {
          try {
            var data = await entities[v[0]].list('-created_date', 50);
            return { entity: v, data: data };
          } catch (e) {
            return { entity: v, data: [] };
          }
        })
      );
      return results;
    },
    staleTime: 60000,
  });

  var priceOffersQ = useQuery({
    queryKey: ['activity_priceOffers'],
    queryFn: function() { return entities.PriceOffer.list('-created_date', 100); },
    staleTime: 60000,
  });

  var favoritesQ = useQuery({
    queryKey: ['activity_favorites'],
    queryFn: function() { return entities.Favorite.list('-created_date', 100); },
    staleTime: 60000,
  });

  var savedSearchesQ = useQuery({
    queryKey: ['activity_savedSearches'],
    queryFn: function() { return entities.SavedSearch.list('-created_date', 100); },
    staleTime: 60000,
  });

  var reviewsQ = useQuery({
    queryKey: ['activity_reviews'],
    queryFn: function() { return entities.Review.list('-created_date', 100); },
    staleTime: 60000,
  });

  var articlesQ = useQuery({
    queryKey: ['activity_articles'],
    queryFn: function() { return entities.Article.list('-created_date', 50); },
    staleTime: 60000,
  });

  var tradeInQ = useQuery({
    queryKey: ['activity_tradeIn'],
    queryFn: function() { return entities.TradeInOffer.list('-created_date', 50); },
    staleTime: 60000,
  });

  var isLoading = vehQueries.isLoading;
  var priceOffers = priceOffersQ.data || [];
  var favorites = favoritesQ.data || [];
  var savedSearches = savedSearchesQ.data || [];
  var reviews = reviewsQ.data || [];
  var articles = articlesQ.data || [];
  var tradeInOffers = tradeInQ.data || [];

  // ─── Build unified activity feed ────────────────────────────────────
  var allActivities = useMemo(function() {
    var entries = [];

    // Cars + other vehicles
    entries = entries.concat(buildEntries(allCars, 'listing_created', 'Авто'));
    if (vehQueries.data) {
      vehQueries.data.forEach(function(item) {
        entries = entries.concat(buildEntries(item.data, 'listing_created', item.entity[1]));
      });
    }

    // Dealers + applications
    entries = entries.concat(buildEntries(dealers, 'dealer_created', 'Дилер'));
    entries = entries.concat(buildEntries(applications, 'dealer_app', 'Заявка'));
    entries = entries.concat(buildEntries(allMessages, 'message_sent', 'Сообщение'));
    entries = entries.concat(buildEntries(dealerLeads, 'lead_created', 'Лид'));
    entries = entries.concat(buildEntries(reports, 'lead_created', 'Жалоба'));

    // New entities
    entries = entries.concat(buildEntries(priceOffers, 'offer_made', 'Оффер'));
    entries = entries.concat(buildEntries(favorites, 'favorite_added', 'Избранное'));
    entries = entries.concat(buildEntries(savedSearches, 'search_saved', 'Поиск'));
    entries = entries.concat(buildEntries(reviews, 'review_posted', 'Отзыв'));
    entries = entries.concat(buildEntries(articles, 'article_published', 'Статья'));
    entries = entries.concat(buildEntries(tradeInOffers, 'tradein_created', 'Trade-in'));

    // Sort by date
    return entries.filter(Boolean).sort(function(a, b) {
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [allCars, dealers, applications, allMessages, dealerLeads, reports, vehQueries.data,
      priceOffers, favorites, savedSearches, reviews, articles, tradeInOffers]);

  // ─── Filtering ──────────────────────────────────────────────────────
  var filteredActivities = useMemo(function() {
    var filtered = allActivities;

    if (dateFilter[0] !== 'all') {
      var now = new Date();
      var days = dateFilter[0] === 'today' ? 1 : dateFilter[0] === 'week' ? 7 : dateFilter[0] === 'month' ? 30 : 90;
      var cutoff = new Date(now.getTime() - days * 86400000);
      filtered = filtered.filter(function(a) { return new Date(a.created_date) >= cutoff; });
    }

    if (categoryFilter[0] !== 'all') {
      filtered = filtered.filter(function(a) { return a.meta && a.meta.category === categoryFilter[0]; });
    }

    if (searchQuery[0]) {
      var q = searchQuery[0].toLowerCase();
      filtered = filtered.filter(function(a) {
        return (a.user && a.user.toLowerCase().includes(q)) ||
               (a.description && a.description.toLowerCase().includes(q)) ||
               (a.title && a.title.toLowerCase().includes(q));
      });
    }

    return filtered;
  }, [allActivities, dateFilter, categoryFilter, searchQuery]);

  // ─── Group by user ─────────────────────────────────────────────────
  var groupedByUser = useMemo(function() {
    var groups = {};
    filteredActivities.forEach(function(a) {
      var key = a.user || '—';
      if (!groups[key]) groups[key] = { user: key, count: 0, activities: [], lastActivity: null };
      groups[key].count++;
      groups[key].activities.push(a);
      if (!groups[key].lastActivity || new Date(a.created_date) > new Date(groups[key].lastActivity)) {
        groups[key].lastActivity = a.created_date;
      }
    });
    return Object.values(groups).sort(function(a, b) { return b.count - a.count; });
  }, [filteredActivities]);

  // ─── Stats ─────────────────────────────────────────────────────────
  var stats = useMemo(function() {
    var now = new Date();
    var today = new Date(now.getTime() - 86400000);
    var week = new Date(now.getTime() - 604800000);
    var month = new Date(now.getTime() - 2592000000);
    return {
      total: allActivities.length,
      today: allActivities.filter(function(a) { return new Date(a.created_date) >= today; }).length,
      week: allActivities.filter(function(a) { return new Date(a.created_date) >= week; }).length,
      month: allActivities.filter(function(a) { return new Date(a.created_date) >= month; }).length,
    };
  }, [allActivities]);

  var categoryStats = useMemo(function() {
    var counts = {};
    allActivities.forEach(function(a) {
      var cat = (a.meta && a.meta.category) || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort(function(a, b) { return b[1] - a[1]; });
  }, [allActivities]);

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    var now = new Date();
    var diffMs = now - d;
    var diffMin = Math.floor(diffMs / 60000);
    var diffHr = Math.floor(diffMs / 3600000);
    var diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return t('admin.just_now');
    if (diffMin < 60) return diffMin + ' ' + t('admin.min_ago');
    if (diffHr < 24) return diffHr + ' ' + t('admin.hr_ago');
    if (diffDay < 7) return diffDay + ' ' + t('admin.day_ago');
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  if (isLoading) {
    return React.createElement('div', { className: 'flex items-center justify-center py-20' },
      React.createElement(Loader2, { className: 'w-8 h-8 animate-spin text-emerald-500' })
    );
  }

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ActivityIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-500">Всего событий</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-500">Сегодня</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.today}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-500">За неделю</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.week}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-500">За месяц</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.month}</p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {categoryStats.map(function(item) {
            return (
              <div key={item[0]} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#101014] border border-[#292a32]">
                <span className="text-xs text-slate-400">{CATEGORY_LABELS[item[0]] || item[0]}</span>
                <span className="text-xs font-bold text-emerald-400">{item[1]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
        <div className="p-4 border-b border-[#292a32] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="inline-flex rounded-lg bg-[#101014] border border-[#292a32] p-0.5">
              <button onClick={function() { viewMode[1]('events'); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', viewMode[0] === 'events' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white')}>
                <ActivityIcon className="w-4 h-4" /> По событиям
              </button>
              <button onClick={function() { viewMode[1]('users'); }} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', viewMode[0] === 'users' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white')}>
                <Users className="w-4 h-4" /> По пользователям
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-500 whitespace-nowrap">Всего: <span className="text-white font-bold">{filteredActivities.length}</span></span>
              <Select value={dateFilter[0]} onValueChange={dateFilter[1]}>
                <SelectTrigger className="w-[130px] h-9 text-xs bg-[#101014] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#292a32] border-[#292a32]">
                  <SelectItem value="all">Всё время</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="week">За неделю</SelectItem>
                  <SelectItem value="month">За месяц</SelectItem>
                  <SelectItem value="quarter">За 3 месяца</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Поиск по email, имени, описанию..." value={searchQuery[0]} onChange={function(e) { searchQuery[1](e.target.value); }} className="pl-9 bg-[#101014] border-[#292a32] text-white placeholder:text-slate-600 h-9" />
            </div>
            <Select value={categoryFilter[0]} onValueChange={categoryFilter[1]}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs bg-[#101014] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#292a32] border-[#292a32]">
                <SelectItem value="all">Все события</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(function(item) { return <SelectItem key={item[0]} value={item[0]}>{item[1]}</SelectItem>; })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events view */}
        {viewMode[0] === 'events' && (
          <div className="divide-y divide-[#292a32]">
            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ActivityIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Событий не найдено</p>
              </div>
            ) : (
              filteredActivities.slice(0, 500).map(function(a) {
                return (
                  <div key={a.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-[#101014] transition-colors">
                    <div className="flex-shrink-0">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border', a.meta.badge)}>{a.meta.label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate font-medium">{a.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{a.user}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                      <span className="sm:hidden">{formatDate(a.created_date).split(' ').slice(0, 2).join(' ')}</span>
                      <span className="hidden sm:inline">{formatDate(a.created_date)}</span>
                    </div>
                  </div>
                );
              })
            )}
            {filteredActivities.length > 500 && (
              <div className="p-3 text-center text-xs text-slate-500">Показано 500 из {filteredActivities.length}. Уточните фильтр.</div>
            )}
          </div>
        )}

        {/* Users view */}
        {viewMode[0] === 'users' && (
          <div className="divide-y divide-[#292a32]">
            {groupedByUser.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Пользователей не найдено</p>
              </div>
            ) : (
              groupedByUser.slice(0, 200).map(function(group) {
                var isExpanded = expandedUsers[0][group.user];
                return (
                  <div key={group.user} className="p-3 sm:p-4">
                    <button onClick={function() { var prev = expandedUsers[0]; var next = {}; next[group.user] = !prev[group.user]; expandedUsers[1](Object.assign({}, prev, next)); }} className="w-full flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-[#292a32] border border-[#292a32] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-slate-300">{(group.user[0] || '?').toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{group.user}</p>
                        <p className="text-xs text-slate-500">{group.count} событий · последний: {formatDate(group.lastActivity)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{group.count}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="mt-3 ml-11 space-y-1.5 border-l border-[#292a32] pl-4">
                        {group.activities.slice(0, 50).map(function(a) {
                          return (
                            <div key={a.id} className="flex items-start gap-2 text-xs py-1">
                              <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0', a.meta.badge)}>{a.meta.label}</span>
                              <span className="text-slate-300 truncate flex-1">{a.description}</span>
                              <span className="text-slate-600 whitespace-nowrap flex-shrink-0">{formatDate(a.created_date)}</span>
                            </div>
                          );
                        })}
                        {group.activities.length > 50 && <p className="text-xs text-slate-600 pt-1">+ ещё {group.activities.length - 50}</p>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}