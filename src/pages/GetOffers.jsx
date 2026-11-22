import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Loader2, Car, Zap, RotateCcw, Check, X, MessageSquare,
  Heart, Calendar, Gauge, Fuel, Settings2, MapPin,
  LayoutGrid, List, ChevronDown, Users, MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCarDetailsPath } from '@/lib/shortIdUtils';
import ListPagination from '@/components/ui/ListPagination';
import { toast } from 'sonner';

const FUEL_LABELS = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид', plugin_hybrid: 'Плагин', gas: 'Газ' };
const TRANS_LABELS = { manual: 'Механика', automatic: 'Автомат' };

const HOW_IT_WORKS = [
  {
    num: '1',
    icon: Car,
    title: 'Разместите авто',
    desc: 'Заполните объявление за несколько минут',
  },
  {
    num: '2',
    icon: Users,
    title: 'Дилеры видят объявление',
    desc: 'Ваше авто появляется в каталоге для дилеров',
  },
  {
    num: '3',
    icon: MessageCircle,
    title: 'Получайте предложения',
    desc: 'Дилеры сами пишут вам с предложениями о покупке',
  },
];

export default function GetOffers() {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // Offers management state
  const [user, setUser] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [respondDialog, setRespondDialog] = useState(false);
  const [respondAction, setRespondAction] = useState('');
  const queryClient = useQueryClient();

  // Load cars with get_offers tag
  const { data: allCars = [], isLoading } = useQuery({
    queryKey: ['getOffersCars'],
    queryFn: () => base44.entities.Car.filter({ status: 'active' }, '-created_date', 200),
  });

  const cars = allCars.filter(c =>
    (c.features && c.features.includes('get_offers')) ||
    (c.dealer_distribution_mode && c.dealer_distribution_mode !== 'none')
  );

  const sorted = [...cars].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const displayed = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Offers (for logged-in users)
  const { data: offers = [] } = useQuery({
    queryKey: ['myTradeInOffers', user?.email],
    queryFn: () => base44.entities.TradeInOffer.filter({ seller_email: user.email }, '-created_date'),
    enabled: !!user
  });

  const handleRespond = (offer, action) => {
    setSelectedOffer(offer);
    setRespondAction(action);
    setResponseText('');
    setRespondDialog(true);
  };

  const submitResponse = async () => {
    const statusMap = { accept: 'accepted', reject: 'rejected', info: 'more_info_requested' };
    await base44.entities.TradeInOffer.update(selectedOffer.id, {
      status: statusMap[respondAction],
      seller_response: responseText
    });
    queryClient.invalidateQueries(['myTradeInOffers']);
    toast.success(respondAction === 'accept' ? 'Оффер принят!' : respondAction === 'reject' ? 'Оффер отклонён' : 'Запрос отправлен');
    setRespondDialog(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="hover:text-white transition-colors">Главная</Link>
          <span className="text-slate-600">›</span>
          <span className="text-white">{t('consignment.title')}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 break-words">{t('consignment.title')}</h1>
          <p className="text-slate-400">Разместите автомобиль — проверенные дилеры сами свяжутся с вами</p>
        </div>

        {/* How it works */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-10">
          <h2 className="text-base font-semibold text-white mb-6">Как это работает</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="flex flex-col items-start gap-4 relative">
                {/* Arrow between steps */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-0.5 border-t border-dashed border-slate-700 z-0" style={{ width: 'calc(100% - 4rem)', left: '4.5rem' }} />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl border-2 border-emerald-500 flex items-center justify-center bg-slate-950 mb-1">
                    <step.icon className="w-9 h-9 text-emerald-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-sm flex items-center justify-center font-bold leading-none">{step.num}</span>
                </div>
                <div>
                  <p className="font-bold text-white text-base">{step.title}</p>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listings header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{t('consignment.listings')}</h2>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded-xl pl-4 pr-8 py-2 outline-none cursor-pointer"
              >
                <option value="newest">Сначала новые</option>
                <option value="price_asc">Цена: по возрастанию</option>
                <option value="price_desc">Цена: по убыванию</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {/* View toggle */}
            <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cars grid */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-slate-400">{t('consignment.empty')}</div>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
            }>
              {displayed.map(car => (
                <CarCard key={car.id} car={car} viewMode={viewMode} />
              ))}
            </div>

            <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Respond Dialog */}
      <Dialog open={respondDialog} onOpenChange={setRespondDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {respondAction === 'accept' ? 'Принять оффер' : respondAction === 'reject' ? 'Отклонить оффер' : 'Запросить дополнительную информацию'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Textarea
              value={responseText}
              onChange={e => setResponseText(e.target.value)}
              placeholder={
                respondAction === 'accept' ? 'Напишите дилеру — когда удобно встретиться, адрес...'
                  : respondAction === 'reject' ? 'Необязательно, но вы можете объяснить причину...'
                    : 'Что именно вас интересует?'
              }
              rows={3}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRespondDialog(false)} className="flex-1">Отмена</Button>
              <Button onClick={submitResponse} className={`flex-1 gap-2 ${respondAction === 'accept' ? 'bg-emerald-500 hover:bg-emerald-600' : respondAction === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                {respondAction === 'accept' ? <><Check className="w-4 h-4" /> Подтвердить</> : respondAction === 'reject' ? <><X className="w-4 h-4" /> Отклонить</> : <><MessageSquare className="w-4 h-4" /> Отправить</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CarCard({ car, viewMode }) {
  const image = car.images?.[0];

  if (viewMode === 'list') {
    return (
      <Link to={getCarDetailsPath(car)} className="group bg-slate-900 rounded-2xl overflow-hidden flex gap-4 hover:ring-1 hover:ring-emerald-500 transition-all p-3">
        <div className="w-36 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-800">
          {image
            ? <img src={image} alt={car.title} className="w-full h-full object-cover transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-slate-600"><Car className="w-6 h-6" /></div>
          }
        </div>
        <div className="flex-1 py-1">
          <h3 className="font-bold text-white text-sm mb-1">{car.title}</h3>
          {car.price && <p className="text-emerald-400 font-bold text-base mb-2">{car.price.toLocaleString('ru-RU')} €</p>}
          <div className="flex flex-wrap gap-1.5">
            {car.year && <Chip icon={Calendar}>{car.year}</Chip>}
            {car.mileage && <Chip icon={Gauge}>{car.mileage.toLocaleString('ru-RU')} км</Chip>}
            {car.fuel_type && <Chip icon={Fuel}>{FUEL_LABELS[car.fuel_type] || car.fuel_type}</Chip>}
            {car.transmission && <Chip icon={Settings2}>{TRANS_LABELS[car.transmission] || car.transmission}</Chip>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={getCarDetailsPath(car)} className="group bg-slate-900 rounded-2xl overflow-hidden hover:ring-1 hover:ring-emerald-500 transition-all duration-200">
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-800" style={{ height: '180px' }}>
        {image
          ? <img src={image} alt={car.title} className="w-full h-full object-cover transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-slate-600"><Car className="w-8 h-8" /></div>
        }
        <button
          onClick={e => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <Heart className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-sm leading-tight mb-1">{car.title}</h3>
        {car.price && (
          <p className="text-emerald-400 font-bold text-base mb-3">{car.price.toLocaleString('ru-RU')} €</p>
        )}

        {/* Specs */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {car.year && <Chip icon={Calendar}>{car.year}</Chip>}
          {car.mileage && <Chip icon={Gauge}>{car.mileage.toLocaleString('ru-RU')} км</Chip>}
          {car.fuel_type && <Chip icon={Fuel}>{FUEL_LABELS[car.fuel_type] || car.fuel_type}</Chip>}
          {car.transmission && <Chip icon={Settings2}>{TRANS_LABELS[car.transmission] || car.transmission}</Chip>}
        </div>

        {/* Location */}
        {(car.location || car.country) && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{[car.location, car.country].filter(Boolean).join(', ')}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function Chip({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800 rounded-lg px-2 py-1">
      <Icon className="w-3 h-3" />{children}
    </span>
  );
}