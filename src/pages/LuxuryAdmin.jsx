import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Eye, EyeOff, Upload, Loader2, Type } from 'lucide-react';

const emptyCarForm = {
  brand: '', model: '', subtitle: '', condition: 'Brand new',
  price: '', year: '', engine_volume: '', engine_power: '',
  fuel_type: 'petrol', transmission: 'automatic', drive_type: 'awd',
  mileage: '', color: '', image: '', logo: '', link_url: '', badge: '', rating: '', description: '',
  features: '', is_published: false, logo_width: 48
};

const emptyBrandForm = {
  name: '', logo: '', image: '', badge: '', subtitle: '', sort_order: 0, is_published: false, show_name: true, logo_width: 48, logo_fit: 'contain'
};

const fuelOptions = [
  { value: 'petrol', label: 'Бензин' }, { value: 'diesel', label: 'Дизель' },
  { value: 'electric', label: 'Электро' }, { value: 'hybrid', label: 'Гибрид' },
  { value: 'plugin_hybrid', label: 'Плаг-ин' }, { value: 'gas', label: 'Газ' }
];

export default function LuxuryAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('brands'); // 'brands' | 'cars'

  // Brand state
  const [brandForm, setBrandForm] = useState(emptyBrandForm);
  const [editBrandId, setEditBrandId] = useState(null);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [uploadingBrand, setUploadingBrand] = useState(false);
  const [uploadingBrandLogo, setUploadingBrandLogo] = useState(false);
  const brandFileRef = useRef(null);
  const brandLogoRef = useRef(null);

  // Car state
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [editCarId, setEditCarId] = useState(null);
  const [showCarForm, setShowCarForm] = useState(false);
  const [uploadingCar, setUploadingCar] = useState(false);
  const [uploadingCarLogo, setUploadingCarLogo] = useState(false);
  const carFileRef = useRef(null);
  const carLogoRef = useRef(null);

  // Queries
  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['luxuryBrandsAdmin'],
    queryFn: () => base44.entities.LuxuryBrand.list('sort_order')
  });

  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['luxuryCars'],
    queryFn: () => base44.entities.LuxuryCar.list('-created_date')
  });

  // Brand mutations
  const saveBrand = useMutation({
    mutationFn: (data) => editBrandId
      ? base44.entities.LuxuryBrand.update(editBrandId, data)
      : base44.entities.LuxuryBrand.create(data),
    onSuccess: () => { qc.invalidateQueries(['luxuryBrandsAdmin']); qc.invalidateQueries(['luxuryBrandsPublished']); setBrandForm(emptyBrandForm); setEditBrandId(null); setShowBrandForm(false); }
  });

  const removeBrand = useMutation({
    mutationFn: (id) => base44.entities.LuxuryBrand.delete(id),
    onSuccess: () => { qc.invalidateQueries(['luxuryBrandsAdmin']); qc.invalidateQueries(['luxuryBrandsPublished']); }
  });

  const toggleBrand = useMutation({
    mutationFn: ({ id, val, show_name }) => {
      const update = { is_published: val };
      if (show_name !== undefined) update.show_name = show_name;
      return base44.entities.LuxuryBrand.update(id, update);
    },
    onSuccess: () => { qc.invalidateQueries(['luxuryBrandsAdmin']); qc.invalidateQueries(['luxuryBrandsPublished']); }
  });

  // Car mutations
  const saveCar = useMutation({
    mutationFn: (data) => editCarId
      ? base44.entities.LuxuryCar.update(editCarId, data)
      : base44.entities.LuxuryCar.create(data),
    onSuccess: () => { qc.invalidateQueries(['luxuryCars']); setCarForm(emptyCarForm); setEditCarId(null); setShowCarForm(false); }
  });

  const removeCar = useMutation({
    mutationFn: (id) => base44.entities.LuxuryCar.delete(id),
    onSuccess: () => qc.invalidateQueries(['luxuryCars'])
  });

  const toggleCar = useMutation({
    mutationFn: ({ id, val }) => base44.entities.LuxuryCar.update(id, { is_published: val }),
    onSuccess: () => qc.invalidateQueries(['luxuryCars'])
  });

  // Handlers
  const fb = (key, val) => setBrandForm(p => ({ ...p, [key]: val }));
  const fc = (key, val) => setCarForm(p => ({ ...p, [key]: val }));

  const handleBrandFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBrand(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    fb('image', file_url);
    setUploadingBrand(false);
  };

  const handleBrandLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBrandLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    fb('logo', file_url);
    setUploadingBrandLogo(false);
  };

  const handleCarFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    fc('image', file_url);
    setUploadingCar(false);
  };

  const handleCarLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCarLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    fc('logo', file_url);
    setUploadingCarLogo(false);
  };

  const handleEditBrand = (brand) => {
    setBrandForm({ ...emptyBrandForm, ...brand, logo_width: Number(brand.logo_width) || 48, logo_fit: brand.logo_fit || 'contain', sort_order: brand.sort_order ?? 0 });
    setEditBrandId(brand.id);
    setShowBrandForm(true);
  };

  const handleEditCar = (car) => {
    setCarForm({ ...emptyCarForm, ...car, features: (car.features || []).join(', '), logo_width: Number(car.logo_width) || 48 });
    setEditCarId(car.id);
    setShowCarForm(true);
  };

  const handleSubmitBrand = (e) => {
    e.preventDefault();
    saveBrand.mutate({ ...brandForm, sort_order: Number(brandForm.sort_order) || 0, logo_width: Number(brandForm.logo_width) || 48, logo_fit: brandForm.logo_fit || 'contain' });
  };

  const handleSubmitCar = (e) => {
    e.preventDefault();
    const data = {
      ...carForm,
      price: Number(carForm.price),
      year: carForm.year ? Number(carForm.year) : undefined,
      engine_volume: carForm.engine_volume ? Number(carForm.engine_volume) : undefined,
      engine_power: carForm.engine_power ? Number(carForm.engine_power) : undefined,
      mileage: carForm.mileage ? Number(carForm.mileage) : undefined,
      rating: carForm.rating ? Number(carForm.rating) : undefined,
      logo_width: Number(carForm.logo_width) || 48,
      features: carForm.features ? carForm.features.split(',').map(f => f.trim()).filter(Boolean) : []
    };
    saveCar.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">✦ Люкс сегмент</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('brands')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'brands' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Марки
          </button>
          <button
            onClick={() => setTab('cars')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'cars' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Автомобили
          </button>
        </div>

        {/* ===== BRANDS TAB ===== */}
        {tab === 'brands' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">Марки отображаются на главной странице в виде плиток</p>
              <Button onClick={() => { setBrandForm(emptyBrandForm); setEditBrandId(null); setShowBrandForm(true); }} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4" /> Добавить марку
              </Button>
            </div>

            {showBrandForm && (
              <form onSubmit={handleSubmitBrand} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 space-y-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">{editBrandId ? 'Редактировать марку' : 'Новая марка'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input placeholder="Название марки *" value={brandForm.name} onChange={e => fb('name', e.target.value)} required />
                  <Input placeholder="Подзаголовок" value={brandForm.subtitle} onChange={e => fb('subtitle', e.target.value)} />
                  <Input placeholder="Бейдж (напр. Новинки)" value={brandForm.badge} onChange={e => fb('badge', e.target.value)} />
                  <Input placeholder="Порядок сортировки (0, 1, 2...)" type="number" value={brandForm.sort_order} onChange={e => fb('sort_order', Number(e.target.value))} />
                </div>
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                      <label className="text-sm font-medium text-slate-900 dark:text-white min-w-fit">Ширина логотипа:</label>
                      <input
                        type="range"
                        min="30"
                        max="80"
                        step="2"
                        value={brandForm.logo_width || 48}
                        onChange={(e) => fb('logo_width', Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-fit">{brandForm.logo_width || 48}px</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="URL логотипа" value={brandForm.logo} onChange={e => fb('logo', e.target.value)} className="flex-1" />
                    <input ref={brandLogoRef} type="file" accept="image/*" className="hidden" onChange={handleBrandLogoUpload} />
                    <Button type="button" variant="outline" onClick={() => brandLogoRef.current?.click()} disabled={uploadingBrandLogo} className="flex-shrink-0 gap-2">
                      {uploadingBrandLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingBrandLogo ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                  {brandForm.logo && (
                    <img src={brandForm.logo} alt="logo preview" className="h-12 object-contain bg-slate-100 dark:bg-slate-700 rounded-xl p-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="URL изображения (авто или фон)" value={brandForm.image} onChange={e => fb('image', e.target.value)} className="flex-1" />
                    <input ref={brandFileRef} type="file" accept="image/*" className="hidden" onChange={handleBrandFileUpload} />
                    <Button type="button" variant="outline" onClick={() => brandFileRef.current?.click()} disabled={uploadingBrand} className="flex-shrink-0 gap-2">
                      {uploadingBrand ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingBrand ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                  {brandForm.image && (
                    <img src={brandForm.image} alt="preview" className="h-24 object-contain bg-slate-100 dark:bg-slate-700 rounded-xl p-2" />
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={brandForm.is_published} onChange={e => fb('is_published', e.target.checked)} className="w-4 h-4" />
                    Опубликовать
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={brandForm.show_name !== false} onChange={e => fb('show_name', e.target.checked)} className="w-4 h-4" />
                    Показывать название
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={brandForm.logo_fit === 'cover'} onChange={e => fb('logo_fit', e.target.checked ? 'cover' : 'contain')} className="w-4 h-4" />
                    Обрезать логотип (cover)
                  </label>
                  <div className="flex-1" />
                  <Button type="button" variant="outline" onClick={() => setShowBrandForm(false)}>Отмена</Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={saveBrand.isPending}>
                    {saveBrand.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </form>
            )}

            {brandsLoading ? (
              <div className="text-center py-12 text-slate-400">Загрузка...</div>
            ) : (
              <div className="space-y-3">
                {brands.map(brand => (
                  <div key={brand.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {brand.logo ? (
                        <img src={brand.logo} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                         <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                       )}
                       <span className="text-xs text-slate-400 px-1">({brand.logo_width}px)</span>
                      {brand.image ? (
                        <img src={brand.image} alt="" className="w-20 h-14 object-contain bg-slate-100 dark:bg-slate-700 rounded-xl p-1" />
                      ) : (
                        <div className="w-20 h-14 bg-slate-100 dark:bg-slate-700 rounded-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white">{brand.name}</div>
                      {brand.subtitle && <div className="text-sm text-slate-400">{brand.subtitle}</div>}
                      <div className="text-xs text-slate-400 mt-0.5">→ /LuxuryBrand?brand={brand.name}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button
                        onClick={() => toggleBrand.mutate({ id: brand.id, val: !brand.is_published })}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${brand.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {brand.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {brand.is_published ? 'Опубл.' : 'Скрыт'}
                      </button>
                      <button
                        title="Показывать/скрыть название"
                        onClick={() => toggleBrand.mutate({ id: brand.id, val: brand.is_published, show_name: brand.show_name === false ? true : false })}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${brand.show_name !== false ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        <Type className="w-3.5 h-3.5" />
                        {brand.show_name !== false ? 'Назв.' : 'Без назв.'}
                      </button>
                      <button onClick={() => handleEditBrand(brand)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeBrand.mutate(brand.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {brands.length === 0 && (
                  <div className="text-center py-12 text-slate-400">Нет марок. Добавьте первую!</div>
                )}
              </div>
            )}
          </>
        )}

        {/* ===== CARS TAB ===== */}
        {tab === 'cars' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">Автомобили отображаются на страницах брендов</p>
              <Button onClick={() => { setCarForm(emptyCarForm); setEditCarId(null); setShowCarForm(true); }} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4" /> Добавить авто
              </Button>
            </div>

            {showCarForm && (
              <form onSubmit={handleSubmitCar} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 space-y-4">
                <h2 className="font-semibold text-slate-900 dark:text-white">{editCarId ? 'Редактировать' : 'Новый автомобиль'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Input placeholder="Марка *" value={carForm.brand} onChange={e => fc('brand', e.target.value)} required />
                  <Input placeholder="Модель *" value={carForm.model} onChange={e => fc('model', e.target.value)} required />
                  <Input placeholder="Подзаголовок" value={carForm.subtitle} onChange={e => fc('subtitle', e.target.value)} />
                  <Input placeholder="Состояние" value={carForm.condition} onChange={e => fc('condition', e.target.value)} />
                  <Input placeholder="Цена (EUR) *" type="number" value={carForm.price} onChange={e => fc('price', e.target.value)} required />
                  <Input placeholder="Год" type="number" value={carForm.year} onChange={e => fc('year', e.target.value)} />
                  <Input placeholder="Объём (л)" type="number" step="0.1" value={carForm.engine_volume} onChange={e => fc('engine_volume', e.target.value)} />
                  <Input placeholder="Мощность (л.с.)" type="number" value={carForm.engine_power} onChange={e => fc('engine_power', e.target.value)} />
                  <select value={carForm.fuel_type} onChange={e => fc('fuel_type', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {fuelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <select value={carForm.transmission} onChange={e => fc('transmission', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="automatic">Автомат</option>
                    <option value="manual">Механика</option>
                  </select>
                  <select value={carForm.drive_type} onChange={e => fc('drive_type', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                    <option value="fwd">Передний</option>
                    <option value="rwd">Задний</option>
                    <option value="awd">Полный</option>
                  </select>
                  <Input placeholder="Пробег (км)" type="number" value={carForm.mileage} onChange={e => fc('mileage', e.target.value)} />
                  <Input placeholder="Цвет" value={carForm.color} onChange={e => fc('color', e.target.value)} />
                  <Input placeholder="Рейтинг (1-10)" type="number" step="0.1" max="10" value={carForm.rating} onChange={e => fc('rating', e.target.value)} />
                  <Input placeholder="Бейдж (напр. Новый)" value={carForm.badge} onChange={e => fc('badge', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="URL PNG-изображения" value={carForm.image} onChange={e => fc('image', e.target.value)} className="flex-1" />
                    <input ref={carFileRef} type="file" accept="image/*" className="hidden" onChange={handleCarFileUpload} />
                    <Button type="button" variant="outline" onClick={() => carFileRef.current?.click()} disabled={uploadingCar} className="flex-shrink-0 gap-2">
                      {uploadingCar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingCar ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                  {carForm.image && (
                    <img src={carForm.image} alt="preview" className="h-24 object-contain bg-slate-100 dark:bg-slate-700 rounded-xl p-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="URL логотипа бренда" value={carForm.logo} onChange={e => fc('logo', e.target.value)} className="flex-1" />
                    <input ref={carLogoRef} type="file" accept="image/*" className="hidden" onChange={handleCarLogoUpload} />
                    <Button type="button" variant="outline" onClick={() => carLogoRef.current?.click()} disabled={uploadingCarLogo} className="flex-shrink-0 gap-2">
                      {uploadingCarLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingCarLogo ? 'Загрузка...' : 'Загрузить'}
                    </Button>
                  </div>
                  {carForm.logo && (
                    <img src={carForm.logo} alt="logo preview" className="h-12 object-contain bg-slate-100 dark:bg-slate-700 rounded-xl p-2" />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className="text-sm font-medium text-slate-900 dark:text-white min-w-fit">Ширина логотипа:</label>
                  <input
                    type="range"
                    min="24"
                    max="100"
                    step="2"
                    value={carForm.logo_width || 48}
                    onChange={(e) => fc('logo_width', Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-fit">{carForm.logo_width || 48}px</span>
                  {carForm.logo && (
                    <div className="flex items-center bg-slate-800 rounded-lg px-3 py-1.5">
                      <img src={carForm.logo} alt="preview" style={{ width: `${carForm.logo_width || 48}px`, height: '32px', filter: 'brightness(0) invert(1)' }} className="object-contain" />
                    </div>
                  )}
                </div>
                <Input placeholder="Опции через запятую" value={carForm.features} onChange={e => fc('features', e.target.value)} />
                <textarea
                  placeholder="Описание"
                  value={carForm.description}
                  onChange={e => fc('description', e.target.value)}
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={carForm.is_published} onChange={e => fc('is_published', e.target.checked)} className="w-4 h-4" />
                    Опубликовать
                  </label>
                  <div className="flex-1" />
                  <Button type="button" variant="outline" onClick={() => setShowCarForm(false)}>Отмена</Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600" disabled={saveCar.isPending}>
                    {saveCar.isPending ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </form>
            )}

            {carsLoading ? (
              <div className="text-center py-12 text-slate-400">Загрузка...</div>
            ) : (
              <div className="space-y-3">
                {cars.map(car => (
                  <div key={car.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
                    {car.image ? (
                      <img src={car.image} alt="" className="w-20 h-14 object-contain bg-slate-100 dark:bg-slate-700 rounded-xl p-1 flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-14 bg-slate-100 dark:bg-slate-700 rounded-xl flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white">{car.brand} {car.model}</div>
                      <div className="text-sm text-slate-400">{car.subtitle} · {new Intl.NumberFormat('ru-RU').format(car.price)} €</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCar.mutate({ id: car.id, val: !car.is_published })}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${car.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {car.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        {car.is_published ? 'Опубл.' : 'Скрыт'}
                      </button>
                      <button onClick={() => handleEditCar(car)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeCar.mutate(car.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {cars.length === 0 && (
                  <div className="text-center py-12 text-slate-400">Нет автомобилей. Добавьте первый!</div>
                )}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}