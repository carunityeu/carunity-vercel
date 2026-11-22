import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCompare } from './CompareContext';
import { Button } from '@/components/ui/button';
import { X, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CompareBar() {
  const { compareList, removeCar, clearAll } = useCompare();
  const { t } = useTranslation();

  const { pathname } = useLocation();
  if (compareList.length === 0 || pathname.toLowerCase() === '/compare') return null;

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 flex justify-center px-3">
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        className="w-full sm:max-w-[640px] lg:max-w-[760px]"
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
            {/* Car chips */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide min-w-0">
              {compareList.map(car => (
                <div
                  key={car.id}
                  className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-xl pl-1 pr-2.5 py-1 flex-shrink-0"
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                    {car.images?.[0] ? (
                      <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        {car.brand?.[0]}{car.model?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col min-w-0 leading-tight max-w-[120px]">
                    <span className="text-xs text-white font-medium truncate">{car.brand} {car.model}</span>
                    <span className="text-[10px] text-slate-400">{car.year}</span>
                  </div>
                  <span className="sm:hidden text-xs text-white font-medium">{car.year}</span>
                  <button
                    onClick={() => removeCar(car.id)}
                    className="ml-0.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded-md p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {[...Array(Math.min(4 - compareList.length, 2))].map((_, i) => (
                <div
                  key={i}
                  className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-dashed border-slate-700/70 flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearAll(); }}
                className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg p-2 transition-colors"
                title={t('compare.clear', 'Очистить')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <Button
                asChild
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 h-9 px-3 sm:px-4 rounded-xl"
              >
                <Link to={createPageUrl('Compare')} onClick={(e) => e.stopPropagation()}>
                  <span className="hidden sm:inline">{t('compare.button', 'Сравнить')}</span>
                  <span className="sm:hidden flex items-center gap-1 text-xs">
                    {compareList.length} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}