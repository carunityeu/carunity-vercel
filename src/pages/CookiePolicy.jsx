import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ui = {
  ru: { pageTitle: 'Политика использования Cookie-файлов', backLabel: 'Правовая информация', back: 'Назад' },
  en: { pageTitle: 'Cookie Policy', backLabel: 'Legal Information', back: 'Back' },
};

const bodyRu = `
**ПОЛИТИКА ИСПОЛЬЗОВАНИЯ COOKIE-ФАЙЛОВ**
CarUnity OÜ

**1. Общие положения**

**1.1.** Настоящая Политика использования cookie-файлов (далее — Политика cookies) определяет порядок использования файлов cookie и аналогичных технологий на платформе Carunity, управляемой обществом с ограниченной ответственностью CarUnity OÜ (далее — Компания, мы).

**1.2.** Для целей настоящей Политики под платформой CarUnity (далее — Платформа) понимаются веб-сайт, мобильное приложение, а также иные цифровые решения, сервисы и интерфейсы, используемые Компанией для предоставления услуг пользователям на территории Эстонской Республики, Латвийской Республики, Литовской Республики, а также иных государств Европейской экономической зоны.

**1.3.** Настоящая Политика cookies является неотъемлемой частью Политики конфиденциальности CarUnity и применяется ко всем пользователям Платформы.

**1.4.** Компания использует cookie-файлы в соответствии с требованиями Регламента (ЕС) 2016/679 (GDPR), Директивы 2002/58/EC (ePrivacy Directive), а также применимого законодательства Эстонской Республики и иных государств Балтии.

**1.5.** Используя Платформу, пользователь подтверждает, что он ознакомлен с настоящей Политикой cookies. В случаях, когда это требуется законодательством, использование отдельных категорий cookie-файлов осуществляется только на основании предварительного согласия пользователя.

**2. Что такое cookie-файлы**

**2.1.** Cookie-файлы (далее — cookies) представляют собой небольшие текстовые файлы, которые сохраняются на устройстве пользователя при посещении Платформы.

**2.2.** Cookies позволяют распознавать устройство пользователя, обеспечивать корректную работу Платформы, сохранять пользовательские настройки, анализировать использование Платформы, предоставлять персонализированный контент и рекламные предложения.

**2.3.** Cookies могут быть сеансовыми — удаляются после завершения сессии, или постоянными — сохраняются на устройстве пользователя в течение установленного срока.

**3. Цели использования cookies**

**3.1.** Компания использует cookies для следующих целей: обеспечения функционирования Платформы; аутентификации и безопасности пользователей; улучшения пользовательского опыта; анализа и оптимизации работы Платформы; разработки и улучшения сервисов; предоставления персонализированного контента и рекламы.

**4. Категории используемых cookies**

**4.1.** На Платформе используются следующие категории cookies:

**(a) Обязательные (технические) cookies** — необходимы для функционирования Платформы и не могут быть отключены. Используются для обеспечения безопасности, авторизации пользователей, корректной работы сервисов. Согласие пользователя не требуется.

**(b) Функциональные cookies** — обеспечивают расширенные возможности и персонализацию: сохранение предпочтений пользователя, настройка интерфейса. Правовое основание: согласие пользователя.

**(c) Аналитические cookies** — позволяют анализировать использование Платформы: сбор статистики посещаемости, анализ поведения пользователей, улучшение качества услуг. Правовое основание: согласие пользователя.

**(d) Маркетинговые cookies** — используются для персонализации рекламы и оценки её эффективности: отображение релевантной рекламы, отслеживание эффективности рекламных кампаний. Правовое основание: согласие пользователя.

**(e) Cookies социальных сетей** — позволяют пользователю взаимодействовать с социальными платформами. Правовое основание: согласие пользователя.

**4.2.** Функциональные, аналитические, маркетинговые cookie-файлы, а также cookie-файлы социальных сетей не устанавливаются на устройство пользователя до получения предварительного согласия пользователя, если иное не допускается применимым законодательством.

**5. Сторонние поставщики услуг**

**5.1.** Компания может использовать сторонние сервисы, устанавливающие cookies, включая: Google Analytics, Google Ads, Meta (Facebook Pixel), TikTok Pixel, Cloudflare.

**5.2.** Указанные третьи лица могут обрабатывать данные пользователей в соответствии со своими политиками конфиденциальности. Пользователю рекомендуется ознакомиться с этими политиками до предоставления согласия.

**5.3.** В случае передачи данных за пределы Европейской экономической зоны Компания обеспечивает соблюдение требований GDPR, включая использование стандартных договорных положений (SCC) и иных надлежащих гарантий.

**6. Согласие на использование cookies**

**6.1.** При первом посещении Платформы пользователю отображается cookie-баннер, предоставляющий возможность: принять все cookies; отклонить все необязательные cookies; выбрать категории cookies.

**6.2.** Cookies, не являющиеся строго необходимыми, не устанавливаются до получения согласия пользователя.

**6.3.** Пользователь вправе в любой момент изменить или отозвать своё согласие через раздел «Настройки cookies» на Платформе.

**6.4.** Отзыв согласия не влияет на законность обработки, осуществляемой до его отзыва.

**7. Сроки хранения cookies**

**7.1.** Cookies хранятся в течение срока, необходимого для достижения целей их использования: для сеансовых — до окончания сессии; для постоянных — до 24 месяцев либо на иной срок, предусмотренный назначением cookie или применимым законодательством.

**8. Управление cookies**

**8.1.** Пользователь может управлять cookies через настройки cookie на Платформе или через настройки своего браузера. Отключение cookies может повлиять на корректность работы Платформы.

**9. Права пользователя**

**9.1.** Пользователь имеет права, предусмотренные GDPR, включая: право на получение информации; право доступа к данным; право на исправление и удаление данных; право на ограничение обработки; право возражения; право на переносимость данных; право отзыва согласия.

**10. Контактная информация**

CarUnity OÜ
Email: info@carunity.eu
Адрес: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia

**11. Изменения политики**

**11.1.** Компания вправе вносить изменения в настоящую Политику cookies. Актуальная версия публикуется на Платформе.
`;

const bodyEn = `
**COOKIE POLICY**
CarUnity OÜ

**1. General Provisions**

**1.1.** This Cookie Policy (hereinafter — the "Cookie Policy") defines the procedure for the use of cookies and similar technologies on the CarUnity platform operated by CarUnity OÜ (hereinafter — the "Company", "we").

**1.2.** For the purposes of this Policy, the CarUnity platform (hereinafter — the "Platform") means the website, mobile application, as well as other digital solutions, services and interfaces used by the Company to provide services to users in the Republic of Estonia, the Republic of Latvia, the Republic of Lithuania, as well as other states of the European Economic Area.

**1.3.** This Cookie Policy forms an integral part of the CarUnity Privacy Policy and applies to all users of the Platform.

**1.4.** The Company uses cookies in accordance with Regulation (EU) 2016/679 (GDPR), Directive 2002/58/EC (ePrivacy Directive), as well as applicable legislation of the Republic of Estonia and other Baltic states.

**1.5.** By using the Platform, the user confirms that they are familiar with this Cookie Policy. Where required by law, the use of certain categories of cookies is carried out only on the basis of the user's prior consent.

**2. What Are Cookies**

**2.1.** Cookies are small text files stored on the user's device when visiting the Platform.

**2.2.** Cookies allow the Company to recognize the user's device, ensure the proper functioning of the Platform, retain user preferences, analyze the use of the Platform, and provide personalized content and advertising offers.

**2.3.** Cookies may be session cookies (deleted after the end of the session) or persistent cookies (stored on the user's device for a specified period).

**3. Purposes of Using Cookies**

**3.1.** The Company uses cookies for the following purposes: ensuring the functioning of the Platform; user authentication and security; improving user experience; analysis and optimization of the operation of the Platform; development and improvement of services; provision of personalized content and advertising.

**4. Categories of Cookies Used**

**4.1.** The following categories of cookies are used on the Platform:

**(a) Strictly Necessary (Technical) Cookies** — necessary for the functioning of the Platform and cannot be disabled. Used for ensuring security, user authorization, proper functioning of services. User consent: not required.

**(b) Functional Cookies** — provide enhanced features and personalization: retaining user preferences, interface customization. Legal basis: user consent.

**(c) Analytical Cookies** — allow analysis of the use of the Platform: collecting traffic statistics, analyzing user behavior, improving the quality of services. Legal basis: user consent.

**(d) Marketing Cookies** — used to personalize advertising and assess its effectiveness: displaying relevant advertising, tracking the effectiveness of advertising campaigns. Legal basis: user consent.

**(e) Social Media Cookies** — allow the user to interact with social platforms. Legal basis: user consent.

**4.2.** Functional, analytical, marketing and social media cookies are not placed on the user's device until the user's prior consent has been obtained, unless otherwise permitted by applicable law.

**5. Third-Party Service Providers**

**5.1.** The Company may use third-party services that place cookies, including: Google Analytics, Google Ads, Meta (Facebook Pixel), TikTok Pixel, Cloudflare.

**5.2.** These third parties may process user data in accordance with their own privacy policies. Users are advised to review those policies before giving consent.

**5.3.** In the event of transfer of data outside the European Economic Area, the Company ensures compliance with GDPR requirements, including the use of Standard Contractual Clauses (SCCs) and other appropriate safeguards.

**6. Consent to the Use of Cookies**

**6.1.** Upon the first visit to the Platform, the user is shown a cookie banner providing the possibility to: accept all cookies; reject all non-essential cookies; select cookie categories.

**6.2.** Cookies that are not strictly necessary are not placed until the user's consent has been obtained.

**6.3.** The user has the right to change or withdraw their consent at any time through the "Cookie Settings" section on the Platform.

**6.4.** Withdrawal of consent does not affect the lawfulness of processing carried out before such withdrawal.

**7. Retention Periods of Cookies**

**7.1.** Cookies are stored for the period necessary to achieve the purposes of their use: session cookies — until the end of the user session; persistent cookies — for a period of up to 24 months or for another period if provided for by the specific purpose of the cookie or applicable law.

**8. Management of Cookies**

**8.1.** The user may manage cookies through the cookie settings on the Platform or through their browser settings. Disabling cookies may affect the proper functioning of the Platform.

**9. User Rights**

**9.1.** The user has the rights provided for by GDPR, including: the right to receive information; the right of access to data; the right to rectification and erasure of data; the right to restriction of processing; the right to object; the right to data portability; the right to withdraw consent.

**10. Contact Information**

CarUnity OÜ
Email: info@carunity.eu
Address: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia

**11. Changes to the Policy**

**11.1.** The Company has the right to make changes to this Cookie Policy. The current version shall be published on the Platform.
`;

function renderBody(text) {
  return text.trim().split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const parseParts = (str) => str.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={j} className="font-semibold text-slate-600 dark:text-slate-300">{part.slice(2, -2)}</span>;
      }
      return part;
    });

    if (trimmed.match(/^\*\*\d+\.\s[^*]+\*\*$/) && !trimmed.match(/^\*\*\d+\.\d+/)) {
      const title = trimmed.replace(/\*\*/g, '');
      return (
        <h2 key={i} className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-10 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          {title}
        </h2>
      );
    }

    return (
      <p key={i} className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
        {parseParts(trimmed)}
      </p>
    );
  });
}

export default function CookiePolicy() {
  const { i18n } = useTranslation();
  const isRu = i18n.language?.startsWith('ru');
  const c = isRu ? ui.ru : ui.en;
  const body = isRu ? bodyRu : bodyEn;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-1.5 text-sm mb-8">
          <span className="text-slate-500">{c.pageTitle}</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{c.pageTitle}</h1>
        <p className="text-slate-400 text-xs mb-10">CarUnity OÜ</p>

        <div>
          {renderBody(body)}
        </div>
      </div>
    </div>
  );
}