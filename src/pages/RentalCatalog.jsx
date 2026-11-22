import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ListPagination from '@/components/ui/ListPagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Car, Shield, Clock, CreditCard, MapPin, Fuel, Users,
  Phone, ArrowRight, Loader2, Search, CheckCircle, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const categoryLabels = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  suv: 'Внедорожник',
  premium: 'Премиум',
  electric: 'Электро',
  minibus: 'Микроавтобус'
};

const fuelLabels = {
  petrol: 'Бензин',
  diesel: 'Дизель',
  electric: 'Электро',
  hybrid: 'Гибрид'
};

const benefits = [
  { icon: Shield, title: 'Полная страховка', description: 'КАСКО включено' },
  { icon: Clock, title: '24/7 поддержка', description: 'Помощь на дороге' },
  { icon: CreditCard, title: 'Без залога', description: 'Для постоянных клиентов' },
  { icon: MapPin, title: 'Доставка', description: 'Доставим авто к вам' },
];

export default function RentalCatalog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const { data: rentalCars = [], isLoading } = useQuery({
    queryKey: ['rentalCars'],
    queryFn: () => base44.entities.RentalCar.filter({ is_available: true }, '-created_date', 50)
  });

  const filteredCars = rentalCars.filter(car => {
    const matchesSearch = !searchQuery ||
      car.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const pagedCars = filteredCars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-sm mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('common.back', 'Назад')}
          </button>
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Car className="w-3 h-3 mr-1" />
              Аренда автомобилей
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              Аренда авто <span className="text-emerald-400">без лишних сложностей</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8">
              Более 500 автомобилей в наличии. Страховка включена, без залога для постоянных клиентов.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 gap-2 h-12 px-8">
                <Phone className="w-5 h-5" />
                +371 2000 0000
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 h-12">
                Смотреть автомобили
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 text-center shadow-lg border border-slate-100 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <benefit.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{benefit.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Поиск по марке или модели..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {Object.entries(categoryLabels).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Автомобили не найдены</h3>
            <p className="text-slate-500 dark:text-slate-400">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedCars.map((car, idx) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  {car.category && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-slate-900/80 text-white border-0 backdrop-blur-sm">
                        {categoryLabels[car.category] || car.category}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{car.brand} {car.model}</h3>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {car.price_per_day}€<span className="text-sm font-normal text-slate-400">/день</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {car.fuel_type && (
                      <div className="flex items-center gap-1.5">
                        <Fuel className="w-4 h-4" />
                        {fuelLabels[car.fuel_type] || car.fuel_type}
                      </div>
                    )}
                    {car.seats && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {car.seats} мест
                      </div>
                    )}
                    {car.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {car.location}
                      </div>
                    )}
                  </div>

                  {car.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {car.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <Button className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 gap-2">
                    <Phone className="w-4 h-4" />
                    Забронировать
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">Как арендовать?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Выберите автомобиль', description: 'Выберите подходящий вариант из нашего каталога' },
              { step: '02', title: 'Оформите бронь', description: 'Свяжитесь с нами по телефону или через форму' },
              { step: '03', title: 'Получите авто', description: 'Заберите в офисе или закажите доставку' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}