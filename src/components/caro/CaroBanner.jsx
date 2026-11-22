import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CaroBrand from '@/components/caro/CaroBrand';
import '@/components/caro/caro.css';

export default function CaroBanner() {
  const { t } = useTranslation();
  return <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-6" aria-label="Caro AI">
    <div className="caro-banner"><div><CaroBrand /><p>{t('caro.banner')}</p></div>
      <Link to="/Caro" className="caro-cta"><Sparkles className="w-4 h-4" aria-hidden="true" />{t('caro.ask')}</Link>
    </div>
  </section>;
}