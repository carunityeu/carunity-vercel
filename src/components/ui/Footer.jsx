import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, MapPin } from 'lucide-react';
import ContactSupportModal from '@/components/ui/ContactSupportModal';
import { LanguageSwitcherDropdown } from '@/components/ui/LanguageSwitcherMenu';

const InstagramIcon = () =>
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M17.5 2h-11A4.5 4.5 0 0 0 2 6.5v11A4.5 4.5 0 0 0 6.5 22h11a4.5 4.5 0 0 0 4.5-4.5v-11A4.5 4.5 0 0 0 17.5 2zm-5.5 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.25-8.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z"/>
  </svg>;

const TikTokIcon = () =>
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
  </svg>;

const YouTubeIcon = () =>
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>;

const FacebookIcon = () =>
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>;

const LinkedInIcon = () =>
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>;

export default function Footer() {
  const { t } = useTranslation();
  const [showContact, setShowContact] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300">
      <ContactSupportModal open={showContact} onOpenChange={setShowContact} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-4 md:mb-6">
              <span className="text-xl font-bold text-white">
                Car<span className="text-emerald-400">Unity</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4 md:mb-6 leading-relaxed">{t('footer.about')}</p>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.instagram.com/carunity_eu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61572050994880&sk=about" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <FacebookIcon />
              </a>
              <a href="https://www.tiktok.com/@carunity.eu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <TikTokIcon />
              </a>
              <a href="https://youtube.com/@carunityou?si=Ylvv0cKTluruUhYC" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <YouTubeIcon />
              </a>
              <a href="https://www.linkedin.com/company/carunity-o%C3%BC/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-emerald-600 flex items-center justify-center transition-colors">
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 md:mb-6">{t('footer.quick_links')}</h3>
            <ul className="space-y-2.5 md:space-y-3">
              <li>
                <Link to={createPageUrl('Catalog')} className="text-sm hover:text-emerald-300 transition-colors">
                  {t('footer.catalog')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Dealers')} className="text-sm hover:text-emerald-300 transition-colors">
                  {t('nav.partners')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('CreateListing')} className="text-sm hover:text-emerald-300 transition-colors">
                  {t('footer.post_listing', 'Разместить объявление')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('Help')} className="text-sm hover:text-emerald-300 transition-colors">
                  {t('footer.help_center')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Dealers */}
          <div>
            <h3 className="text-white font-semibold mb-3 md:mb-6">{t('footer.for_dealers')}</h3>
            <ul className="space-y-2.5 md:space-y-3">
              <li>
                <Link to={createPageUrl('DealerRegister')} className="text-sm hover:text-emerald-300 transition-colors">
                  {t('footer.dealer_register')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl('DealerPricing')} className="text-sm hover:text-emerald-300 transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/Advertising" className="text-sm hover:text-emerald-300 transition-colors">
                  {t('footer.advertising')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold mb-3 md:mb-6">{t('footer.contacts')}</h3>
            <ul className="space-y-3 md:space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm">Väike-käspre tee 7</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <a href="mailto:info@carunity.eu" className="text-sm hover:text-emerald-300 transition-colors">
                  info@carunity.eu
                </a>
              </li>
              <li>
                <button onClick={() => setShowContact(true)} className="text-sm text-emerald-300 hover:text-emerald-200 transition-colors underline underline-offset-2">
                  {t('footer.contact_us')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 md:mt-12 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">{t('footer.copyright', '© 2026 CarUnity OÜ. All rights reserved.')}</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <Link to={createPageUrl('PrivacyPolicy')} className="text-sm text-slate-500 hover:text-emerald-300 transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to={createPageUrl('Terms')} className="text-sm text-slate-500 hover:text-emerald-300 transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to={createPageUrl('CookiePolicy')} className="text-sm text-slate-500 hover:text-emerald-300 transition-colors">
                {t('footer.cookie_policy')}
              </Link>
              <LanguageSwitcherDropdown buttonClassName="!py-0 !px-1.5 hover:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}