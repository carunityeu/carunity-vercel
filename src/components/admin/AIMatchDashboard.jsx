import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/utils/format';
import {
  Zap, Flame, Thermometer, Eye, Send, TrendingUp, Users, Target,
  CheckCircle, Loader2, Car, ChevronDown, ChevronUp, Building2, Sliders
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SCORE_WEIGHTS = { view: 1, favorite: 5, offer: 8, message: 10 };
const MIN_SCORE_DEFAULT = 60;

function normalizeScore(raw) { return Math.min(100, Math.round(raw * 3.5)); }

function getTemperature(score) {
  if (score >= 70) return { label: 'Горячий', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', icon: Flame, iconColor: 'text-emerald-400' };
  if (score >= 40) return { label: 'Тёплый', color: 'bg-emerald-600/15 text-emerald-500 border border-emerald-600/25', icon: Thermometer, iconColor: 'text-emerald-500' };
  return { label: 'Холодный', color: 'bg-slate-500/20 text-slate-400 border border-slate-500/30', icon: Zap, iconColor: 'text-slate-400' };
}

function maskEmail(email) {
  if (!email) return '***';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
}

const leadStatusLabels = { new: 'Новый', contacted: 'Контакт', meeting: 'Встреча', sold: 'Продано', rejected: 'Отказ' };
const leadStatusColors = {
  new: 'bg-slate-500/20 text-slate-400', contacted: 'bg-emerald-600/20 text-emerald-500',
  meeting: 'bg-emerald-500/20 text-emerald-400', sold: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-slate-500/20 text-slate-500',
};

export default function AIMatchDashboard() {
  const [minScore, setMinScore] = useState(MIN_SCORE_DEFAULT);
  const [sendDialogProspect, setSendDialogProspect] = useState(null);
  const [selectedDealerIds, setSelectedDealerIds] = useState([]);
  const [expandedDealerStats, setExpandedDealerStats] = useState(null);
  const queryClient = useQueryClient();

  const { data: viewHistory = [] } = useQuery({ queryKey: ['allViewHistory'], queryFn: () => entities.ViewHistory.list('-viewed_at', 500) });
  const { data: favorites = [] } = useQuery({ queryKey: ['allFavorites'], queryFn: () => entities.Favorite.list('-created_date', 500) });
  const { data: offers = [] } = useQuery({ queryKey: ['allOffers'], queryFn: () => entities.PriceOffer.list('-created_date', 200) });
  const { data: messages = [] } = useQuery({ queryKey: ['allMessages'], queryFn: () => entities.Message.list('-created_date', 500) });
  const { data: allCars = [] } = useQuery({ queryKey: ['allCarsForMatch'], queryFn: () => entities.Car.list('-created_date', 300) });
  const { data: dealers = [] } = useQuery({ queryKey: ['dealersForMatch'], queryFn: () => entities.Dealer.list('-created_date', 100) });
  const { data: existingLeads = [], isLoading: loadingLeads } = useQuery({ queryKey: ['dealerLeads'], queryFn: () => entities.DealerLead.list('-created_date', 200) });

  const createLead = useMutation({
    mutationFn: (data) => entities.DealerLead.create(data),
    onSuccess: () => queryClient.invalidateQueries(['dealerLeads']),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, data }) => entities.DealerLead.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['dealerLeads']); toast.success('Статус обновлён'); }
  });

  // Build prospects
  const allProspects = useMemo(() => {
    const carMap = {};
    allCars.forEach(c => { carMap[c.id] = c; });
    const scoreMap = {};
    const getKey = (email, carId) => `${email}|${carId}`;

    viewHistory.forEach(v => {
      const k = getKey(v.user_email, v.car_id);
      if (!scoreMap[k]) scoreMap[k] = { user_email: v.user_email, car_id: v.car_id, score: 0, actions: [], views: 0 };
      scoreMap[k].score += SCORE_WEIGHTS.view;
      scoreMap[k].views += 1;
      if (!scoreMap[k].actions.includes('view')) scoreMap[k].actions.push('view');
    });
    favorites.forEach(f => {
      const k = getKey(f.user_email, f.car_id);
      if (!scoreMap[k]) scoreMap[k] = { user_email: f.user_email, car_id: f.car_id, score: 0, actions: [], views: 0 };
      scoreMap[k].score += SCORE_WEIGHTS.favorite;
      if (!scoreMap[k].actions.includes('favorite')) scoreMap[k].actions.push('favorite');
    });
    offers.forEach(o => {
      const k = getKey(o.buyer_email, o.car_id);
      if (!scoreMap[k]) scoreMap[k] = { user_email: o.buyer_email, car_id: o.car_id, score: 0, actions: [], views: 0 };
      scoreMap[k].score += SCORE_WEIGHTS.offer;
      if (!scoreMap[k].actions.includes('offer')) scoreMap[k].actions.push('offer');
    });
    messages.forEach(m => {
      if (m.car_id) {
        const k = getKey(m.sender_email, m.car_id);
        if (!scoreMap[k]) scoreMap[k] = { user_email: m.sender_email, car_id: m.car_id, score: 0, actions: [], views: 0 };
        scoreMap[k].score += SCORE_WEIGHTS.message;
        if (!scoreMap[k].actions.includes('message')) scoreMap[k].actions.push('message');
      }
    });

    return Object.values(scoreMap)
      .map(p => ({ ...p, car: carMap[p.car_id], normalizedScore: normalizeScore(p.score) }))
      .filter(p => p.car && p.score > 0)
      .sort((a, b) => b.normalizedScore - a.normalizedScore);
  }, [viewHistory, favorites, offers, messages, allCars]);

  // Apply threshold filter
  const prospects = useMemo(() => allProspects.filter(p => p.normalizedScore >= minScore), [allProspects, minScore]);

  // Dealer stats per dealer
  const dealerStats = useMemo(() => {
    return dealers.map(dealer => {
      const leads = existingLeads.filter(l => l.dealer_id === dealer.id);
      const byStatus = { new: 0, contacted: 0, meeting: 0, sold: 0, rejected: 0 };
      leads.forEach(l => { if (byStatus[l.status] !== undefined) byStatus[l.status]++; });
      const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + (l.intent_score || 0), 0) / leads.length) : 0;
      const brandMap = {};
      leads.forEach(l => { if (l.car_brand) brandMap[l.car_brand] = (brandMap[l.car_brand] || 0) + 1; });
      const topBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const convRate = leads.length ? Math.round((byStatus.sold / leads.length) * 100) : 0;

          // Inventory stats from allCars
      const inventory = allCars.filter(c => c.dealer_id === dealer.id && c.status === 'active');
      const prices = inventory.map(c => c.price).filter(Boolean);
      const avgPrice = prices.length ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : 0;
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const invBrandMap = {};
      inventory.forEach(c => { if (c.brand) invBrandMap[c.brand] = (invBrandMap[c.brand] || 0) + 1; });
      const invBrands = Object.entries(invBrandMap).sort((a, b) => b[1] - a[1]);
      const fuelMap = {};
      inventory.forEach(c => { if (c.fuel_type) fuelMap[c.fuel_type] = (fuelMap[c.fuel_type] || 0) + 1; });
      const fuelTypes = Object.entries(fuelMap).sort((a, b) => b[1] - a[1]);
      const bodyMap = {};
      inventory.forEach(c => { if (c.body_type) bodyMap[c.body_type] = (bodyMap[c.body_type] || 0) + 1; });
      const bodyTypes = Object.entries(bodyMap).sort((a, b) => b[1] - a[1]);
      const priceSegments = { 'до 10k': 0, '10–30k': 0, '30–60k': 0, '60k+': 0 };
      prices.forEach(p => {
        if (p < 10000) priceSegments['до 10k']++;
        else if (p < 30000) priceSegments['10–30k']++;
        else if (p < 60000) priceSegments['30–60k']++;
        else priceSegments['60k+']++;
      });
      // NEW: avg year, avg mileage
      const years = inventory.map(c => c.year).filter(Boolean);
      const avgYear = years.length ? Math.round(years.reduce((s, y) => s + y, 0) / years.length) : 0;
      const mileages = inventory.map(c => c.mileage).filter(Boolean);
      const avgMileage = mileages.length ? Math.round(mileages.reduce((s, m) => s + m, 0) / mileages.length) : 0;
      // NEW: transmission
      const transMap = {};
      inventory.forEach(c => { if (c.transmission) transMap[c.transmission] = (transMap[c.transmission] || 0) + 1; });
      const transmissions = Object.entries(transMap).sort((a, b) => b[1] - a[1]);
      // NEW: drive type
      const driveMap = {};
      inventory.forEach(c => { if (c.drive_type) driveMap[c.drive_type] = (driveMap[c.drive_type] || 0) + 1; });
      const driveTypes = Object.entries(driveMap).sort((a, b) => b[1] - a[1]);
      // NEW: rejection rate
      const rejRate = leads.length ? Math.round((byStatus.rejected / leads.length) * 100) : 0;

      return { dealer, leads, byStatus, avgScore, topBrands, convRate, rejRate, inventory, avgPrice, minPrice, maxPrice, invBrands, fuelTypes, bodyTypes, priceSegments, avgYear, avgMileage, transmissions, driveTypes };
    }).sort((a, b) => b.inventory.length - a.inventory.length);
  }, [dealers, existingLeads, allCars]);

  const handleOpenSendDialog = (prospect) => {
    setSendDialogProspect(prospect);
    setSelectedDealerIds([]);
  };

  const handleToggleDealer = (dealerId) => {
    setSelectedDealerIds(prev =>
      prev.includes(dealerId) ? prev.filter(id => id !== dealerId) : [...prev, dealerId]
    );
  };

  const handleSendToSelectedDealers = async () => {
    if (!sendDialogProspect || selectedDealerIds.length === 0) return;
    const p = sendDialogProspect;
    const car = p.car;
    const actionLabels = { view: 'просматривал объявление', favorite: 'добавил в избранное', offer: 'предложил цену', message: 'написал продавцу' };

    let sent = 0;
    let skipped = 0;
    for (const dealerId of selectedDealerIds) {
      const already = existingLeads.find(l => l.car_id === p.car_id && l.dealer_id === dealerId && l.buyer_profile?.raw_email === p.user_email);
      if (already) { skipped++; continue; }
      const newLead = await createLead.mutateAsync({
        dealer_id: dealerId,
        car_id: car.id,
        car_title: `${car.brand} ${car.model} ${car.year}`,
        car_brand: car.brand,
        car_model: car.model,
        car_price: car.price,
        car_image: car.images?.[0],
        user_email: maskEmail(p.user_email),
        intent_score: p.normalizedScore,
        buyer_profile: { actions: p.actions.map(a => actionLabels[a] || a), views_count: p.views, raw_email: p.user_email },
        status: 'new',
      });
      try {
        await base44.functions.invoke('notifyDealerNewLead', { dealerId, leadId: newLead.id });
      } catch {}
      sent++;
    }
    queryClient.invalidateQueries(['dealerLeads']);
    if (sent > 0) toast.success(`Лид отправлен ${sent} дилер${sent === 1 ? 'у' : 'ам'}!`);
    if (skipped > 0) toast.info(`${skipped} уже отправлен(о) ранее`);
    setSendDialogProspect(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Активных пользователей', value: new Set(viewHistory.map(v => v.user_email)).size, icon: Users, color: 'bg-emerald-500' },
          { label: `Квалиф. лидов (≥${minScore})`, value: prospects.length, icon: Flame, color: 'bg-emerald-600' },
          { label: 'Отправлено дилерам', value: existingLeads.length, icon: Send, color: 'bg-emerald-500' },
          { label: 'Продаж', value: existingLeads.filter(l => l.status === 'sold').length, icon: Target, color: 'bg-emerald-600' },
        ].map((s, i) => (
          <div key={i} className="bg-[#1b1b22] rounded-2xl p-5 border border-[#292a32]">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Threshold control */}
      <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32] p-5">
        <div className="flex items-center gap-3 mb-4">
          <Sliders className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-white">Порог Intent Score</h2>
          <Badge className="ml-auto bg-emerald-500/15 text-emerald-400 text-base font-bold px-3">
            ≥ {minScore}
          </Badge>
        </div>
        <Slider
          value={[minScore]}
          onValueChange={([v]) => setMinScore(v)}
          min={0} max={100} step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>0 — все</span>
          <span className="text-emerald-500">40 — тёплые</span>
          <span className="text-emerald-400">70 — горячие</span>
          <span>100</span>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Показано <span className="font-semibold text-slate-200">{prospects.length}</span> из {allProspects.length} потенциальных покупателей
        </p>
      </div>

      {/* Prospects list */}
      <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32]">
        <div className="p-5 border-b border-[#292a32] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-white">Квалифицированные покупатели</h2>
          </div>
          <Badge className="bg-[#292a32] text-slate-300">{prospects.length} записей</Badge>
        </div>

        <div className="divide-y divide-[#292a32]">
          {prospects.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Нет покупателей с Intent Score ≥ {minScore}</p>
              <p className="text-sm mt-1">Снизьте порог или подождите больше активности</p>
            </div>
          )}
          {prospects.map((p, i) => {
            const temp = getTemperature(p.normalizedScore);
            const TempIcon = temp.icon;
            const car = p.car;
            const sentCount = existingLeads.filter(l => l.car_id === p.car_id && l.buyer_profile?.raw_email === p.user_email).length;

            return (
              <div key={i} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-20 h-14 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                  {car?.images?.[0] ? (
                    <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-slate-400" /></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm">{car?.brand} {car?.model} {car?.year}</span>
                    <Badge className={temp.color}><TempIcon className="w-3 h-3 mr-1" />{temp.label}</Badge>
                    {sentCount > 0 && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">{sentCount} дилерам</Badge>}
                  </div>
                  <p className="text-xs text-slate-400">
                    <span className="font-mono">{maskEmail(p.user_email)}</span>
                    {' · '}{p.actions.map(a => ({ view: 'просмотр', favorite: 'избранное', offer: 'оффер', message: 'сообщение' }[a] || a)).join(', ')}
                    {p.views > 1 && ` · ${p.views}× просмотров`}
                  </p>
                  {car?.price && <p className="text-xs text-emerald-500 font-medium mt-0.5">{formatPrice(car.price)}</p>}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <div className={cn("text-xl font-bold", p.normalizedScore >= 70 ? 'text-emerald-400' : p.normalizedScore >= 40 ? 'text-emerald-500' : 'text-slate-400')}>
                      {p.normalizedScore}
                    </div>
                    <div className="text-xs text-slate-400">intent</div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenSendDialog(p)}
                    className="bg-emerald-500 hover:bg-emerald-600 gap-1 text-xs"
                  >
                    <Send className="w-3 h-3" /> Дилеру
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dealer stats section */}
      {dealerStats.length > 0 && (
        <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32]">
          <div className="p-5 border-b border-[#292a32] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-white">Статистика по дилерам</h2>
          </div>
          <div className="divide-y divide-[#292a32]">
            {dealerStats.map(({ dealer, leads, byStatus, avgScore, topBrands, convRate, rejRate, inventory, avgPrice, minPrice, maxPrice, invBrands, fuelTypes, bodyTypes, priceSegments, avgYear, avgMileage, transmissions, driveTypes }) => {
              const isExpanded = expandedDealerStats === dealer.id;
              return (
                <div key={dealer.id}>
                  <button
                    className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#101014] transition-colors"
                    onClick={() => setExpandedDealerStats(isExpanded ? null : dealer.id)}
                  >
                    {dealer.logo ? (
                      <img src={dealer.logo} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{dealer.name}</p>
                      <p className="text-xs text-slate-500">{inventory.length} авто · {leads.length} лидов · avg цена {avgPrice > 0 ? `${Math.round(avgPrice/1000)}k€` : '—'} · {convRate}% конверсия</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {byStatus.new > 0 && <Badge className="bg-slate-500/20 text-slate-400 text-xs">{byStatus.new} новых</Badge>}
                        {byStatus.sold > 0 && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">{byStatus.sold} продаж</Badge>}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#292a32] bg-[#1b1b22]">
                      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-[#292a32]">

                        {/* Col 1 — Inventory core */}
                        <div className="p-5 space-y-5">
                          <div>
                            <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-1">АВТОМОБИЛЕЙ</p>
                            <p className="text-4xl font-bold text-white tabular-nums">{inventory.length}</p>
                          </div>
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-slate-400 mb-0.5">МИН</p>
                              <p className="text-lg font-bold text-slate-200 tabular-nums">{minPrice > 0 ? `${Math.round(minPrice/1000)}k€` : '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-slate-400 mb-0.5">МАКС</p>
                              <p className="text-lg font-bold text-slate-200 tabular-nums">{maxPrice > 0 ? `${Math.round(maxPrice/1000)}k€` : '—'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] tracking-widest uppercase text-slate-400 mb-0.5">СР. ЦЕНА</p>
                            <p className="text-2xl font-bold text-white tabular-nums">{avgPrice > 0 ? `${Math.round(avgPrice/1000)}k€` : '—'}</p>
                          </div>
                        </div>

                        {/* Col 2 — Inventory details */}
                        <div className="p-5 space-y-5">
                          <div className="flex gap-6">
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-slate-400 mb-0.5">СР. ГОД</p>
                              <p className="text-2xl font-bold text-white tabular-nums">{avgYear || '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] tracking-widest uppercase text-slate-400 mb-0.5">ПРОБЕГ</p>
                              <p className="text-2xl font-bold text-white tabular-nums">{avgMileage > 0 ? `${Math.round(avgMileage/1000)}k` : '—'}</p>
                            </div>
                          </div>

                          {/* Transmission bars */}
                          <div className="space-y-2">
                            <p className="text-[10px] tracking-widest uppercase text-slate-400">КПП</p>
                            {transmissions.map(([t, n]) => (
                              <div key={t}>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                  <span>{t === 'automatic' ? 'АВТОМАТ' : 'МЕХАНИКА'}</span>
                                  <span className="font-semibold text-slate-200 tabular-nums">{n}</span>
                                </div>
                                <div className="h-1 bg-[#292a32] w-full">
                                  <div className="h-1 bg-emerald-500" style={{ width: `${(n / inventory.length) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Drive type bars */}
                          {driveTypes.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] tracking-widest uppercase text-slate-400">ПРИВОД</p>
                              {driveTypes.map(([d, n]) => (
                                <div key={d}>
                                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{{ fwd: 'ПЕРЕДНИЙ', rwd: 'ЗАДНИЙ', awd: 'ПОЛНЫЙ' }[d] || d}</span>
                                    <span className="font-semibold text-slate-200 tabular-nums">{n}</span>
                                  </div>
                                  <div className="h-1 bg-[#292a32] w-full">
                                    <div className="h-1 bg-emerald-500" style={{ width: `${(n / inventory.length) * 100}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Col 3 — Brands */}
                        <div className="p-5">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">МАРКИ В НАЛИЧИИ</p>
                          <div className="space-y-2.5">
                            {invBrands.slice(0, 7).map(([brand, count]) => (
                              <div key={brand}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="uppercase tracking-wide text-slate-300 font-medium">{brand}</span>
                                  <span className="font-bold text-slate-200 tabular-nums">{count}</span>
                                </div>
                                <div className="h-px bg-[#292a32] w-full">
                                  <div className="h-px bg-emerald-500" style={{ width: `${(count / inventory.length) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Price segments */}
                          {inventory.length > 0 && (
                            <div className="mt-5">
                              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">ЦЕНОВЫЕ СЕГМЕНТЫ</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                {Object.entries(priceSegments).map(([seg, count]) => (
                                  <div key={seg}>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{seg}</p>
                                    <p className="text-xl font-bold text-white tabular-nums">{count}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Col 4 — Leads funnel */}
                        <div className="p-5">
                          <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">ВОРОНКА ЛИДОВ</p>

                          {leads.length === 0 ? (
                            <p className="text-xs text-slate-400">Нет лидов</p>
                          ) : (
                            <div className="space-y-2.5">
                              {[
                                { label: 'ВСЕГО', value: leads.length },
                                { label: 'КОНТАКТ', value: byStatus.contacted + byStatus.meeting + byStatus.sold },
                                { label: 'ВСТРЕЧА', value: byStatus.meeting + byStatus.sold },
                                { label: 'ПРОДАЖА', value: byStatus.sold },
                                { label: 'ОТКАЗ', value: byStatus.rejected },
                              ].map((step, i) => (
                                <div key={i}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="tracking-widest text-slate-500">{step.label}</span>
                                    <span className="font-bold text-slate-200 tabular-nums">{step.value}</span>
                                  </div>
                                  <div className="h-1 bg-[#292a32] w-full">
                                    <div className="h-1 bg-emerald-500" style={{ width: `${leads.length ? (step.value / leads.length) * 100 : 0}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-5 pt-4 border-t border-[#292a32] grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">КОНВЕРСИЯ</p>
                              <p className="text-2xl font-bold text-white tabular-nums">{convRate}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">INTENT AVG</p>
                              <p className="text-2xl font-bold text-white tabular-nums">{avgScore || '—'}</p>
                            </div>
                          </div>

                          {/* Fuel types */}
                          {fuelTypes.length > 0 && (
                            <div className="mt-5">
                              <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-2">ТОПЛИВО</p>
                              <div className="space-y-1.5">
                                {fuelTypes.map(([type, count]) => (
                                  <div key={type} className="flex justify-between text-xs">
                                    <span className="uppercase tracking-wide text-slate-500">{({ petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид', plugin_hybrid: 'Plug-in', gas: 'Газ' }[type] || type)}</span>
                                    <span className="font-semibold text-slate-300 tabular-nums">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                  </div>
                  );
                  })}
                  </div>
                  </div>
                  )}

      {/* Sent leads table */}
      <div className="bg-[#1b1b22] rounded-2xl border border-[#292a32]">
        <div className="p-5 border-b border-[#292a32] flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-500" />
          <h2 className="font-semibold text-white">Все отправленные лиды</h2>
        </div>
        {loadingLeads ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
        ) : existingLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Лиды пока не отправлялись</p>
          </div>
        ) : (
          <div className="divide-y divide-[#292a32]">
            {existingLeads.map(lead => {
              const dealer = dealers.find(d => d.id === lead.dealer_id);
              return (
                <div key={lead.id} className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-16 h-11 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                    {lead.car_image ? (
                      <img src={lead.car_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-slate-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white">{lead.car_title}</p>
                    <p className="text-xs text-slate-400">
                      {lead.user_email} · <span className="font-medium">{dealer?.name || 'Дилер'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={cn("text-lg font-bold", lead.intent_score >= 70 ? 'text-emerald-400' : lead.intent_score >= 40 ? 'text-emerald-500' : 'text-slate-400')}>
                      {lead.intent_score}
                    </div>
                    <Select value={lead.status} onValueChange={(v) => updateLead.mutate({ id: lead.id, data: { status: v } })}>
                      <SelectTrigger className="w-32 h-8 text-xs bg-[#292a32] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#292a32] border-[#292a32]">
                        {Object.entries(leadStatusLabels).map(([v, label]) => (
                          <SelectItem key={v} value={v}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send to dealer dialog */}
      {sendDialogProspect && (
        <Dialog open={!!sendDialogProspect} onOpenChange={() => setSendDialogProspect(null)}>
          <DialogContent className="max-w-md bg-[#1b1b22] border-[#292a32]">
            <DialogHeader>
              <DialogTitle>Выбрать дилеров для лида</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Prospect summary */}
              <div className="flex items-center gap-3 p-3 bg-[#101014] rounded-xl">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                  {sendDialogProspect.car?.images?.[0] ? (
                    <img src={sendDialogProspect.car.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-slate-400" /></div>}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">
                    {sendDialogProspect.car?.brand} {sendDialogProspect.car?.model} {sendDialogProspect.car?.year}
                  </p>
                  <p className="text-xs text-slate-500">{maskEmail(sendDialogProspect.user_email)} · Score: <span className="font-bold text-emerald-400">{sendDialogProspect.normalizedScore}</span></p>
                </div>
              </div>

              {/* Dealer list */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Выберите дилеров</p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {dealers.map(dealer => {
                    const isSelected = selectedDealerIds.includes(dealer.id);
                    const alreadySent = existingLeads.find(
                      l => l.car_id === sendDialogProspect.car_id && l.dealer_id === dealer.id && l.buyer_profile?.raw_email === sendDialogProspect.user_email
                    );
                    const ds = dealerStats.find(d => d.dealer.id === dealer.id);
                    const carBrand = sendDialogProspect.car?.brand;
                    const brandMatch = ds && carBrand ? (ds.invBrands.find(([b]) => b === carBrand)?.[1] || 0) : 0;
                    const matchPct = ds?.inventory.length > 0 ? Math.round((brandMatch / ds.inventory.length) * 100) : 0;
                    return (
                      <button
                        key={dealer.id}
                        disabled={!!alreadySent}
                        onClick={() => handleToggleDealer(dealer.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          alreadySent
                            ? "opacity-50 cursor-not-allowed border-[#292a32] bg-[#101014]/50"
                            : isSelected
                              ? "border-emerald-500 bg-emerald-500/20"
                              : "border-[#292a32] hover:border-slate-600"
                        )}
                      >
                        {dealer.logo ? (
                          <img src={dealer.logo} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#292a32] flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-white">{dealer.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-slate-500">{dealer.city || ''}</p>
                            {ds && (
                              <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full', matchPct >= 30 ? 'bg-emerald-500/20 text-emerald-400' : matchPct > 0 ? 'bg-slate-500/20 text-slate-400' : 'bg-[#292a32] text-slate-500')}>
                                {carBrand && brandMatch > 0 ? `✓ ${brandMatch} ${carBrand}` : carBrand ? `0 ${carBrand}` : ''}
                                {ds.inventory.length > 0 && ` · ${ds.inventory.length} авто`}
                              </span>
                            )}
                          </div>
                        </div>
                        {alreadySent ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : isSelected ? (
                          <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-slate-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 gap-2"
                  disabled={selectedDealerIds.length === 0 || createLead.isPending}
                  onClick={handleSendToSelectedDealers}
                >
                  {createLead.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Отправить ({selectedDealerIds.length})</>}
                </Button>
                <Button variant="outline" onClick={() => setSendDialogProspect(null)}>Отмена</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}