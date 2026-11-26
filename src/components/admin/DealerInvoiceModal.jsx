import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, FileText, Plus, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { DEALER_PAID_SERVICES, getDealerServicePrice } from '@/lib/dealerPricingServices';

export default function DealerInvoiceModal({ dealer, open, onOpenChange }) {
  const [items, setItems] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) setItems({});
  }, [open, dealer]);

  const getServicePrice = (serviceId) => {
    const custom = getDealerServicePrice(dealer, serviceId);
    const service = DEALER_PAID_SERVICES.find(s => s.id === serviceId);
    return custom != null ? custom : service.basePrice;
  };

  const toggleItem = (serviceId) => {
    setItems(prev => {
      const next = { ...prev };
      if (next[serviceId]) {
        delete next[serviceId];
      } else {
        next[serviceId] = { qty: 1, price: getServicePrice(serviceId) };
      }
      return next;
    });
  };

  const setQty = (serviceId, qty) => {
    const q = Math.max(1, parseInt(qty) || 1);
    setItems(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], qty: q, price: getServicePrice(serviceId) },
    }));
  };

  const setPrice = (serviceId, price) => {
    const p = Math.max(0, parseFloat(price) || 0);
    setItems(prev => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], price: p },
    }));
  };

  const selectedItems = useMemo(() =>
    Object.entries(items).map(([id, data]) => {
      const service = DEALER_PAID_SERVICES.find(s => s.id === id);
      return { ...service, ...data, sum: data.qty * data.price };
    }),
    [items]
  );

  const total = useMemo(() =>
    selectedItems.reduce((acc, it) => acc + it.sum, 0),
    [selectedItems]
  );

  const handleSend = async () => {
    if (selectedItems.length === 0) {
      toast.error('Выберите хотя бы одну услугу');
      return;
    }
    if (!dealer?.owner_email) {
      toast.error('У дилера нет email');
      return;
    }

    setSending(true);
    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const invoiceDate = new Date().toLocaleDateString('ru-RU');

      const rowsHtml = selectedItems.map(it => `
        <tr style="font-size:14px;color:#0a0a0a;border-bottom:1px solid #e5e5e5;">
          <td style="padding:10px 12px;text-align:left;">${it.name}</td>
          <td style="padding:10px 12px;text-align:center;">${it.qty}</td>
          <td style="padding:10px 12px;text-align:right;">${it.price.toFixed(2)} €</td>
          <td style="padding:10px 12px;text-align:right;font-weight:600;">${it.sum.toFixed(2)} €</td>
        </tr>
      `).join('');

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Счёт от CarUnity</title></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;">
          <div style="background:#277c60;padding:24px 36px;color:#ffffff;font-size:20px;font-weight:700;">
            <img src="https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/096880133_carunityfavicon.png" width="32" height="32" style="vertical-align:middle;border-radius:6px;margin-right:10px;" />CarUnity
          </div>
          <div style="padding:36px;">
            <h1 style="font-size:26px;font-weight:700;margin:0 0 6px;color:#0a0a0a;">Счёт для ${dealer.name}</h1>
            <p style="font-size:14px;color:#737373;margin:0 0 20px;">Дата: ${invoiceDate} · № ${invoiceNumber}</p>
            <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;font-size:14px;">
              <tr style="background:#f4f4f5;font-weight:700;font-size:13px;color:#737373;">
                <td style="padding:10px 12px;text-align:left;">Услуга</td>
                <td style="padding:10px 12px;text-align:center;">Кол-во</td>
                <td style="padding:10px 12px;text-align:right;">Цена</td>
                <td style="padding:10px 12px;text-align:right;">Сумма</td>
              </tr>
              ${rowsHtml}
              <tr style="border-top:2px solid #e5e5e5;font-weight:700;font-size:16px;color:#0a0a0a;">
                <td colspan="3" style="padding:14px 12px;text-align:right;">Итого:</td>
                <td style="padding:14px 12px;text-align:right;color:#277c60;">${total.toFixed(2)} €</td>
              </tr>
            </table>
            <div style="margin-top:24px;">
              <p style="font-size:15px;font-weight:700;color:#0a0a0a;margin:0 0 8px;">Реквизиты для оплаты</p>
              <p style="font-size:14px;color:#737373;margin:0;line-height:1.8;">
                Получатель: Carunity OÜ<br />
                Назначение платежа: Счёт ${invoiceNumber}
              </p>
            </div>
            <a href="https://carunity.eu" style="display:inline-block;margin-top:20px;background:#277c60;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;">Перейти в кабинет</a>
          </div>
          <div style="padding:24px 36px 40px;border-top:1px solid #e5e5e5;">
            <p style="font-size:12px;color:#737373;text-align:center;margin:0;line-height:1.8;">
              Carunity OÜ · https://carunity.eu<br />
              Это автоматическое письмо, не отвечайте на него.
            </p>
          </div>
        </div>
      </body></html>`;

      await base44.integrations.Core.SendEmail({
        to: dealer.owner_email,
        subject: `Счёт от CarUnity — ${dealer.name} — ${total.toFixed(2)} €`,
        html,
      });

      toast.success('Счёт отправлен дилеру');
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error('Ошибка отправки счёта');
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#1b1b22] border-[#292a32]">
        <DialogHeader>
          <DialogTitle className="text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Выставить счёт — {dealer?.name}
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-slate-400 pt-1 pb-2">
          Отметьте услуги, укажите количество и при необходимости измените цену. Счёт будет отправлен на {dealer?.owner_email}.
        </p>

        <div className="space-y-1">
          {DEALER_PAID_SERVICES.map((service, idx) => {
            const item = items[service.id];
            const isSelected = !!item;
            const dealerPrice = getServicePrice(service.id);
            const hasDiscount = dealerPrice !== service.basePrice;

            return (
              <div key={service.id}>
                {idx > 0 && <div className="h-px bg-[#292a32] my-2" />}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 py-2">
                  {/* Checkbox + service info */}
                  <button
                    type="button"
                    onClick={() => toggleItem(service.id)}
                    className={`flex items-start gap-2.5 flex-1 min-w-0 text-left ${isSelected ? '' : 'opacity-80'}`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-[#292a32]'}`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{service.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Базовая: {service.basePrice.toFixed(2)} €
                        {hasDiscount && <span className="text-emerald-400 ml-2">Цена для компании: {dealerPrice.toFixed(2)} €</span>}
                      </p>
                    </div>
                  </button>

                  {/* Qty + price inputs (only when selected) */}
                  {isSelected && (
                    <div className="flex gap-2 sm:w-[220px] flex-shrink-0">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => setQty(service.id, e.target.value)}
                          className="bg-[#101014] border-[#292a32] text-white text-sm h-9 text-center"
                        />
                        <span className="text-xs text-slate-500 mt-0.5 block text-center">Кол-во</span>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => setPrice(service.id, e.target.value)}
                          className="bg-[#101014] border-[#292a32] text-white text-sm h-9 text-center"
                        />
                        <span className="text-xs text-slate-500 mt-0.5 block text-center">EUR</span>
                      </div>
                      <div className="flex items-end pb-1">
                        <span className="text-sm font-semibold text-emerald-400 whitespace-nowrap">
                          {(item.qty * item.price).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Total + send */}
        <div className="sticky bottom-0 bg-[#1b1b22] border-t border-[#292a32] pt-3 mt-2 -mx-1 px-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">Позиций: {selectedItems.length}</p>
              <p className="text-xl font-bold text-white">
                Итого: <span className="text-emerald-400">{total.toFixed(2)} €</span>
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || selectedItems.length === 0}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
            >
              {sending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              Отправить счёт
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}