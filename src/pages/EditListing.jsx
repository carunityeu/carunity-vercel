import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Upload,
  X,
  Save,
  Loader2,
  Trash2
} from 'lucide-react';
import LicensePlateInput from '@/components/cars/LicensePlateInput';
import DescriptionTranslator from '@/components/listings/DescriptionTranslator';
import FeaturesEditor from '@/components/listings/FeaturesEditor';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const carBrands = [
  'Abarth', 'Acura', 'Aiways', 'Alfa Romeo', 'Alpine', 'Arcfox', 'Ariel',
  'Aston Martin', 'Audi', 'BAIC', 'Baojun', 'Bentley', 'BMW', 'Brilliance',
  'Bugatti', 'Buick', 'BYD', 'BYTON', 'Cadillac', 'Changan', 'Chery',
  'Chevrolet', 'Chrysler', 'Citroën', 'Cupra', 'Daihatsu', 'Datsun',
  'DeLorean', 'Dodge', 'Dongfeng', 'DS', 'Exeed', 'FAW', 'Ferrari', 'Fiat',
  'Fisker', 'Ford', 'Foton', 'GAC', 'Geely', 'Genesis', 'GMC', 'Great Wall',
  'Haval', 'Honda', 'Hongqi', 'Hummer', 'Hyundai', 'Ineos', 'Infiniti',
  'Isuzu', 'JAC', 'Jaguar', 'Jeep', 'Kia', 'Koenigsegg', 'Lada',
  'Lamborghini', 'Lancia', 'Land Rover', 'Leapmotor', 'Lexus', 'Li Auto',
  'Lifan', 'Lincoln', 'Lotus', 'Lucid', 'Mahindra', 'Maserati', 'Maybach',
  'Mazda', 'McLaren', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'NIO',
  'Nissan', 'Oldsmobile', 'Opel', 'Pagani', 'Peugeot', 'Perodua', 'Polestar',
  'Pontiac', 'Porsche', 'Proton', 'Ram', 'Renault', 'Rivian', 'Rolls-Royce',
  'Saab', 'Scion', 'Seat', 'Skoda', 'Skywell', 'Smart', 'SsangYong',
  'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Toyota', 'Vauxhall', 'VinFast',
  'Volkswagen', 'Volvo', 'Wey', 'XPeng', 'ZEEKR'
];

const fuelTypes = [
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'electric', label: 'Электро' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'plugin_hybrid', label: 'Plug-in гибрид' },
  { value: 'gas', label: 'Газ' }
];

const bodyTypes = [
  { value: 'sedan', label: 'Седан' },
  { value: 'hatchback', label: 'Хэтчбек' },
  { value: 'suv', label: 'Внедорожник' },
  { value: 'crossover', label: 'Кроссовер' },
  { value: 'wagon', label: 'Универсал' },
  { value: 'coupe', label: 'Купе' },
  { value: 'convertible', label: 'Кабриолет' },
  { value: 'minivan', label: 'Минивэн' },
  { value: 'pickup', label: 'Пикап' }
];

const transmissionTypes = [
  { value: 'manual', label: 'Механика' },
  { value: 'automatic', label: 'Автомат' }
];

const driveTypes = [
  { value: 'fwd', label: 'Передний' },
  { value: 'rwd', label: 'Задний' },
  { value: 'awd', label: 'Полный' }
];

const colors = ['Белый', 'Чёрный', 'Серый', 'Серебристый', 'Синий', 'Красный', 'Зелёный', 'Коричневый', 'Бежевый'];
const countries = ['Латвия', 'Литва', 'Эстония'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

export default function EditListing() {
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(null);
  const [descTranslations, setDescTranslations] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await auth.isAuthenticated();
      if (!isAuth) {
        auth.redirectToLogin();
        return;
      }
      const userData = await auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: async () => {
      const cars = await entities.Car.filter({ id: carId });
      return cars[0] || null;
    },
    enabled: !!carId
  });

  useEffect(() => {
    if (car && !form) {
      setForm({
        brand: car.brand || '',
        model: car.model || '',
        year: car.year?.toString() || '',
        price: car.price?.toString() || '',
        mileage: car.mileage?.toString() || '',
        fuel_type: car.fuel_type || '',
        transmission: car.transmission || '',
        body_type: car.body_type || '',
        drive_type: car.drive_type || '',
        color: car.color || '',
        engine_volume: car.engine_volume?.toString() || '',
        engine_power: car.engine_power?.toString() || '',
        description: car.description || '',
        images: car.images || [],
        location: car.location || '',
        country: car.country || '',
        status: car.status || 'active',
        license_plate: car.license_plate || '',
        engine_volume_cc: car.engine_volume_cc?.toString() || '',
        length_mm: car.length_mm?.toString() || '',
        width_mm: car.width_mm?.toString() || '',
        height_mm: car.height_mm?.toString() || '',
        wheelbase_mm: car.wheelbase_mm?.toString() || '',
        clearance_mm: car.clearance_mm?.toString() || '',
        weight_empty_kg: car.weight_empty_kg?.toString() || '',
        weight_max_kg: car.weight_max_kg?.toString() || '',
        max_speed_kmh: car.max_speed_kmh?.toString() || '',
        co2_emissions: car.co2_emissions?.toString() || '',
        fuel_consumption_city: car.fuel_consumption_city?.toString() || '',
        fuel_consumption_highway: car.fuel_consumption_highway?.toString() || '',
        fuel_consumption_combined: car.fuel_consumption_combined?.toString() || '',
        energy_consumption: car.energy_consumption?.toString() || '',
        features: car.features || []
      });
    }
  }, [car, form]);

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    
    for (const file of files) {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result.file_url) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, result.file_url]
        }));
      }
    }
    
    setIsUploading(false);
  };

  const removeImage = (index) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.year || !form.price) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);

    await entities.Car.update(carId, {
      title: `${form.brand} ${form.model} ${form.year}`,
      brand: form.brand,
      model: form.model,
      year: parseInt(form.year),
      price: parseInt(form.price),
      mileage: parseInt(form.mileage) || 0,
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      body_type: form.body_type,
      drive_type: form.drive_type,
      color: form.color,
      engine_volume: form.engine_volume ? parseFloat(form.engine_volume) : null,
      engine_power: form.engine_power ? parseInt(form.engine_power) : null,
      description: form.description,
      ...(Object.keys(descTranslations).length > 0 ? {
        description_en: descTranslations.en || undefined,
        description_ru: descTranslations.ru || undefined,
        description_et: descTranslations.et || undefined,
        description_lv: descTranslations.lv || undefined,
        description_lt: descTranslations.lt || undefined,
        description_de: descTranslations.de || undefined,
        description_fi: descTranslations.fi || undefined,
        description_pl: descTranslations.pl || undefined,
      } : {}),
      images: form.images,
      location: form.location,
      country: form.country,
      status: form.status,
      license_plate: form.license_plate || null,
      engine_volume_cc: form.engine_volume_cc ? parseInt(form.engine_volume_cc) : null,
      length_mm: form.length_mm ? parseInt(form.length_mm) : null,
      width_mm: form.width_mm ? parseInt(form.width_mm) : null,
      height_mm: form.height_mm ? parseInt(form.height_mm) : null,
      wheelbase_mm: form.wheelbase_mm ? parseInt(form.wheelbase_mm) : null,
      clearance_mm: form.clearance_mm ? parseInt(form.clearance_mm) : null,
      weight_empty_kg: form.weight_empty_kg ? parseInt(form.weight_empty_kg) : null,
      weight_max_kg: form.weight_max_kg ? parseInt(form.weight_max_kg) : null,
      max_speed_kmh: form.max_speed_kmh ? parseInt(form.max_speed_kmh) : null,
      co2_emissions: form.co2_emissions ? parseInt(form.co2_emissions) : null,
      fuel_consumption_city: form.fuel_consumption_city ? parseFloat(form.fuel_consumption_city) : null,
      fuel_consumption_highway: form.fuel_consumption_highway ? parseFloat(form.fuel_consumption_highway) : null,
      fuel_consumption_combined: form.fuel_consumption_combined ? parseFloat(form.fuel_consumption_combined) : null,
      // kWh/100km — kept only for electric cars
      energy_consumption: form.fuel_type === 'electric' && form.energy_consumption ? parseFloat(form.energy_consumption) : null,
      features: form.features || []
    });

    toast.success('Объявление обновлено!');
    window.location.href = createPageUrl('Dashboard') + '?tab=listings';
  };

  if (isLoading || !form) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Объявление не найдено</h1>
          <Link to={createPageUrl('Dashboard')}>
            <Button>Вернуться в кабинет</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link 
          to={createPageUrl('Dashboard') + '?tab=listings'}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к объявлениям
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Редактировать объявление</h1>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Статус объявления</Label>
              <Select value={form.status} onValueChange={(v) => updateForm('status', v)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активно</SelectItem>
                  <SelectItem value="sold">Продано</SelectItem>
                  <SelectItem value="pending">Приостановлено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Марка *</Label>
                <Select value={form.brand} onValueChange={(v) => updateForm('brand', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue placeholder="Выберите марку" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {carBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Модель *</Label>
                <Input 
                  value={form.model}
                  onChange={(e) => updateForm('model', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Год выпуска *</Label>
                <Select value={form.year} onValueChange={(v) => updateForm('year', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Цена (€) *</Label>
                <Input 
                  type="number"
                  value={form.price}
                  onChange={(e) => updateForm('price', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Technical */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Пробег (км)</Label>
                <Input 
                  type="number"
                  value={form.mileage}
                  onChange={(e) => updateForm('mileage', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Тип топлива</Label>
                <Select value={form.fuel_type} onValueChange={(v) => updateForm('fuel_type', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">КПП</Label>
                <Select value={form.transmission} onValueChange={(v) => updateForm('transmission', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transmissionTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Кузов</Label>
                <Select value={form.body_type} onValueChange={(v) => updateForm('body_type', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Привод</Label>
                <Select value={form.drive_type} onValueChange={(v) => updateForm('drive_type', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {driveTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Цвет</Label>
                <Select value={form.color} onValueChange={(v) => updateForm('color', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Страна</Label>
                <Select value={form.country} onValueChange={(v) => updateForm('country', v)}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 dark:text-slate-300">Город</Label>
                <Input 
                  value={form.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <Label className="mb-3 block text-slate-700 dark:text-slate-300">Фотографии</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Добавить</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            {/* License Plate */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-2 block">Номерной знак</Label>
              <LicensePlateInput value={form.license_plate} onChange={v => updateForm('license_plate', v)} />
              <p className="text-xs text-slate-400 mt-1">Будет скрыт до подтверждения капчи</p>
            </div>

            {/* Extra specs */}
            <div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">Дополнительные данные</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ['engine_volume_cc', 'Объём (см³)', '1998'],
                  ['length_mm', 'Длина (мм)', '4720'],
                  ['width_mm', 'Ширина (мм)', '1850'],
                  ['height_mm', 'Высота (мм)', '1440'],
                  ['wheelbase_mm', 'Колёсная база (мм)', '2850'],
                  ['clearance_mm', 'Клиренс (мм)', '155'],
                  ['weight_empty_kg', 'Масса снаряж. (кг)', '1450'],
                  ['weight_max_kg', 'Масса макс. (кг)', '1950'],
                  ['max_speed_kmh', 'Макс. скорость (км/ч)', '240'],
                  ['co2_emissions', 'CO₂ (г/км)', '135'],
                  ['fuel_consumption_city', 'Город (л/100км)', '9.5'],
                  ['fuel_consumption_highway', 'Трасса (л/100км)', '6.2'],
                  ['fuel_consumption_combined', 'Комбо (л/100км)', '7.4'],
                  // Only for electric cars
                  ...(form.fuel_type === 'electric' ? [['energy_consumption', 'Расход электро (кВт·ч/100км)', '18.5']] : []),
                ].map(([field, label, placeholder]) => (
                  <div key={field}>
                    <Label className="text-slate-700 dark:text-slate-300">{label}</Label>
                    <Input
                      type="number"
                      step={field.startsWith('fuel') ? '0.1' : '1'}
                      value={form[field]}
                      onChange={e => updateForm(field, e.target.value)}
                      placeholder={placeholder}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Features / Equipment */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-3 block">Дополнительное оснащение</Label>
              <FeaturesEditor
                value={form.features || []}
                onChange={(features) => updateForm('features', features)}
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300">Описание</Label>
              <Textarea 
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={5}
                className="resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white mb-3"
              />
              <DescriptionTranslator
                description={form.description}
                onTranslationsDone={setDescTranslations}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Сохранить изменения
              </Button>
              <Link to={createPageUrl('Dashboard') + '?tab=listings'}>
                <Button variant="outline" className="dark:border-slate-700 dark:text-slate-300">Отмена</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}