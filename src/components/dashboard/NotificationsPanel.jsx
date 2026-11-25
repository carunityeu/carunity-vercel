import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Check, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CARD = 'bg-[#1b1b22] border border-[#292a32]';

export default function NotificationsPanel({ user, onUserUpdate }) {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    preferred_language: user?.preferred_language || 'ru',
    notify_email: user?.notify_email !== false,
    notify_new_cars: user?.notify_new_cars !== false,
    notify_price_drop: user?.notify_price_drop !== false,
    notify_messages: user?.notify_messages !== false
  });

  const save = async () => {
    setIsSaving(true);
    try {
      await auth.updateMe(form);
      onUserUpdate(form);
      toast.success(t('dashboard.profile_saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggles = [
    { key: 'notify_email', label: t('dashboard.notify_email'), desc: t('dashboard.notify_email_desc') },
    { key: 'notify_new_cars', label: t('dashboard.notify_new_cars'), desc: t('dashboard.notify_new_cars_desc') },
    { key: 'notify_price_drop', label: t('dashboard.notify_price_drop'), desc: t('dashboard.notify_price_drop_desc') },
    { key: 'notify_messages', label: t('dashboard.notify_messages'), desc: t('dashboard.notify_messages_desc') }
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-white">{t('account.nav_notifications')}</h1>

      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
          <Label className="text-slate-400 mb-1 block">{t('dashboard.field_language')}</Label>
          <Select
            value={form.preferred_language}
            onValueChange={(value) => setForm({ ...form, preferred_language: value })}
          >
            <SelectTrigger className="bg-[#101014] border-[#292a32] text-white max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="et">Eesti</SelectItem>
              <SelectItem value="lv">Latviešu</SelectItem>
              <SelectItem value="lt">Lietuvių</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-400 mt-1.5 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-400/70" />
            <span>{t('dashboard.preferred_language_desc')}</span>
          </p>
        </div>

        <div className="mt-5 divide-y divide-border">
          {toggles.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-5 py-5">
              <div className="min-w-0">
                <div className="font-medium text-white text-sm">{item.label}</div>
                <div className="text-sm leading-relaxed text-muted-foreground mt-1 max-w-md">{item.desc}</div>
              </div>
              <Switch
                aria-label={item.label}
                className="shrink-0"
                checked={form[item.key]}
                onCheckedChange={(value) => setForm({ ...form, [item.key]: value })}
              />
            </div>
          ))}
        </div>

        <Button onClick={save} variant="outline" className="mt-5 h-11 w-full sm:w-auto gap-2 bg-secondary text-foreground border-border hover:bg-accent" disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {t('dashboard.save_changes')}
        </Button>
      </section>
    </div>
  );
}