import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Megaphone, Search, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice } from '@/utils/format';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Ожидает оплаты', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock },
  paid: { label: 'Оплачен', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle },
  fulfilling: { label: 'Запуск рекламы', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertCircle },
  completed: { label: 'Завершён', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
  failed: { label: 'Ошибка', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

const metaStatusConfig = {
  pending: { label: 'Meta: ожидание', color: 'bg-slate-500/20 text-slate-400' },
  created: { label: 'Meta: создана', color: 'bg-blue-500/20 text-blue-400' },
  active: { label: 'Meta: активна', color: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: 'Meta: ошибка', color: 'bg-red-500/20 text-red-400' },
  completed: { label: 'Meta: завершена', color: 'bg-slate-500/20 text-slate-400' },
};

export default function AdminMetaAds() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['adminMetaAdsOrders'],
    queryFn: () => base44.entities.MetaAdsOrder.list('-created_date', 200),
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MetaAdsOrder.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminMetaAdsOrders']);
      toast.success('Заказ обновлён');
    },
    onError: () => toast.error('Ошибка обновления'),
  });

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return o.package_name?.toLowerCase().includes(q) ||
      o.listing_title?.toLowerCase().includes(q) ||
      o.seller_email?.toLowerCase().includes(q) ||
      o.dealer_id?.toLowerCase().includes(q);
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    fulfilling: orders.filter(o => o.status === 'fulfilling').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'paid' || o.status === 'fulfilling' || o.status === 'completed')
      .reduce((sum, o) => sum + (o.carunity_margin || 0), 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <p className="text-slate-500 text-xs">Всего заказов</p>
          <p className="text-white text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <p className="text-slate-500 text-xs">Ожидают оплаты</p>
          <p className="text-slate-300 text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <p className="text-slate-500 text-xs">В работе</p>
          <p className="text-amber-400 text-2xl font-bold mt-1">{stats.fulfilling}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <p className="text-slate-500 text-xs">Завершено</p>
          <p className="text-emerald-400 text-2xl font-bold mt-1">{stats.completed}</p>
        </div>
        <div className="bg-[#1b1b22] border border-[#292a32] rounded-xl p-4">
          <p className="text-slate-500 text-xs">Маржа CarUnity</p>
          <p className="text-emerald-400 text-xl font-bold mt-1">{formatPrice(stats.revenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
        <div className="p-4 border-b border-[#292a32] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Поиск по пакету, объявлению, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#101014] border-[#292a32] text-white placeholder:text-slate-600"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-[#101014] border-[#292a32] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#292a32] border-[#292a32]">
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">Ожидают оплаты</SelectItem>
              <SelectItem value="paid">Оплачены</SelectItem>
              <SelectItem value="fulfilling">В работе</SelectItem>
              <SelectItem value="completed">Завершены</SelectItem>
              <SelectItem value="failed">Ошибки</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Заказов Meta Ads пока нет</p>
          </div>
        ) : (
          <div className="divide-y divide-[#292a32]">
            {filtered.map(order => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <div key={order.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">{order.package_name}</h3>
                      <Badge className={statusConfig[order.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[order.status]?.label}
                      </Badge>
                      {order.meta_status && metaStatusConfig[order.meta_status] && (
                        <Badge className={metaStatusConfig[order.meta_status].color}>
                          {metaStatusConfig[order.meta_status].label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 truncate">{order.listing_title || '—'}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>Продавец: {order.seller_email}</span>
                      <span>Тип: {order.listing_type}</span>
                      {order.dealer_id && <span>Дилер ID: {order.dealer_id}</span>}
                      <span>{new Date(order.created_date).toLocaleString('ru-RU')}</span>
                    </div>
                    {order.meta_error && (
                      <p className="text-xs text-red-400">Ошибка Meta: {order.meta_error}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold text-lg">{formatPrice(order.price)}</p>
                      <p className="text-xs text-slate-500">Бюджет Meta: {formatPrice(order.meta_budget)}</p>
                      <p className="text-xs text-slate-500">Маржа: {formatPrice(order.carunity_margin)}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                      {order.listing_id && (
                        <Link to={`${createPageUrl(order.listing_type === 'car' ? 'CarDetails' : 'VehicleDetails')}?id=${order.listing_id}`}>
                          <Button variant="outline" size="sm" className="border-[#292a32] text-slate-300 hover:bg-[#292a32]">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      )}
                      <Select
                        value={order.status}
                        onValueChange={(v) => updateOrder.mutate({ id: order.id, data: { status: v } })}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs bg-[#101014] border-[#292a32] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#292a32] border-[#292a32]">
                          <SelectItem value="pending">Ожидает оплаты</SelectItem>
                          <SelectItem value="paid">Оплачен</SelectItem>
                          <SelectItem value="fulfilling">Запуск рекламы</SelectItem>
                          <SelectItem value="completed">Завершён</SelectItem>
                          <SelectItem value="failed">Ошибка</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}