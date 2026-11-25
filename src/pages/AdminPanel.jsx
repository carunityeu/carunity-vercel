import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatPrice } from '@/utils/format';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import ListPagination from '@/components/ui/ListPagination';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Car, Building2, Users, CheckCircle, XCircle, Edit2, Trash2,
  Eye, Loader2, Search, AlertTriangle, Clock, BookOpen, Plus, MessageSquare, Zap, Wrench, Gem,
  Menu, Bell, Mail, Star, MoreVertical, UserCog, DollarSign, ExternalLink, FileText
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import DealerPricingPolicyModal from '@/components/admin/DealerPricingPolicyModal';
import DealerInvoiceModal from '@/components/admin/DealerInvoiceModal';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { setViewAsDealer } from '@/lib/adminViewAs';
import CarEditModal from '@/components/admin/CarEditModal';
import AIMatchDashboard from '@/components/admin/AIMatchDashboard';
import CarModelEditModal from '@/components/admin/CarModelEditModal';
import ArticleManagement from '@/components/admin/ArticleManagement';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminActivityFeed from '@/components/admin/AdminActivityFeed';
import AdminAds from '@/components/admin/AdminAds';
import AdminMetaAds from '@/components/admin/AdminMetaAds';
import AdminImportRequests from '@/components/admin/AdminImportRequests';
import AdminUsers from '@/components/admin/AdminUsers';
import DealerApplicationsPanel from '@/components/admin/DealerApplicationsPanel';
import DealerApplicationReview from '@/components/admin/DealerApplicationReview';
import { useTranslation } from 'react-i18next';

export default function AdminPanel() {
  const { t } = useTranslation();
  const [reviewing, setReviewing] = useState(null);
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchCars, setSearchCars] = useState('');
  const [editingCar, setEditingCar] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [carsPage, setCarsPage] = useState(1);
  const [dealersPage, setDealersPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchMessages, setSearchMessages] = useState('');
  const [pricingDealer, setPricingDealer] = useState(null);
  const [invoiceDealer, setInvoiceDealer] = useState(null);
  const [searchDealers, setSearchDealers] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const isAuth = await auth.isAuthenticated();
      if (!isAuth) { auth.redirectToLogin(); return; }
      const userData = await auth.me();
      setUser(userData);
      if (userData.role === 'admin') setIsAdmin(true);
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const { data: allCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['adminCars'],
    queryFn: () => entities.Car.list('-created_date', 200),
    enabled: isAdmin
  });

  const { data: dealers = [], isLoading: loadingDealers } = useQuery({
    queryKey: ['adminDealers'],
    queryFn: () => entities.Dealer.list('-created_date', 100),
    enabled: isAdmin
  });

  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['dealerApplications'],
    queryFn: () => entities.DealerApplication.list('-created_date', 100),
    enabled: isAdmin
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => entities.Report.filter({ status: 'pending' }, '-created_date'),
    enabled: isAdmin
  });

  const { data: allMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['adminMessages'],
    queryFn: () => entities.Message.list('-created_date', 500),
    enabled: isAdmin
  });

  const { data: carModels = [], isLoading: loadingModels } = useQuery({
    queryKey: ['adminCarModels'],
    queryFn: () => entities.CarModelInfo.list('-created_date', 100),
    enabled: isAdmin
  });

  const { data: dealerLeads = [] } = useQuery({
    queryKey: ['adminDealerLeads'],
    queryFn: () => entities.DealerLead.list('-created_date', 200),
    enabled: isAdmin
  });

  const { data: saleFeedback = [] } = useQuery({
    queryKey: ['adminSaleFeedback'],
    queryFn: () => entities.SaleFeedback.list('-created_date', 500),
    enabled: isAdmin
  });

  const { data: appUsers = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => entities.User.list('-created_date', 500),
    enabled: isAdmin
  });

  const { data: viewHistory = [] } = useQuery({
    queryKey: ['adminViewHistory'],
    queryFn: () => entities.ViewHistory.list('-created_date', 500),
    enabled: isAdmin
  });

  const deleteMessage = useMutation({
    mutationFn: (id) => entities.Message.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminMessages']); toast.success('Сообщение удалено'); }
  });

  const deleteModel = useMutation({
    mutationFn: (id) => entities.CarModelInfo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminCarModels']);
      queryClient.invalidateQueries(['publishedCarModels']);
      toast.success('Обзор удалён');
    }
  });

  const updateCar = useMutation({
    mutationFn: ({ id, data }) => entities.Car.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminCars']); setEditingCar(null); toast.success('Объявление обновлено'); }
  });

  const deleteCar = useMutation({
    mutationFn: (id) => entities.Car.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['adminCars']); toast.success('Объявление удалено'); }
  });

  const updateDealer = useMutation({
    mutationFn: ({ id, data }) => entities.Dealer.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['adminDealers']); toast.success('Дилер обновлён'); }
  });

  const decideApplication = async (app, decision) => {
    if (reviewing) return;
    const notes = selectedApp?.id === app.id ? adminNotes.trim() : '';
    if (decision === 'rejected' && !notes) { toast.error(t('dealerApply.reason')); return; }
    setReviewing(app.id);
    try {
      await base44.functions.invoke('dealerApplication', { action: 'review', id: app.id, decision, notes });
      await Promise.all(['dealerApplications', 'dealerApplicationPages', 'adminDealers'].map(key => queryClient.invalidateQueries({ queryKey: [key] })));
      setSelectedApp(null); setAdminNotes('');
      toast.success(t('dealerApply.saved'));
    } catch (error) {
      const key = error.response?.data?.error;
      toast.error(t('dealerApply.' + (['reason','reviewed','forbidden'].includes(key) ? key : 'failed')));
    } finally { setReviewing(null); }
  };
  const approveApplication = app => decideApplication(app, 'approved');
  const rejectApplication = app => decideApplication(app, 'rejected');

  const filteredCars = allCars.filter(car => {
    if (!searchCars) return true;
    const q = searchCars.toLowerCase();
    return car.brand?.toLowerCase().includes(q) || car.model?.toLowerCase().includes(q) ||
      car.title?.toLowerCase().includes(q) || car.created_by?.toLowerCase().includes(q);
  });

  const filteredDealers = dealers.filter(dealer => {
    if (!searchDealers) return true;
    const q = searchDealers.toLowerCase();
    return dealer.name?.toLowerCase().includes(q) || dealer.owner_email?.toLowerCase().includes(q) || dealer.city?.toLowerCase().includes(q);
  });

  const ADMIN_PAGE_SIZE = 20;
  const carsTotalPages = Math.max(1, Math.ceil(filteredCars.length / ADMIN_PAGE_SIZE));
  const pagedAdminCars = filteredCars.slice((carsPage - 1) * ADMIN_PAGE_SIZE, carsPage * ADMIN_PAGE_SIZE);
  const dealersTotalPages = Math.max(1, Math.ceil(filteredDealers.length / ADMIN_PAGE_SIZE));
  const pagedAdminDealers = filteredDealers.slice((dealersPage - 1) * ADMIN_PAGE_SIZE, dealersPage * ADMIN_PAGE_SIZE);

  useEffect(() => { setCarsPage(1); }, [searchCars]);
  useEffect(() => { setDealersPage(1); }, [searchDealers]);

  const impersonateDealer = (dealer) => {
    setViewAsDealer(dealer.owner_email, dealer.name, dealer.id);
    window.location.href = '/DealerDashboard';
  };

  const filteredMessages = allMessages.filter(msg => {
    if (!searchMessages) return true;
    const q = searchMessages.toLowerCase();
    return msg.content?.toLowerCase().includes(q) || msg.sender_email?.toLowerCase().includes(q) || msg.receiver_email?.toLowerCase().includes(q);
  });

  const pendingApps = applications.filter(a => a.status === 'pending');

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    pending: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    sold: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
    rejected: 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
  };

  const appStatusColors = {
    pending: 'bg-slate-500/20 text-slate-400',
    approved: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-slate-500/20 text-slate-400'
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#101014] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#101014] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-6xl font-light text-slate-700">403</h1>
        <div className="h-px w-16 bg-slate-700 mx-auto" />
        <h2 className="text-xl font-medium text-slate-300">Доступ запрещён</h2>
        <p className="text-slate-500 text-sm">У вас нет прав для просмотра этой страницы.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
          ← На главную
        </button>
      </div>
    </div>
  );

  const tabLabels = {
    dashboard: 'Dashboard', activity: 'Лента активности', cars: 'Объявления', dealers: 'Дилеры',
    applications: 'Заявки дилеров', aimatch: 'AI Match', users: 'Пользователи',
    messages: 'Чаты', models: 'Обзоры моделей', reports: 'Жалобы',
    analytics: 'Аналитика', articles: 'Маркетинг / Новости', ads: 'Реклама',
    metaads: 'Meta Ads заказы', importrequests: 'Импорт', settings: 'Настройки'
  };

  return (
    <div className="bg-[#101014] flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingAppsCount={pendingApps.length}
        reportsCount={reports.length}
        messagesCount={allMessages.filter(m => !m.is_read).length}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        user={user}
      />

      {/* Main content */}
      <div className="flex-1 lg:ml-[220px] min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#101014]/90 backdrop-blur border-b border-[#292a32] px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg leading-none">
              Добро пожаловать, {user?.full_name?.split(' ')[0] || 'Admin'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Вот что происходит на платформе сегодня.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cars')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#292a32] text-slate-300 hover:border-slate-500 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Добавить объявление
            </button>
            <button
              onClick={() => setActiveTab('aimatch')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
            >
              <Zap className="w-4 h-4" /> AI Match
            </button>
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#292a32] text-slate-300 hover:border-slate-500 text-sm transition-colors">
              <Mail className="w-4 h-4" /> Отправить рассылку
            </button>
            <div className="relative">
              <button className="w-9 h-9 rounded-lg border border-[#292a32] flex items-center justify-center text-slate-400 hover:text-white">
                <Bell className="w-4 h-4" />
              </button>
              {reports.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {reports.length > 9 ? '9+' : reports.length}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {/* Breadcrumb */}
          <div className="mb-5 text-sm text-slate-500">
            <span className="text-slate-600">Admin</span>
            <span className="mx-2 text-slate-700">/</span>
            <span className="text-slate-300">{tabLabels[activeTab] || activeTab}</span>
          </div>

          {/* ACTIVITY FEED */}
          {activeTab === 'activity' && (
            <AdminActivityFeed
              allCars={allCars}
              dealers={dealers}
              applications={applications}
              allMessages={allMessages}
              dealerLeads={dealerLeads}
              reports={reports}
            />
          )}

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <AdminDashboard
              stats={{
                carsCount: allCars.length,
                dealersCount: dealers.length,
                appsCount: pendingApps.length,
                reportsCount: reports.length,
                allCars,
                dealers,
                allMessages,
                reports,
                applications,
                dealerLeads: dealerLeads
              }}
              onTabChange={setActiveTab}
            />
          )}

          {/* CARS */}
          {activeTab === 'cars' && (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
              <div className="p-4 border-b border-[#292a32]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Поиск по марке, модели, автору..." value={searchCars} onChange={(e) => setSearchCars(e.target.value)} className="pl-9 bg-[#101014] border-[#292a32] text-white placeholder:text-slate-600" />
                </div>
              </div>
              {loadingCars ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : (
                <div className="divide-y divide-[#292a32]">
                  {pagedAdminCars.map(car => (
                    <div key={car.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="w-full md:w-32 h-20 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                        {car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Car className="w-6 h-6" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{car.brand} {car.model} {car.year}</h3>
                          <Badge className={statusColors[car.status]}>{car.status}</Badge>
                          {car.is_premium && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Premium</Badge>}
                        </div>
                        <p className="text-emerald-400 font-semibold">{formatPrice(car.price)}</p>
                        <p className="text-xs text-slate-500 mt-1">от: {car.created_by}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap items-center">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-500/10 border border-slate-500/20">
                          <span className="text-xs text-slate-400 font-medium">Битая</span>
                          <Switch checked={!!car.is_damaged} onCheckedChange={(v) => updateCar.mutate({ id: car.id, data: { is_damaged: v } })} className="scale-75" />
                        </div>
                        <Select value={car.status} onValueChange={(v) => updateCar.mutate({ id: car.id, data: { status: v } })}>
                          <SelectTrigger className="w-36 h-8 text-xs bg-[#292a32] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#292a32] border-[#292a32]">
                            <SelectItem value="active">Активно</SelectItem>
                            <SelectItem value="pending">На модерации</SelectItem>
                            <SelectItem value="sold">Продано</SelectItem>
                            <SelectItem value="rejected">Отклонено</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={car.seller_type || 'private'} onValueChange={(v) => updateCar.mutate({ id: car.id, data: { seller_type: v } })}>
                          <SelectTrigger className="w-28 h-8 text-xs bg-[#292a32] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#292a32] border-[#292a32]">
                            <SelectItem value="private">Частник</SelectItem>
                            <SelectItem value="dealer">Дилер</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setEditingCar(car)} className="border-[#292a32] text-slate-300 hover:bg-[#292a32]"><Edit2 className="w-4 h-4" /></Button>
                        <Link to={createPageUrl('CarDetails') + `?id=${car.id}`}><Button variant="outline" size="sm" className="border-[#292a32] text-slate-300 hover:bg-[#292a32]"><Eye className="w-4 h-4" /></Button></Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1b1b22] border-[#292a32]">
                            <AlertDialogHeader><AlertDialogTitle className="text-white">Удалить объявление?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="bg-[#292a32] border-[#292a32] text-white">Отмена</AlertDialogCancel><AlertDialogAction onClick={() => deleteCar.mutate(car.id)} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {filteredCars.length === 0 && <div className="p-12 text-center text-slate-500">Ничего не найдено</div>}
                </div>
              )}
              <div className="p-4 border-t border-[#292a32]">
                <ListPagination className="mt-0" page={carsPage} totalPages={carsTotalPages} onPageChange={setCarsPage} />
              </div>
            </div>
          )}

          {/* APPLICATIONS */}
          {activeTab === 'applications' && <DealerApplicationsPanel onOpen={app => { setSelectedApp(app); setAdminNotes(app.admin_notes || ''); }} onApprove={approveApplication} busy={reviewing} />}

          {/* DEALERS */}
          {activeTab === 'dealers' && (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
              <div className="p-4 border-b border-[#292a32] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Поиск по названию, email, городу..." value={searchDealers} onChange={(e) => setSearchDealers(e.target.value)} className="pl-9 bg-[#101014] border-[#292a32] text-white placeholder:text-slate-600" />
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">Всего: {dealers.length}</span>
              </div>
              {loadingDealers ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : (
                <div className="divide-y divide-[#292a32]">
                  {pagedAdminDealers.map(dealer => (
                    <div key={dealer.id} className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="w-12 h-12 rounded-xl bg-[#292a32] flex items-center justify-center flex-shrink-0">
                        {dealer.logo ? <img src={dealer.logo} alt="" className="w-full h-full object-cover rounded-xl" /> : <Building2 className="w-6 h-6 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{dealer.name}</h3>
                          {dealer.is_verified && <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1"><CheckCircle className="w-3 h-3" /> Верифицирован</Badge>}
                          <Badge className="bg-[#292a32] text-slate-400">{dealer.subscription_type}</Badge>
                          {dealer.custom_pricing?.length > 0 && <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 gap-1"><DollarSign className="w-3 h-3" /> {dealer.custom_pricing.length} скидок</Badge>}
                        </div>
                        <p className="text-sm text-slate-400 truncate">{dealer.city}{dealer.country && `, ${dealer.country}`} · {dealer.owner_email}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap items-center">
                        <Select value={dealer.subscription_type || 'starter'} onValueChange={(v) => updateDealer.mutate({ id: dealer.id, data: { subscription_type: v } })}>
                          <SelectTrigger className="w-36 h-8 text-xs bg-[#292a32] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#292a32] border-[#292a32]">
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" onClick={() => updateDealer.mutate({ id: dealer.id, data: { is_verified: !dealer.is_verified } })} className="border-[#292a32] text-slate-300 text-xs">
                          {dealer.is_verified ? 'Снять' : 'Верифицировать'}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="border-[#292a32] text-slate-300 hover:bg-[#292a32] h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#292a32] border-[#292a32] text-slate-200 w-56">
                            <DropdownMenuItem asChild className="cursor-pointer hover:bg-[#292a32] focus:bg-[#292a32]">
                              <Link to={createPageUrl('DealerProfile') + `?id=${dealer.id}`} className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-slate-400" /> Страница дилера
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-[#292a32] focus:bg-[#292a32] flex items-center gap-2" onClick={() => impersonateDealer(dealer)}>
                              <UserCog className="w-4 h-4 text-emerald-400" /> Войти как {dealer.owner_email}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#292a32]" />
                            <DropdownMenuItem className="cursor-pointer hover:bg-[#292a32] focus:bg-[#292a32] flex items-center gap-2" onClick={() => setPricingDealer(dealer)}>
                              <DollarSign className="w-4 h-4 text-amber-400" /> Ценовая политика
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-[#292a32] focus:bg-[#292a32] flex items-center gap-2" onClick={() => setInvoiceDealer(dealer)}>
                              <FileText className="w-4 h-4 text-sky-400" /> Выставить счёт
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                  {filteredDealers.length === 0 && <div className="p-12 text-center text-slate-500">{dealers.length === 0 ? 'Дилеров пока нет' : 'Ничего не найдено'}</div>}
                </div>
              )}
              <div className="p-4 border-t border-[#292a32]">
                <ListPagination className="mt-0" page={dealersPage} totalPages={dealersTotalPages} onPageChange={setDealersPage} />
              </div>
            </div>
          )}

          {/* MODELS */}
          {activeTab === 'models' && (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
              <div className="p-4 border-b border-[#292a32] flex justify-between items-center">
                <h3 className="font-semibold text-white">Обзоры моделей автомобилей</h3>
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 gap-2" onClick={() => { setEditingModel(null); setShowModelModal(true); }}>
                  <Plus className="w-4 h-4" /> Добавить обзор
                </Button>
              </div>
              {loadingModels ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : carModels.length === 0 ? (
                <div className="p-12 text-center text-slate-500"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Обзоров пока нет</p></div>
              ) : (
                <div className="divide-y divide-[#292a32]">
                  {carModels.map(model => (
                    <div key={model.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="w-full md:w-28 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                        {model.cover_image ? <img src={model.cover_image} alt="" className="w-full object-cover" style={{ height: '72px' }} /> : <div className="w-full flex items-center justify-center text-slate-500" style={{ height: '72px' }}><Car className="w-6 h-6" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium text-white">{model.title}</h3>
                          <Badge className={model.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#292a32] text-slate-500'}>{model.is_published ? 'Опубликовано' : 'Черновик'}</Badge>
                          {model.user_rating > 0 && <Badge className="bg-emerald-500/20 text-emerald-400">{model.user_rating}/10</Badge>}
                        </div>
                        <p className="text-xs text-slate-500">{model.years && `${model.years} · `}{model.rating_votes || 0} голосов</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setEditingModel(model); setShowModelModal(true); }} className="border-[#292a32] text-slate-300"><Edit2 className="w-4 h-4" /></Button>
                        <Link to={`/CarModelDetails?id=${model.id}`}><Button variant="outline" size="sm" className="border-[#292a32] text-slate-300"><Eye className="w-4 h-4" /></Button></Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="border-red-500/30 text-red-400"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1b1b22] border-[#292a32]">
                            <AlertDialogHeader><AlertDialogTitle className="text-white">Удалить обзор?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="bg-[#292a32] border-[#292a32] text-white">Отмена</AlertDialogCancel><AlertDialogAction onClick={() => deleteModel.mutate(model.id)} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADS */}
          {activeTab === 'ads' && <AdminAds />}

          {/* IMPORT REQUESTS */}
          {activeTab === 'importrequests' && <AdminImportRequests />}

          {/* META ADS */}
          {activeTab === 'metaads' && <AdminMetaAds />}

          {/* ARTICLES */}
          {activeTab === 'articles' && <ArticleManagement user={user} />}

          {/* AI MATCH */}
          {activeTab === 'aimatch' && <AIMatchDashboard />}

          {/* MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl">
              <div className="p-4 border-b border-[#292a32]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder="Поиск по тексту, email отправителя..." value={searchMessages} onChange={(e) => setSearchMessages(e.target.value)} className="pl-9 bg-[#101014] border-[#292a32] text-white placeholder:text-slate-600" />
                </div>
              </div>
              {loadingMessages ? (
                <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>
              ) : (
                <div className="divide-y divide-[#292a32]">
                  {filteredMessages.map(msg => {
                    const isSpecial = msg.content?.startsWith('__OFFER');
                    const preview = isSpecial ? 'Сделка/предложение цены' : msg.content;
                    return (
                      <div key={msg.id} className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-300">{msg.sender_email}</span>
                            <span className="text-xs text-slate-600">→</span>
                            <span className="text-xs text-slate-500">{msg.receiver_email}</span>
                            <span className="text-xs text-slate-600">{new Date(msg.created_date).toLocaleString('ru-RU')}</span>
                            {!msg.is_read && <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Не прочитано</Badge>}
                          </div>
                          <p className={cn("text-sm", isSpecial ? "text-slate-400 italic" : "text-slate-300")}>{preview}</p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="outline" size="sm" className="border-red-500/30 text-red-400 flex-shrink-0"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1b1b22] border-[#292a32]">
                            <AlertDialogHeader><AlertDialogTitle className="text-white">Удалить сообщение?</AlertDialogTitle><AlertDialogDescription className="text-slate-400">Сообщение будет удалено для обоих участников чата.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel className="bg-[#292a32] border-[#292a32] text-white">Отмена</AlertDialogCancel><AlertDialogAction onClick={() => deleteMessage.mutate(msg.id)} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                  {filteredMessages.length === 0 && <div className="p-12 text-center text-slate-500">Сообщений не найдено</div>}
                </div>
              )}
            </div>
          )}

          {/* DAMAGED (settings tab) */}
          {activeTab === 'settings' && (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">Настройки платформы</h3>
              <p className="text-slate-500 text-sm">Раздел в разработке...</p>
              <div className="mt-6">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Wrench className="w-4 h-4 text-emerald-400" /> Авто без статуса «Без ДТП»</h4>
                {loadingCars ? (
                  <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
                ) : (
                  <div className="divide-y divide-[#292a32] rounded-xl border border-[#292a32]">
                    {allCars.filter(c => c.condition !== 'accident_free').map(car => (
                      <div key={car.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="w-full md:w-28 h-16 rounded-lg overflow-hidden bg-[#292a32] flex-shrink-0">
                          {car.images?.[0] ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Car className="w-5 h-5" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm">{car.brand} {car.model} {car.year}</h3>
                          <p className="text-emerald-400 text-sm">{formatPrice(car.price)}</p>
                          <p className="text-xs text-slate-500">{car.created_by}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Select value={car.status} onValueChange={(v) => updateCar.mutate({ id: car.id, data: { status: v } })}>
                            <SelectTrigger className="w-36 h-8 text-xs bg-[#101014] border-[#292a32] text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#292a32] border-[#292a32]">
                              <SelectItem value="active">Активно</SelectItem>
                              <SelectItem value="pending">На модерации</SelectItem>
                              <SelectItem value="sold">Продано</SelectItem>
                              <SelectItem value="rejected">Отклонено</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => setEditingCar(car)} className="border-[#292a32] text-slate-300"><Edit2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                    {allCars.filter(c => c.condition !== 'accident_free').length === 0 && (
                      <div className="p-8 text-center text-slate-500">Все авто отмечены как «Без ДТП»</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div className="bg-[#1b1b22] border border-[#292a32] rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" /> Жалобы ({reports.length})</h3>
              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Новых жалоб нет</div>
              ) : (
                <div className="space-y-3">
                  {reports.map(r => (
                    <div key={r.id} className="p-4 rounded-xl bg-[#101014] border border-[#292a32]">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className="bg-red-500/20 text-red-400">{r.reason}</Badge>
                        <Badge className="bg-[#292a32] text-slate-400">{r.target_type}</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{r.description || 'Без описания'}</p>
                      <p className="text-slate-600 text-xs mt-1">от: {r.reporter_email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <AdminAnalytics
              allCars={allCars}
              dealers={dealers}
              allMessages={allMessages}
              reports={reports}
              applications={applications}
              dealerLeads={dealerLeads}
              users={appUsers}
              views={viewHistory}
              saleFeedback={saleFeedback}
            />
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <AdminUsers
              users={appUsers}
              cars={allCars}
              dealers={dealers}
              views={viewHistory}
              messages={allMessages}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <CarEditModal
        car={editingCar}
        open={!!editingCar}
        onOpenChange={(v) => { if (!v) setEditingCar(null); }}
        onSaved={() => queryClient.invalidateQueries(['adminCars'])}
      />
      <CarModelEditModal
        model={editingModel}
        open={showModelModal}
        onOpenChange={(v) => { if (!v) { setShowModelModal(false); setEditingModel(null); } else setShowModelModal(v); }}
        onSaved={() => queryClient.invalidateQueries(['adminCarModels'])}
      />
      <DealerPricingPolicyModal
        dealer={pricingDealer}
        open={!!pricingDealer}
        onOpenChange={(v) => { if (!v) setPricingDealer(null); }}
      />
      <DealerInvoiceModal
        dealer={invoiceDealer}
        open={!!invoiceDealer}
        onOpenChange={(v) => { if (!v) setInvoiceDealer(null); }}
      />
      <DealerApplicationReview application={selectedApp} notes={adminNotes} setNotes={setAdminNotes} onClose={() => setSelectedApp(null)} onApprove={approveApplication} onReject={rejectApplication} busy={reviewing} />
    </div>
  );
}