import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

const cards = [
  {
    title: 'Политика конфиденциальности',
    description: 'Как мы собираем, используем и защищаем ваши персональные данные.',
    button: 'Читать политику',
    page: 'PrivacyPolicy',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
  },
  {
    title: 'Условия использования',
    description: 'Правила и условия использования платформы CarUnity.',
    button: 'Читать условия',
    page: 'Terms',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  },
  {
    title: 'Политика cookies',
    description: 'Информация об использовании файлов cookie на нашем сайте.',
    button: 'Читать про cookies',
    page: 'CookiePolicy',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  },
];

export default function LegalHub() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Правовая информация</h1>
          <p className="text-slate-400 text-lg">Выберите раздел, который вас интересует</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.page}
              to={createPageUrl(card.page)}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] flex flex-col justify-end cursor-pointer"
            >
              {/* Background image */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="relative z-10 p-6">
                <h2 className="text-white text-xl font-bold mb-2 leading-snug">{card.title}</h2>
                <p className="text-slate-300 text-sm mb-5 leading-relaxed">{card.description}</p>
                <span className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  {card.button}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}