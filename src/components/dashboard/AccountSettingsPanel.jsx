import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { auth } from '@/api/auth';
import { entities } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Check, X, Loader2, Receipt, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { translateCountry } from '@/utils/locationUtils';
import { COUNTRIES } from '@/lib/countries';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';
const OUTLINE_BTN = 'w-full sm:w-auto h-8 flex-shrink-0 bg-transparent border-[#3a3b45] text-slate-200 hover:bg-[#292a32]';
const INPUT = 'h-9 bg-[#101014] border-[#292a32] text-white';

const NAME_RE = /^[\p{L}][\p{L}\s'.-]{1,59}$/u;
const CITY_RE = /^[\p{L}][\p{L}\s'.-]{1,59}$/u;
const phoneDigits = (value) => (value || '').replace(/[^\d]/g, '');

function Section({ title, children }) {
  return (
    <section className={cn(CARD, 'rounded-xl p-4 sm:p-5')}>
      <h2 className="text-base font-semibold text-white mb-1">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, value, action, children }) {
  return (
    <div className="py-3 border-b border-[#292a32] last:border-0 last:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400">{label}</p>
          <div className="text-sm text-white mt-1 break-words">{children || value}</div>
        </div>
        {action}
      </div>
    </div>
  );
}

export default function AccountSettingsPanel({ user, onUserUpdate, locale }) {
  const { t } = useTranslation();
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const { data: invoices = [] } = useQuery({
    queryKey: ['accountInvoices', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const norm = (res) => (Array.isArray(res) ? res : (res?.items || []));
      const [promotions, metaAds] = await Promise.all([
        entities.ListingPromotion.filter({ seller_email: user.email }, '-purchased_at', 20),
        entities.MetaAdsOrder.filter({ seller_email: user.email }, '-created_date', 20)
      ]);
      const list = [
        ...norm(promotions).map((item) => ({
          id: item.id,
          title: item.listing_title || t('account.invoice_promotion'),
          meta: item.days ? t('account.invoice_days', { count: item.days }) : '',
          amount: item.price,
          date: item.purchased_at || item.created_date
        })),
        ...norm(metaAds).map((item) => ({
          id: item.id,
          title: item.package_name || t('account.invoice_meta'),
          meta: '',
          amount: item.price,
          date: item.ad_start_date || item.created_date
        }))
      ];
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  });

  const money = (value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

  const openField = (field) => {
    setEditingField(field);
    setFieldError('');
    setDraft(user?.[field] || '');
  };

  const validateField = (field, value) => {
    if (field === 'full_name' && !NAME_RE.test(value)) return t('account.invalid_name');
    if (field === 'phone') {
      const digits = phoneDigits(value).length;
      if (digits < 7 || digits > 15) return t('account.invalid_phone');
    }
    if (field === 'city' && !CITY_RE.test(value)) return t('account.invalid_city');
    if (field === 'country' && !COUNTRIES.includes(value)) return t('account.select_country');
    return '';
  };

  const saveField = async (field) => {
    const raw = draft.trim();
    const error = validateField(field, raw);
    if (error) {
      setFieldError(error);
      return;
    }
    setFieldError('');
    const value = field === 'phone' ? `+${phoneDigits(raw)}` : raw;
    setSavingField(true);
    try {
      await auth.updateMe({ [field]: value });
      onUserUpdate({ [field]: value });
      toast.success(t('account.saved'));
      setEditingField(null);
    } finally {
      setSavingField(false);
    }
  };

  const submitPassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error(t('account.password_fill'));
      return;
    }
    setSavingPassword(true);
    try {
      await auth.changePassword({ userId: user.id, currentPassword, newPassword });
      toast.success(t('account.password_changed'));
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(t('account.password_not_changed'));
    } finally {
      setSavingPassword(false);
    }
  };

  const editButton = (field) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => openField(field)}
      className={OUTLINE_BTN}
    >
      {user?.[field] ? t('account.change') : t('account.add')}
    </Button>
  );

  const editingControls = (field) => (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        {field === 'country' ? (
          <Select value={draft} onValueChange={(value) => { setDraft(value); setFieldError(''); }}>
            <SelectTrigger className={cn(INPUT, 'flex-1')}>
              <SelectValue placeholder={t('account.select_country')} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>{translateCountry(t, country)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={draft}
            onChange={(event) => { setDraft(event.target.value); setFieldError(''); }}
            inputMode={field === 'phone' ? 'tel' : 'text'}
            autoFocus
            className={INPUT}
          />
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-9 w-9 p-0 text-emerald-400 flex-shrink-0"
          disabled={savingField}
          onClick={() => saveField(field)}
        >
          {savingField ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-slate-500 flex-shrink-0" onClick={() => { setEditingField(null); setFieldError(''); }}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      {fieldError && <p className="mt-1.5 text-xs text-red-400">{fieldError}</p>}
    </div>
  );

  const contactFields = [
    { field: 'full_name', label: t('account.name_label') },
    { field: 'phone', label: t('account.phone_label') },
    { field: 'city', label: t('account.city_label') },
    { field: 'country', label: t('account.country_label') }
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{t('account.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('account.subtitle')}</p>
      </div>

      <Section title={t('account.login_data')}>
        <Row label={t('account.email_label')}>
          <span className="flex flex-wrap items-center gap-2">
            <span className="break-all">{user?.email || ''}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[11px] font-semibold">
              <Check className="w-3 h-3" />
              {t('account.email_confirmed')}
            </span>
          </span>
        </Row>

        <div className="flex items-start gap-2 mt-3 rounded-lg p-3 bg-[#292a32]">
          <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300">
            {t('account.email_change_hint')}{' '}
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className="underline hover:text-emerald-400 transition-colors"
            >
              {t('account.email_change_link')}
            </button>
          </p>
        </div>

        <div className="flex items-start gap-2 mt-2 rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/90">{t('account.password_warning')}</p>
        </div>

        <Row
          label={t('account.password_label')}
          value={t('account.password_value')}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordOpen((open) => !open)}
              className={OUTLINE_BTN}
            >
              {t('account.change')}
            </Button>
          }
        >
          {passwordOpen && (
            <div className="mt-1 space-y-2 max-w-sm">
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder={t('account.current_password')}
                className={INPUT}
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t('account.new_password')}
                className={INPUT}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600" disabled={savingPassword} onClick={submitPassword}>
                  {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {t('dashboard.save_changes')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400"
                  onClick={() => { setPasswordOpen(false); setCurrentPassword(''); setNewPassword(''); }}
                >
                  {t('dashboard.cancel')}
                </Button>
              </div>
            </div>
          )}
        </Row>
      </Section>

      <Section title={t('account.contact_data')}>
        {contactFields.map(({ field, label }) => (
          <Row
            key={field}
            label={label}
            value={user?.[field] || t('account.not_specified')}
            action={editingField === field ? null : editButton(field)}
          >
            {editingField === field && editingControls(field)}
          </Row>
        ))}
      </Section>

      <Section title={t('account.documents')}>
        <Row
          label={t('account.invoices_title')}
          value={t('account.invoices_desc')}
          action={
            <Button
              variant="outline"
              size="sm"
              disabled={invoices.length === 0}
              onClick={() => setShowInvoices((open) => !open)}
              className={cn(OUTLINE_BTN, 'disabled:opacity-40')}
            >
              {showInvoices ? t('account.hide') : t('account.show')}
            </Button>
          }
        />

        {showInvoices && invoices.length > 0 && (
          <div className="mt-3 space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 bg-[#101014]">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{invoice.title}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(invoice.date)}{invoice.meta ? ` · ${invoice.meta}` : ''}
                  </p>
                </div>
                <span className="text-sm font-semibold text-white whitespace-nowrap">{money(invoice.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {invoices.length === 0 && (
          <div className="flex items-center gap-2 mt-3 rounded-lg p-3 bg-[#292a32]">
            <Receipt className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-300">{t('account.no_invoices')}</p>
          </div>
        )}
      </Section>
    </div>
  );
}