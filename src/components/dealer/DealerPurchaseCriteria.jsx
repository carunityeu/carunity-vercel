import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, X, Plus, Settings2, Tag } from 'lucide-react';
import { toast } from 'sonner';

const BODY_TYPES = ['sedan', 'hatchback', 'suv', 'crossover', 'wagon', 'coupe', 'convertible', 'minivan', 'pickup'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'gas'];
const COUNTRIES = ['Estonia', 'Latvia', 'Lithuania', 'Finland', 'Poland', 'Germany', 'Sweden', 'Norway'];

export default function DealerPurchaseCriteria({ dealer }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [brandInput, setBrandInput] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: criteria, isLoading } = useQuery({
    queryKey: ['dealerCriteria', dealer?.id],
    queryFn: async () => {
      if (!dealer?.id) return null;
      const existing = await entities.DealerPurchaseCriteria.filter({ dealer_id: dealer.id });
      if (existing && existing.length > 0) return existing[0];
      return null;
    },
    enabled: !!dealer?.id
  });

  // Initialize form when criteria loads
  useEffect(() => {
    if (form) return;
    if (criteria) {
      setForm({
        enabled: criteria.enabled || false,
        brands: criteria.brands || [],
        body_types: criteria.body_types || [],
        fuel_types: criteria.fuel_types || [],
        price_min: criteria.price_min || '',
        price_max: criteria.price_max || '',
        year_min: criteria.year_min || '',
        year_max: criteria.year_max || '',
        mileage_max: criteria.mileage_max || '',
        countries: criteria.countries || []
      });
    } else if (!isLoading) {
      setForm({
        enabled: false, brands: [], body_types: [], fuel_types: [],
        price_min: '', price_max: '', year_min: '', year_max: '',
        mileage_max: '', countries: []
      });
    }
  }, [criteria, isLoading, form]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleArray = (key, val) => {
    setForm(prev => {
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };
  const addBrand = () => {
    const b = brandInput.trim();
    if (b && !(form.brands || []).some(x => x.toLowerCase() === b.toLowerCase())) {
      update('brands', [...(form.brands || []), b]);
    }
    setBrandInput('');
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        year_min: form.year_min ? Number(form.year_min) : null,
        year_max: form.year_max ? Number(form.year_max) : null,
        mileage_max: form.mileage_max ? Number(form.mileage_max) : null,
      };
      if (criteria) {
        await entities.DealerPurchaseCriteria.update(criteria.id, payload);
      } else {
        await entities.DealerPurchaseCriteria.create({
          ...payload,
          dealer_id: dealer.id,
          dealer_email: dealer.email,
          dealer_name: dealer.name
        });
      }
      queryClient.invalidateQueries(['dealerCriteria', dealer?.id]);
      toast.success(t('fast_sale.criteria_saved'));
    } catch (e) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  if (isLoading || !form) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Enable toggle */}
      <div className="flex items-center justify-between bg-[#101014] border border-[#292a32] rounded-xl p-4">
        <div>
          <p className="text-white font-medium text-sm">{t('fast_sale.enable_criteria')}</p>
          <p className="text-xs text-slate-500 mt-0.5">{form.enabled ? t('fast_sale.criteria_enabled_desc') : t('fast_sale.criteria_disabled_desc')}</p>
        </div>
        <Switch checked={form.enabled} onCheckedChange={v => update('enabled', v)} />
      </div>

      {/* Brands */}
      <div className="bg-[#101014] border border-[#292a32] rounded-xl p-4">
        <Label className="text-slate-400 mb-2 block">{t('fast_sale.brands')}</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={brandInput}
            onChange={e => setBrandInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBrand(); } }}
            placeholder={t('fast_sale.brand_placeholder')}
            className="bg-[#1b1b22] border-[#292a32] text-white text-sm"
          />
          <Button size="sm" variant="outline" className="border-[#292a32] text-slate-300" onClick={addBrand}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {(form.brands || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.brands.map(b => (
              <span key={b} className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-xs px-2 py-1 rounded-lg">
                <Tag className="w-3 h-3" /> {b}
                <button onClick={() => update('brands', form.brands.filter(x => x !== b))} className="hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body types & Fuel types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-4">
          <Label className="text-slate-400 mb-2 block">{t('fast_sale.body_types')}</Label>
          <div className="flex flex-wrap gap-2">
            {BODY_TYPES.map(bt => (
              <button key={bt} onClick={() => toggleArray('body_types', bt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  (form.body_types || []).includes(bt)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#1b1b22] text-slate-400 border-[#292a32] hover:border-slate-600'
                }`}>
                {t(`fast_sale.body_${bt}`, bt)}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-4">
          <Label className="text-slate-400 mb-2 block">{t('fast_sale.fuel_types')}</Label>
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map(ft => (
              <button key={ft} onClick={() => toggleArray('fuel_types', ft)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  (form.fuel_types || []).includes(ft)
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#1b1b22] text-slate-400 border-[#292a32] hover:border-slate-600'
                }`}>
                {t(`fast_sale.fuel_${ft}`, ft)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price & Year & Mileage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3">
          <Label className="text-slate-400 mb-1 block text-xs">{t('fast_sale.price_min')} €</Label>
          <Input type="number" value={form.price_min} onChange={e => update('price_min', e.target.value)} placeholder="0" className="bg-[#1b1b22] border-[#292a32] text-white text-sm h-9" />
        </div>
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3">
          <Label className="text-slate-400 mb-1 block text-xs">{t('fast_sale.price_max')} €</Label>
          <Input type="number" value={form.price_max} onChange={e => update('price_max', e.target.value)} placeholder="∞" className="bg-[#1b1b22] border-[#292a32] text-white text-sm h-9" />
        </div>
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3">
          <Label className="text-slate-400 mb-1 block text-xs">{t('fast_sale.mileage_max')} km</Label>
          <Input type="number" value={form.mileage_max} onChange={e => update('mileage_max', e.target.value)} placeholder="∞" className="bg-[#1b1b22] border-[#292a32] text-white text-sm h-9" />
        </div>
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3">
          <Label className="text-slate-400 mb-1 block text-xs">{t('fast_sale.year_min')}</Label>
          <Input type="number" value={form.year_min} onChange={e => update('year_min', e.target.value)} placeholder="2000" className="bg-[#1b1b22] border-[#292a32] text-white text-sm h-9" />
        </div>
        <div className="bg-[#101014] border border-[#292a32] rounded-xl p-3">
          <Label className="text-slate-400 mb-1 block text-xs">{t('fast_sale.year_max')}</Label>
          <Input type="number" value={form.year_max} onChange={e => update('year_max', e.target.value)} placeholder="2025" className="bg-[#1b1b22] border-[#292a32] text-white text-sm h-9" />
        </div>
      </div>

      {/* Countries */}
      <div className="bg-[#101014] border border-[#292a32] rounded-xl p-4">
        <Label className="text-slate-400 mb-2 block">{t('fast_sale.countries')}</Label>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map(c => (
            <button key={c} onClick={() => toggleArray('countries', c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                (form.countries || []).includes(c)
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#1b1b22] text-slate-400 border-[#292a32] hover:border-slate-600'
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="gap-2 bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {t('fast_sale.save_criteria')}
      </Button>
    </div>
  );
}