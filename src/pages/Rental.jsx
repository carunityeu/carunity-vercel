import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  Calendar,
  MapPin,
  Shield,
  Clock,
  CreditCard,
  Users,
  Fuel,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail } from
'lucide-react';
import { motion } from 'framer-motion';

const rentalCategories = [
{ name: 'Эконом', price: 'от 25€/день', icon: '🚗', description: 'Компактные авто для города' },
{ name: 'Комфорт', price: 'от 45€/день', icon: '🚙', description: 'Седаны бизнес-класса' },
{ name: 'Внедорожники', price: 'от 65€/день', icon: '🚘', description: 'SUV для любых дорог' },
{ name: 'Премиум', price: 'от 120€/день', icon: '🏎️', description: 'Люксовые автомобили' },
{ name: 'Электро', price: 'от 55€/день', icon: '⚡', description: 'Tesla и другие EV' },
{ name: 'Микроавтобусы', price: 'от 85€/день', icon: '🚐', description: 'Для больших групп' }];


const benefits = [
{ icon: Shield, title: 'Полная страховка', description: 'КАСКО включено в стоимость' },
{ icon: Clock, title: '24/7 поддержка', description: 'Помощь на дороге круглосуточно' },
{ icon: CreditCard, title: 'Без залога', description: 'Для постоянных клиентов' },
{ icon: MapPin, title: 'Доставка', description: 'Доставим авто к вам' }];


export default function Rental() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge className="mb-6 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Car className="w-3 h-3 mr-1" />
              Аренда автомобилей
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Арендуйте автомобиль<br />
              <span className="text-emerald-400">просто и выгодно</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Широкий выбор автомобилей для любых целей. Прозрачные цены, 
              никаких скрытых платежей. Доставка по всей Балтии.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                Посмотреть автомобили
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-background text-slate-900 px-8 text-sm font-medium rounded-md inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border shadow-sm hover:text-accent-foreground h-10 border-white/30 hover:bg-white/10 gap-2">
                <Phone className="w-5 h-5" />
                +371 2000 0000
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {rentalCategories.map((cat, idx) =>
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 text-center shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all cursor-pointer">

              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{cat.name}</h3>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mt-1">{cat.price}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{cat.description}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Почему арендовать у нас?</h2>
          <p className="text-slate-500 dark:text-slate-400">Лучшие условия аренды в Балтии</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) =>
          <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <benefit.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{benefit.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-100 dark:bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Как это работает</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
            { step: '01', title: 'Выберите автомобиль', description: 'Выберите подходящий автомобиль из нашего каталога' },
            { step: '02', title: 'Оформите бронь', description: 'Заполните форму и выберите даты аренды' },
            { step: '03', title: 'Получите авто', description: 'Заберите авто в офисе или закажите доставку' }].
            map((item, idx) =>
            <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-500 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Хотите стать партнёром?
          </h2>
          <p className="text-emerald-100 mb-8">
            Зарегистрируйте свою компанию и размещайте автомобили для аренды на нашей платформе
          </p>
          <Link to={createPageUrl('DealerRegister')}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100">
              Стать партнёром
            </Button>
          </Link>
        </div>
      </div>
    </div>);

}