import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Save, X, Plus, Upload } from 'lucide-react';
import LicensePlateInput from '@/components/cars/LicensePlateInput';
import ParseSpecsButton from '@/components/admin/ParseSpecsButton';
import { toast } from 'sonner';

const FUEL_TYPES = [
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'electric', label: 'Электро' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'plugin_hybrid', label: 'Plug-in гибрид' },
  { value: 'gas', label: 'Газ' },
  { value: 'petrol_cng', label: 'Бензин + CNG' },
  { value: 'petrol_lng', label: 'Бензин + LNG' },
  { value: 'diesel_cng', label: 'Дизель + CNG' },
  { value: 'diesel_lng', label: 'Дизель + LNG' },
  { value: 'lpg', label: 'LPG (сжиженный газ)' },
  { value: 'cng', label: 'CNG (сжатый газ)' },
  { value: 'lng', label: 'LNG (сжиженный природный газ)' },
  { value: 'hydrogen', label: 'Водород' },
  { value: 'ethanol', label: 'Этанол' },
];

const TRANSMISSIONS = [
  { value: 'manual', label: 'Механика' },
  { value: 'automatic', label: 'Автомат' },
];

const BODY_TYPES = [
  { value: 'sedan', label: 'Седан' },
  { value: 'hatchback', label: 'Хэтчбек' },
  { value: 'suv', label: 'Внедорожник' },
  { value: 'crossover', label: 'Кроссовер' },
  { value: 'wagon', label: 'Универсал' },
  { value: 'coupe', label: 'Купе' },
  { value: 'convertible', label: 'Кабриолет' },
  { value: 'minivan', label: 'Минивэн' },
  { value: 'pickup', label: 'Пикап' },
];

const DRIVE_TYPES = [
  { value: 'fwd', label: 'Передний' },
  { value: 'rwd', label: 'Задний' },
  { value: 'awd', label: 'Полный' },
];

const STATUSES = [
  { value: 'active', label: 'Активно' },
  { value: 'pending', label: 'На модерации' },
  { value: 'sold', label: 'Продано' },
  { value: 'rejected', label: 'Отклонено' },
];

const SELLER_TYPES = [
  { value: 'private', label: 'Частное лицо' },
  { value: 'dealer', label: 'Дилер' },
];

const COMMON_FEATURES = [
  'Кондиционер', 'Климат-контроль', 'Навигация', 'Bluetooth', 'USB',
  'Кожаный салон', 'Подогрев сидений', 'Камера заднего вида', 'Парктроник',
  'Круиз-контроль', 'Панорамная крыша', 'Xenon/LED фары', 'Сигнализация',
  'ABS', 'ESP', 'Airbags', 'Зимняя резина', 'Литые диски', 'Тонировка'
];

export default function CarEditModal({ car, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (car) {
      setForm({
        title: car.title || '',
        brand: car.brand || '',
        model: car.model || '',
        year: car.year || '',
        price: car.price || '',
        mileage: car.mileage || '',
        fuel_type: car.fuel_type || '',
        transmission: car.transmission || '',
        body_type: car.body_type || '',
        color: car.color || '',
        engine_volume: car.engine_volume || '',
        engine_power: car.engine_power || '',
        drive_type: car.drive_type || '',
        description: car.description || '',
        images: car.images || [],
        location: car.location || '',
        country: car.country || '',
        status: car.status || 'pending',
        is_premium: car.is_premium || false,
        seller_type: car.seller_type || '',
        vin: car.vin || '',
        license_plate: car.license_plate || '',
        features: car.features || [],
        technical_inspection_until: car.technical_inspection_until || '',
        engine_volume_cc: car.engine_volume_cc || '',
        length_mm: car.length_mm || '',
        width_mm: car.width_mm || '',
        height_mm: car.height_mm || '',
        wheelbase_mm: car.wheelbase_mm || '',
        clearance_mm: car.clearance_mm || '',
        weight_empty_kg: car.weight_empty_kg || '',
        weight_max_kg: car.weight_max_kg || '',
        max_speed_kmh: car.max_speed_kmh || '',
        co2_emissions: car.co2_emissions || '',
        fuel_consumption_city: car.fuel_consumption_city || '',
        fuel_consumption_highway: car.fuel_consumption_highway || '',
        fuel_consumption_combined: car.fuel_consumption_combined || '',
        energy_consumption: car.energy_consumption || '',
        transmission_type: car.transmission_type || '',
        trim_level: car.trim_level || '',
        doors: car.doors || '',
        power_to_weight: car.power_to_weight || '',
        fuel_tank_volume: car.fuel_tank_volume || '',
        trunk_volume: car.trunk_volume || '',
        acceleration_0_100: car.acceleration_0_100 || '',
        seats: car.seats || '',
        cylinders: car.cylinders || '',
      });
    }
  }, [car]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleFeature = (feature) => {
    set('features', form.features.includes(feature)
      ? form.features.filter(f => f !== feature)
      : [...form.features, feature]
    );
  };

  const addCustomFeature = () => {
    if (!newFeature.trim()) return;
    if (!form.features.includes(newFeature.trim())) {
      set('features', [...form.features, newFeature.trim()]);
    }
    setNewFeature('');
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    set('images', [...form.images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const removeImage = (idx) => set('images', form.images.filter((_, i) => i !== idx));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    const uploaded = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push(file_url);
    }
    setForm(prev => ({ ...prev, images: [...(prev.images || []), ...uploaded] }));
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    setIsSaving(true);
    const data = { ...form };
    // Convert numeric fields, remove empty strings
    ['year', 'price', 'mileage', 'engine_volume', 'engine_power',
     'engine_volume_cc', 'length_mm', 'width_mm', 'height_mm', 'wheelbase_mm',
     'clearance_mm', 'weight_empty_kg', 'weight_max_kg', 'max_speed_kmh',
     'co2_emissions', 'fuel_consumption_city', 'fuel_consumption_highway', 'fuel_consumption_combined',
     'energy_consumption',
     'doors', 'power_to_weight', 'fuel_tank_volume', 'trunk_volume', 'acceleration_0_100',
     'seats', 'cylinders'
     ].forEach(f => {
      if (data[f] === '' || data[f] === null || data[f] === undefined) {
        delete data[f];
      } else {
        data[f] = Number(data[f]);
      }
    });
    await entities.Car.update(car.id, data);
    setIsSaving(false);
    toast.success('Объявление сохранено');
    onSaved?.();
    onOpenChange(false);
  };

  if (!car) return null;

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать: {car.brand} {car.model} {car.year}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basic Info */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Основная информация</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Заголовок объявления">
                <Input value={form.title} onChange={e => set('title', e.target.value)} />
              </Field>
              <Field label="Статус">
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Марка">
                <Input value={form.brand} onChange={e => set('brand', e.target.value)} />
              </Field>
              <Field label="Модель">
                <Input value={form.model} onChange={e => set('model', e.target.value)} />
              </Field>
              <Field label="Год">
                <Input type="number" value={form.year} onChange={e => set('year', e.target.value)} />
              </Field>
              <Field label="Цена (€)">
                <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} />
              </Field>
              <Field label="Пробег (км)">
                <Input type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} />
              </Field>
              <Field label="VIN">
                <Input value={form.vin} onChange={e => set('vin', e.target.value)} />
              </Field>
              <Field label="Номерной знак">
                <LicensePlateInput value={form.license_plate} onChange={v => set('license_plate', v)} />
              </Field>
              <Field label="Цвет">
                <Input value={form.color} onChange={e => set('color', e.target.value)} />
              </Field>
              <Field label="Тип продавца">
                <Select value={form.seller_type} onValueChange={v => set('seller_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{SELLER_TYPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Город/Регион">
                <Input value={form.location} onChange={e => set('location', e.target.value)} />
              </Field>
              <Field label="Страна">
                <Input value={form.country} onChange={e => set('country', e.target.value)} />
              </Field>
              <Field label="Техосмотр до">
                <Input type="date" value={form.technical_inspection_until} onChange={e => set('technical_inspection_until', e.target.value)} />
              </Field>
              <Field label="Премиум размещение">
                <div className="flex items-center gap-3 h-10">
                  <button
                    type="button"
                    onClick={() => set('is_premium', !form.is_premium)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_premium ? 'bg-amber-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${form.is_premium ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-slate-600">{form.is_premium ? 'Да' : 'Нет'}</span>
                </div>
              </Field>

            </div>
          </section>

          {/* Technical */}
          <section>
            <div className="flex items-center justify-between mb-3 pb-1 border-b">
              <h3 className="text-sm font-semibold text-slate-700">Технические характеристики</h3>
              <ParseSpecsButton form={form} set={set} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Тип топлива">
                <Select value={form.fuel_type} onValueChange={v => set('fuel_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Коробка передач">
                <Select value={form.transmission} onValueChange={v => set('transmission', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{TRANSMISSIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Тип трансмиссии (AT8, DSG7...)">
                <Input value={form.transmission_type} onChange={e => set('transmission_type', e.target.value)} placeholder="Например: AT8" />
              </Field>
              <Field label="Название комплектации">
                <Input value={form.trim_level} onChange={e => set('trim_level', e.target.value)} placeholder="Например: Sport Line" />
              </Field>
              <Field label="Тип кузова">
                <Select value={form.body_type} onValueChange={v => set('body_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{BODY_TYPES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Привод">
                <Select value={form.drive_type} onValueChange={v => set('drive_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>{DRIVE_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Объём двигателя (л)">
                <Input type="number" step="0.1" value={form.engine_volume} onChange={e => set('engine_volume', e.target.value)} />
              </Field>
              <Field label="Мощность (л.с.)">
                <Input type="number" value={form.engine_power} onChange={e => set('engine_power', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Extra specs */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Дополнительные данные</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['engine_volume_cc', 'Объём двигателя (см³)', '1', '1998'],
                ['length_mm', 'Длина (мм)', '1', '4720'],
                ['width_mm', 'Ширина (мм)', '1', '1850'],
                ['height_mm', 'Высота (мм)', '1', '1440'],
                ['wheelbase_mm', 'Колёсная база (мм)', '1', '2850'],
                ['clearance_mm', 'Клиренс (мм)', '1', '155'],
                ['weight_empty_kg', 'Масса снаряж. (кг)', '1', '1450'],
                ['weight_max_kg', 'Масса макс. (кг)', '1', '1950'],
                ['max_speed_kmh', 'Макс. скорость (км/ч)', '1', '240'],
                ['co2_emissions', 'Выбросы CO₂ (г/км)', '1', '135'],
                ['fuel_consumption_city', 'Расход: город (л/100км)', '0.1', '9.5'],
                ['fuel_consumption_highway', 'Расход: трасса (л/100км)', '0.1', '6.2'],
                ['fuel_consumption_combined', 'Расход: комбо (л/100км)', '0.1', '7.4'],
                // Only for electric cars
                ...(form.fuel_type === 'electric' ? [['energy_consumption', 'Расход электро (кВт·ч/100км)', '0.1', '18.5']] : []),
                ['doors', 'Число дверей', '1', '4'],
                ['power_to_weight', 'Удельная масса (кг/л.с.)', '0.1', '8.5'],
                ['fuel_tank_volume', 'Объём топливного бака (л)', '1', '60'],
                ['trunk_volume', 'Объём багажника (л)', '1', '470'],
                ['acceleration_0_100', 'Разгон 0-100 км/ч (с)', '0.1', '7.2'],
                ['seats', 'Количество мест', '1', '5'],
                ['cylinders', 'Цилиндры', '1', '4'],
              ].map(([field, label, step, ph]) => (
                <Field key={field} label={label}>
                  <Input type="number" step={step} placeholder={ph} value={form[field]} onChange={e => set(field, e.target.value)} />
                </Field>
              ))}
            </div>
          </section>

          {/* Description */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Описание</h3>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Описание автомобиля..." />
          </section>

          {/* Features */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Комплектация и опции</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_FEATURES.map(f => (
                <button key={f} type="button" onClick={() => toggleFeature(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.features?.includes(f) ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'}`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Добавить опцию..." value={newFeature} onChange={e => setNewFeature(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomFeature()} className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={addCustomFeature}><Plus className="w-4 h-4" /></Button>
            </div>
            {form.features?.filter(f => !COMMON_FEATURES.includes(f)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.features.filter(f => !COMMON_FEATURES.includes(f)).map(f => (
                  <Badge key={f} variant="secondary" className="gap-1 text-xs">
                    {f}
                    <button onClick={() => set('features', form.features.filter(ff => ff !== f))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Images */}
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-1 border-b">Фотографии (URL)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {form.images?.map((img, idx) => (
                <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="URL изображения..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addImageUrl()} className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl}><Plus className="w-4 h-4" /></Button>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} disabled={uploadingImage} />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </span>
                </Button>
              </label>
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white pb-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}