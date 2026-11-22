import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DEALER_PAID_SERVICES } from '@/lib/dealerPricingServices';

export default function DealerPricingPolicyModal({ dealer, open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [pricing, setPricing] = useState({});
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (!dealer) return;
    const map = {};
    (dealer.custom_pricing || []).forEach(p => {
      map[p.service_id] = {
        discount_percent: p.discount_percent || 0,
        custom_price: p.custom_price || 0,
      };
    });
    setPricing(map);
  }, [dealer]);

  const handleDiscountChange = (serviceId, value) => {
    const pct = Math.max(0, Math.min(100, parseFloat(value) || 0));
    const service = DEALER_PAID_SERVICES.find(s => s.id === serviceId);
    const customPrice = pct > 0 ? Math.round(service.basePrice * (1 - pct / 100) * 100) / 100 : service.basePrice;
    setPricing(prev => ({
      ...prev,
      [serviceId]: { discount_percent: pct, custom_price: customPrice },
    }));
  };

  const handlePriceChange = (serviceId, value) => {
    const price = Math.max(0, parseFloat(value) || 0);
    const service = DEALER_PAID_SERVICES.find(s => s.id === serviceId);
    const pct = service.basePrice > 0 ? Math.round((1 - price / service.basePrice) * 100) : 0;
    setPricing(prev => ({
      ...prev,
      [serviceId]: { discount_percent: Math.max(0, pct), custom_price: price },
    }));
  };

  const handleSave = async (serviceId) => {
    setSaving(serviceId);
    try {
      const current = dealer.custom_pricing || [];
      const existingIdx = current.findIndex(p => p.service_id === serviceId);
      const entry = pricing[serviceId] || { discount_percent: 0, custom_price: 0 };

      let updated;
      if (existingIdx >= 0) {
        updated = current.map((p, i) => i === existingIdx ? { ...p, ...entry } : p);
      } else {
        updated = [...current, { service_id: serviceId, ...entry }];
      }

      // Remove entries with 0 discount and 0 custom price (no override)
      updated = updated.filter(p => p.discount_percent > 0 || (p.custom_price > 0 && p.custom_price !== DEALER_PAID_SERVICES.find(s => s.id === p.service_id)?.basePrice));

      await base44.entities.Dealer.update(dealer.id, { custom_pricing: updated });
      queryClient.invalidateQueries(['adminDealers']);
      toast.success('Цена сохранена');
    } catch (e) {
      toast.error('Ошибка сохранения');
    }
    setSaving(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1b1b22] border-[#292a32]">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            Ценовая политика — {dealer?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 pt-2">
          {DEALER_PAID_SERVICES.map((service, idx) => {
            const entry = pricing[service.id] || { discount_percent: 0, custom_price: 0 };
            const currentPrice = entry.custom_price > 0 ? entry.custom_price : service.basePrice;
            const discount = entry.discount_percent || 0;

            return (
              <div key={service.id}>
                {idx > 0 && <div className="h-px bg-[#292a32] my-3" />}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 py-2">
                  {/* Left: service info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm mb-1.5">{service.name}</p>
                    <div className="space-y-0.5 text-xs text-slate-400">
                      <p>Обычная цена: <span className="text-slate-200 font-medium">{service.basePrice.toFixed(2)} €</span></p>
                      <p>Цена для компании: <span className={discount > 0 ? 'text-emerald-400 font-medium' : 'text-slate-200 font-medium'}>{currentPrice.toFixed(2)} €</span></p>
                      <p>Скидка: <span className={discount > 0 ? 'text-emerald-400 font-medium' : 'text-slate-200 font-medium'}>{discount}%</span></p>
                    </div>
                  </div>

                  {/* Right: inputs + save */}
                  <div className="flex flex-col gap-2 sm:w-[200px]">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={entry.discount_percent || ''}
                          onChange={(e) => handleDiscountChange(service.id, e.target.value)}
                          placeholder="0"
                          className="bg-[#101014] border-[#292a32] text-white text-sm h-9"
                        />
                        <span className="text-xs text-slate-500 mt-0.5 block">Скидка %</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.custom_price || ''}
                          onChange={(e) => handlePriceChange(service.id, e.target.value)}
                          placeholder={service.basePrice.toFixed(2)}
                          className="bg-[#101014] border-[#292a32] text-white text-sm h-9"
                        />
                        <span className="text-xs text-slate-500 mt-0.5 block">EUR</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSave(service.id)}
                      disabled={saving === service.id}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8"
                    >
                      {saving === service.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Check className="w-3 h-3" />}
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}