import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Building2, Mail, MapPin } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Container } from '@/components/ds';
import ContactSupportModal from '@/components/ui/ContactSupportModal';

const COMPANY = 'Carunity OÜ';
const REG_CODE = '17302573';
const ADDRESS = ['Väike-Käspre tee 7, Laiaküla,', 'Viimsi vald, 74008 Harjumaa, Eesti'];
const EMAIL = 'info@carunity.eu';

// Social icons drawn as simple glyphs (the same set as before, one size)
const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/carunity_eu', icon: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /></> },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61572050994880&sk=about', icon: <path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.7-.6z" /> },
  { label: 'TikTok', href: 'https://www.tiktok.com/@carunity.eu', icon: <path d="M16 3c.4 2.2 1.8 3.6 4 4v3.2c-1.5 0-2.9-.5-4-1.2v6.5A5.5 5.5 0 1 1 10.5 10v3.3a2.3 2.3 0 1 0 2.2 2.3V3z" /> },
  { label: 'YouTube', href: 'https://youtube.com/@carunityou?si=Ylvv0cKTluruUhYC', icon: <path d="M22 8.2c-.2-1.6-1-2.6-2.6-2.8C17 5 12 5 12 5s-5 0-7.4.4C3 5.6 2.2 6.6 2 8.2 1.8 9.8 1.8 12 1.8 12s0 2.2.2 3.8c.2 1.6 1 2.6 2.6 2.8C7 19 12 19 12 19s5 0 7.4-.4c1.6-.2 2.4-1.2 2.6-2.8.2-1.6.2-3.8.2-3.8s0-2.2-.2-3.8zM10 15V9l5.2 3z" /> },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/carunity-o%C3%BC/', icon: <path d="M4 9h3.5v11H4zM5.8 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h3.3v1.5c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.3 2.3 4.3 5.4V20h-3.5v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H10z" /> },
];

const LINK = 'text-sm text-ink-2';
const HEADING = 'mb-5 text-base font-bold text-ink';

function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className={HEADING}>{title}</h3>
      <ul className="space-y-3.5">
        {links.map(([to, label]) => <li key={to}><Link to={to} className={LINK}>{label}</Link></li>)}
      </ul>
    </div>
  );
}

function Contact({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-3 text-sm leading-relaxed text-ink-2">
      <Icon className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-brand-text" strokeWidth={1.8} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Site footer: brand and socials, two link columns, company contacts; legal line with policies below. */
export default function Footer() {
  const { t } = useTranslation();
  const [contact, setContact] = useState(null); // null = closed, '' = the contact form
  const regLabel = t('footer.reg_code', 'Рег. код');

  return (
    <footer className="border-t border-line bg-surface">
      <ContactSupportModal open={contact !== null} onOpenChange={(open) => !open && setContact(null)} initialSubject={contact || ''} />
      <Container className="pb-8 pt-12 md:pt-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.25fr_1fr_1fr_1.35fr] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="text-2xl font-bold tracking-tight text-ink">Car<span className="text-brand-text">Unity</span></Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-2">{t('footer.tagline', 'Платформа для купли-продажи автомобилей в странах Балтии.')}</p>
            <div className="mt-6 flex gap-2.5">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-raised text-ink-2">
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          <LinkColumn title={t('footer.quick_links')} links={[
            [createPageUrl('Catalog'), t('footer.catalog')],
            [createPageUrl('Dealers'), t('nav.partners')],
            [createPageUrl('CreateListing'), t('footer.post_listing', 'Разместить объявление')],
            [createPageUrl('Help'), t('footer.help_center')],
          ]} />
          <LinkColumn title={t('footer.for_dealers')} links={[
            [createPageUrl('DealerRegister'), t('footer.dealer_register')],
            [createPageUrl('DealerPricing'), t('footer.pricing')],
            ['/Advertising', t('footer.advertising')],
          ]} />

          <div className="col-span-2 space-y-4 lg:col-span-1">
            <h3 className={HEADING}>{t('footer.contacts')}</h3>
            <Contact icon={Building2}><b className="block font-semibold text-ink">{COMPANY}</b>{regLabel}: {REG_CODE}</Contact>
            <Contact icon={MapPin}>{ADDRESS[0]}<br />{ADDRESS[1]}</Contact>
            <Contact icon={Mail}><a href={`mailto:${EMAIL}`}>{EMAIL}</a></Contact>
            <button type="button" onClick={() => setContact('')} className="text-sm font-medium text-brand-text underline underline-offset-4">
              {t('footer.contact_us')}
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 text-sm text-ink-3 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 {COMPANY}<span className="mx-2.5 text-ink-3/50">·</span>{regLabel} {REG_CODE}</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to={createPageUrl('Terms')} className="text-ink-2">{t('footer.terms')}</Link>
            <Link to={createPageUrl('PrivacyPolicy')} className="text-ink-2">{t('footer.privacy')}</Link>
            <Link to={createPageUrl('CookiePolicy')} className="text-ink-2">{t('footer.cookie_policy')}</Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
