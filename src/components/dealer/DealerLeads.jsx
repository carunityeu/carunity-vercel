import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/utils/format';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Thermometer, Car, Eye, Loader2, Target, Phone, Users, CalendarDays, CheckSquare, Plus, Trash2, CheckCircle2, Mail, Activity, Wallet, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import InfoHint from '@/components/dealer/InfoHint';
import InfoBanner from '@/components/dealer/InfoBanner';
import useDealerLeadSync from '@/components/dealer/useDealerLeadSync';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';
const ACCENT = '#10b981';

function getTemperature(score, t) {
  if (score >= 50) return { label: t('dealer.lead_hot'), icon: Flame, tone: 'hot', color: '#10b981' };
  if (score >= 25) return { label: t('dealer.lead_warm'), icon: Thermometer, tone: 'warm', color: '#f59e0b' };
  return { label: t('dealer.lead_cold'), icon: Activity, tone: 'cold', color: '#64748b' };
}

const tempBadge = {
  hot: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  warm: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  cold: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',
};
const tempScore = { hot: 'text-emerald-400', warm: 'text-amber-400', cold: 'text-slate-400' };

const statusKeys = { new: 'lead_status_new', contacted: 'lead_status_contacted', meeting: 'lead_status_meeting', sold: 'lead_status_sold', rejected: 'lead_status_rejected' };
const statusBadge = {
  new: 'bg-slate-500/15 text-slate-300 border border-slate-600/40',
  contacted: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  meeting: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  sold: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/25',
};
const statusColors = { new: '#64748b', contacted: '#f59e0b', meeting: '#10b981', sold: '#22c55e', rejected: '#ef4444' };

const taskTypeConfig = {
  call: { labelKey: 'dealer.task_call', icon: Phone },
  meeting: { labelKey: 'dealer.task_meeting', icon: Users },
  task: { labelKey: 'dealer.task_task', icon: CheckSquare },
};

function IntentRing({ score, color }) {
  const r = 17, c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#292a32" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-white leading-none">{score}</span>
      </div>
    </div>
  );
}

export default function DealerLeads({ dealerId, dealerIds, cars, dealerEmail }) {
  const { t, i18n } = useTranslation();
  const localeMap = { ru: 'ru-RU', en: 'en-GB', et: 'et-EE', lv: 'lv-LV', lt: 'lt-LT' };
  const dateLocale = localeMap[i18n.language?.slice(0, 2)] || 'ru-RU';
  const [selectedLead, setSelectedLead] = useState(null);
  const [notes, setNotes] = useState('');
  const [taskType, setTaskType] = useState('call');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const queryClient = useQueryClient();

  // Салоны одного владельца: лиды могут приходить на любой из них
  const salonIds = useMemo(() => {
    const list = (dealerIds || []).filter(Boolean);
    if (list.length > 0) return list;
    return dealerId ? [dealerId] : [];
  }, [dealerId, dealerIds]);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['dealerLeads', salonIds.join(',')],
    queryFn: async () => {
      const { items } = await entities.DealerLead.filter({ dealer_id: { $in: salonIds } }, { sort: '-created_date', limit: 200 });
      return items;
    },
    enabled: salonIds.length > 0,
  });

  const updateLead = useMutation({
    mutationFn: ({ id, data }) => entities.DealerLead.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['dealerLeads']); toast.success(t('dealer.lead_updated')); setSelectedLead(null); },
  });

  const handleLeadsSynced = useCallback(() => queryClient.invalidateQueries(['dealerLeads']), [queryClient]);
  useDealerLeadSync({ salonIds, cars, dealerEmail, leads, ready: !isLoading, onSynced: handleLeadsSynced });

  const actionLabel = useCallback((action) => t(`dealer.action_${action}`, action), [t]);

  const { data: tasks = [] } = useQuery({
    queryKey: ['leadTasks', selectedLead?.id],
    queryFn: () => entities.LeadTask.filter({ lead_id: selectedLead.id }, '-created_date'),
    enabled: !!selectedLead?.id,
  });

  const createTask = useMutation({ mutationFn: (data) => entities.LeadTask.create(data), onSuccess: () => { queryClient.invalidateQueries(['leadTasks', selectedLead?.id]); setTaskTitle(''); setTaskDue(''); toast.success(t('dealer.lead_task_added')); } });
  const updateTask = useMutation({ mutationFn: ({ id, data }) => entities.LeadTask.update(id, data), onSuccess: () => queryClient.invalidateQueries(['leadTasks', selectedLead?.id]) });
  const deleteTask = useMutation({ mutationFn: (id) => entities.LeadTask.delete(id), onSuccess: () => queryClient.invalidateQueries(['leadTasks', selectedLead?.id]) });

  const handleAddTask = () => {
    if (!taskTitle.trim() || !selectedLead) return;
    createTask.mutate({ lead_id: selectedLead.id, dealer_id: dealerId, type: taskType, title: taskTitle.trim(), due_date: taskDue || undefined, status: 'pending' });
  };

  const newLeads = leads.filter(l => l.status === 'new').length;
  const hotLeads = leads.filter(l => l.intent_score >= 50).length;

  const stats = useMemo(() => {
    const byStatus = { new: 0, contacted: 0, meeting: 0, sold: 0, rejected: 0 };
    leads.forEach(l => { if (byStatus[l.status] !== undefined) byStatus[l.status]++; });
    const avgScore = leads.length ? Math.round(leads.reduce((s, l) => s + (l.intent_score || 0), 0) / leads.length) : 0;
    const brandMap = {};
    leads.forEach(l => { if (l.car_brand) brandMap[l.car_brand] = (brandMap[l.car_brand] || 0) + 1; });
    const topBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const convRate = leads.length ? Math.round((byStatus.sold / leads.length) * 100) : 0;
    return { byStatus, avgScore, topBrands, convRate };
  }, [leads]);

  const last14 = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const ds = d.toISOString().slice(0, 10); days.push({ date: ds, label: d.toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit' }), leads: leads.filter(l => l.created_date?.slice(0, 10) === ds).length }); }
    return days;
  }, [leads, dateLocale]);

  const donutData = Object.entries(stats.byStatus).filter(([, v]) => v > 0).map(([k, v]) => ({ name: t(`dealer.${statusKeys[k]}`), value: v, color: statusColors[k] }));

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  if (leads.length === 0) return (
    <div className={cn(CARD, 'rounded-2xl p-12 text-center')}>
      <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{t('dealer.leads_empty')}</h3>
      <p className="text-slate-500">{t('dealer.leads_empty_desc')}</p>
    </div>
  );

  const kpis = [
    { label: t('dealer.leads_total'), value: leads.length, icon: Target, sub: t('dealer.lead_all') },
    { label: t('dealer.leads_new'), value: newLeads, icon: Mail, sub: t('dealer.lead_new_sub') },
    { label: t('dealer.leads_hot'), value: hotLeads, icon: Flame, sub: t('dealer.lead_hot_sub'), accent: true, hint: 'dealer.info_hot_leads' },
    { label: t('dealer.leads_conversion'), value: stats.convRate + '%', icon: TrendingUp, sub: `${stats.avgScore} · ${t('dealer.lead_intent', 'Интерес')}`, hint: 'dealer.info_conversion' },
  ];
  const maxBrand = Math.max(...stats.topBrands.map(b => b[1]), 1);

  const funnelSteps = [
    { label: t('dealer.leads_funnel_total'), value: leads.length, op: 'bg-emerald-500' },
    { label: t('dealer.leads_funnel_contact'), value: stats.byStatus.contacted + stats.byStatus.meeting + stats.byStatus.sold, op: 'bg-emerald-500/70' },
    { label: t('dealer.leads_funnel_meeting'), value: stats.byStatus.meeting + stats.byStatus.sold, op: 'bg-emerald-500/40' },
    { label: t('dealer.leads_funnel_sale'), value: stats.byStatus.sold, op: 'bg-emerald-500/20' },
  ];

  return (
    <div className="space-y-4">
      {/* AI Leads info banner */}
      <InfoBanner titleKey="dealer.info_ai_leads_title" descKey="dealer.info_ai_leads_desc" storageKey="dealer_info_ai_leads_dismissed" />
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((s, i) => (
          <div key={i} className={cn(CARD, 'rounded-2xl p-4 sm:p-5')}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#292a32] flex items-center justify-center"><s.icon className={cn('w-4 h-4', s.accent ? 'text-emerald-400' : 'text-slate-300')} /></div>
              <div className="text-slate-300 text-sm font-medium flex items-center gap-1.5">{s.label}{s.hint && <InfoHint titleKey={`${s.hint}_title`} descKey={`${s.hint}_desc`} />}</div>
            </div>
            <div className="text-2xl sm:text-[28px] font-bold text-white leading-none">{s.value}</div>
            <div className="text-slate-600 text-xs mt-2 truncate">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Row: leads over time + status donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn(CARD, 'rounded-2xl p-5 lg:col-span-2')}>
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-white font-semibold text-sm">{t('dealer.leads_over_time')}</h3><p className="text-slate-500 text-xs mt-0.5">{t('dealer.leads_total')} · 14</p></div>
            <span className="text-xs text-slate-400 bg-[#292a32] px-2.5 py-1 rounded-lg">14</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last14} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
                <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ACCENT} stopOpacity={0.3} /><stop offset="100%" stopColor={ACCENT} stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#292a32', border: '1px solid #292a32', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: ACCENT }} />
                <Area type="monotone" dataKey="leads" stroke={ACCENT} strokeWidth={2} fill="url(#lg)" dot={{ r: 2, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(CARD, 'rounded-2xl p-5')}>
          <h3 className="text-white font-semibold text-sm mb-1">{t('dealer.leads_by_status')}</h3>
          <p className="text-slate-500 text-xs mb-3">{t('dealer.leads_total')}</p>
          <div className="relative h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} stroke="none">
                  {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#292a32', border: '1px solid #292a32', borderRadius: 8, fontSize: 12 }} itemStyle={{ color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-white text-2xl font-bold leading-none">{leads.length}</span>
              <span className="text-slate-500 text-xs mt-1">{t('dealer.leads_total')}</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {donutData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400"><span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />{d.name}</span>
                <span className="text-white font-semibold tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: funnel + top brands */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn(CARD, 'rounded-2xl p-5 lg:col-span-2')}>
          <h3 className="text-white font-semibold text-sm mb-4 inline-flex items-center gap-1.5">{t('dealer.conversion_funnel')}<InfoHint titleKey="dealer.info_funnel_title" descKey="dealer.info_funnel_desc" /></h3>
          <div className="flex items-end gap-3 h-28">
            {funnelSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-1.5">
                <span className="text-sm font-bold text-white">{step.value}</span>
                <div className="w-full rounded-t-md" style={{ height: leads.length > 0 ? `${Math.max(6, (step.value / leads.length) * 80)}px` : '6px' }}>
                  <div className={cn('w-full h-full rounded-t-md', step.op)} />
                </div>
                <span className="text-[10px] text-slate-500 text-center leading-tight">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cn(CARD, 'rounded-2xl p-5')}>
          <h3 className="text-white font-semibold text-sm mb-4">{t('dealer.top_brands')}</h3>
          {stats.topBrands.length === 0 ? <p className="text-slate-500 text-sm text-center py-6">{t('dealer.no_data', '—')}</p> : (
            <div className="space-y-3">
              {stats.topBrands.map(([brand, count]) => (
                <div key={brand} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-300 truncate">{brand}</span><span className="text-slate-400 tabular-nums">{count}</span></div>
                    <div className="h-1.5 bg-[#292a32] rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(count / maxBrand) * 100}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leads list */}
      <div className={cn(CARD, 'rounded-2xl divide-y divide-[#292a32]')}>
        {leads.map(lead => {
          const temp = getTemperature(lead.intent_score, t);
          const isNew = lead.status === 'new';
          return (
            <div key={lead.id} className={cn('p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center', isNew && 'bg-emerald-500/5')}>
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                {lead.car_image ? <img src={lead.car_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-slate-600" /></div>}
                {isNew && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-white truncate">{lead.car_title}</span>
                  <span className={cn('inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full', tempBadge[temp.tone])}><temp.icon className="w-3 h-3" /> {temp.label}</span>
                  <span className={cn('text-[11px] px-2 py-0.5 rounded-full', statusBadge[lead.status])}>{t(`dealer.${statusKeys[lead.status]}`)}</span>
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.user_email}</span>
                  {lead.car_price && <span className="flex items-center gap-1"><Wallet className="w-3 h-3" />{formatPrice(lead.car_price)}</span>}
                  {lead.buyer_profile?.actions?.length > 0 && <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{lead.buyer_profile.actions.map(actionLabel).join(' · ')}</span>}
                </div>
              </div>
              <IntentRing score={lead.intent_score} color={temp.color} />
              <button onClick={() => { setSelectedLead(lead); setNotes(lead.dealer_notes || ''); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#292a32] border border-[#292a32] text-slate-300 hover:text-white hover:border-emerald-500/40 transition-colors text-xs whitespace-nowrap">
                <Eye className="w-3.5 h-3.5" /> {t('dealer.lead_details_btn')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Lead Detail Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg bg-[#1b1b22] border-[#292a32] text-white">
            <DialogHeader><DialogTitle className="text-white">{t('dealer.lead_details_title')}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-4 p-3 bg-[#101014] rounded-xl border border-[#292a32]">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">{selectedLead.car_image ? <img src={selectedLead.car_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-4 h-4 text-slate-600" /></div>}</div>
                <div className="min-w-0"><p className="font-semibold text-white text-sm truncate">{selectedLead.car_title}</p><p className="text-emerald-400 font-medium text-sm">{formatPrice(selectedLead.car_price)}</p></div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('dealer.lead_buyer_context')}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-[#101014] rounded-lg p-2.5 border border-[#292a32]"><p className="text-xs text-slate-500 mb-1">{t('dealer.intent_score_label')}</p><p className={cn('text-2xl font-bold', tempScore[getTemperature(selectedLead.intent_score, t).tone])}>{selectedLead.intent_score}</p></div>
                  <div className="bg-[#101014] rounded-lg p-2.5 border border-[#292a32]"><p className="text-xs text-slate-500 mb-1">{t('dealer.lead_buyer')}</p><p className="text-xs font-mono break-all text-slate-300">{selectedLead.user_email}</p></div>
                </div>
                {selectedLead.buyer_profile?.actions?.length > 0 && (
                  <div className="bg-[#101014] rounded-lg p-2.5 border border-[#292a32]"><p className="text-xs text-slate-500 mb-2">{t('dealer.lead_actions')}</p><div className="flex flex-wrap gap-1.5">{selectedLead.buyer_profile.actions.map((a, i) => <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#292a32] text-slate-300">{actionLabel(a)}</span>)}</div></div>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('dealer.lead_status_title')}</p>
                <Select value={selectedLead.status} onValueChange={(v) => setSelectedLead(l => ({ ...l, status: v }))}>
                  <SelectTrigger className="bg-[#101014] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1b1b22] border-[#292a32] text-white">{Object.entries(statusKeys).map(([v, keyName]) => <SelectItem key={v} value={v}>{t(`dealer.${keyName}`)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('dealer.lead_tasks_title')}</p>
                {tasks.length > 0 && (
                  <div className="space-y-1.5 mb-3">
                    {tasks.map(task => {
                      const cfg = taskTypeConfig[task.type] || taskTypeConfig.task; const TaskIcon = cfg.icon; const isDone = task.status === 'done';
                      return (
                        <div key={task.id} className={cn('flex items-center gap-2 p-2 rounded-lg border bg-[#101014]', isDone ? 'opacity-50 border-[#292a32]' : 'border-[#292a32]')}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#292a32]"><TaskIcon className="w-3.5 h-3.5 text-slate-300" /></div>
                          <div className="flex-1 min-w-0"><p className={cn('text-xs font-medium', isDone ? 'line-through text-slate-500' : 'text-white')}>{task.title}</p>{task.due_date && <p className="text-xs text-slate-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(task.due_date).toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>}</div>
                          <button onClick={() => updateTask.mutate({ id: task.id, data: { status: isDone ? 'pending' : 'done' } })} className="text-slate-500 hover:text-emerald-400 transition-colors"><CheckCircle2 className={cn('w-4 h-4', isDone && 'text-emerald-400')} /></button>
                          <button onClick={() => deleteTask.mutate(task.id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="bg-[#101014] rounded-xl p-3 space-y-2 border border-[#292a32]">
                  <div className="flex gap-1.5">{Object.entries(taskTypeConfig).map(([type, cfg]) => { const Ic = cfg.icon; return <button key={type} onClick={() => setTaskType(type)} className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border bg-[#292a32]', taskType === type ? 'border-emerald-500/40 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white')}><Ic className="w-3.5 h-3.5" /> {t(`dealer.${cfg.labelKey}`)}</button>; })}</div>
                  <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder={t('dealer.lead_notes_placeholder')} className="text-sm h-8 bg-[#1b1b22] border-[#292a32] text-white" onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />
                  <div className="flex gap-2"><Input type="datetime-local" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} className="text-xs h-8 flex-1 bg-[#1b1b22] border-[#292a32] text-white" /><Button size="sm" onClick={handleAddTask} disabled={!taskTitle.trim() || createTask.isPending} className="h-8 bg-emerald-500 hover:bg-emerald-600 gap-1 text-black"><Plus className="w-3.5 h-3.5" /> {t('dealer.lead_add_btn')}</Button></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{t('dealer.lead_notes_title')}</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('dealer.lead_notes_placeholder')} rows={3} className="bg-[#101014] border-[#292a32] text-white resize-none" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black" onClick={() => updateLead.mutate({ id: selectedLead.id, data: { status: selectedLead.status, dealer_notes: notes } })} disabled={updateLead.isPending}>{updateLead.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dealer.lead_save')}</Button>
                <Button variant="outline" onClick={() => setSelectedLead(null)} className="border-[#292a32] text-slate-300 hover:bg-[#292a32]">{t('dealer.lead_cancel')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}