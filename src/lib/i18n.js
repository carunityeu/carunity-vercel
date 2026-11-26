import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { bundledTranslations } from '@/lib/bundledTranslations';
import { fastSaleTranslations } from '@/lib/fastSaleTranslations';
import { valuationTranslations } from '@/lib/valuationTranslations';
import { pricingTranslations } from '@/lib/pricingTranslations';
import { pricingReferenceTranslations } from '@/lib/pricingReferenceTranslations';
import { storyTranslations } from '@/lib/storyTranslations';
import { paginationTranslations } from '@/lib/paginationTranslations';
import { promotionTranslations } from '@/lib/promotionTranslations';
import { tileTranslations } from '@/lib/tileTranslations';
import { energyTranslations } from '@/lib/energyTranslations';
import { carDetailsTranslations } from '@/lib/carDetailsTranslations';
import { listingCreateTranslations } from '@/lib/listingCreateTranslations';
import { listingCreateRefTranslations } from '@/lib/listingCreateRefTranslations';
import { caroTranslations } from '@/components/caro/translations';
import { advertisingInfoTranslations } from '@/lib/advertisingInfoTranslations';
import { dashboardRefinementTranslations } from '@/lib/dashboardRefinementTranslations';
import { dealerApplicationTranslations } from '@/lib/dealerApplicationTranslations';
import { searchRefinementTranslations } from '@/lib/searchRefinementTranslations';
import { compareTranslations } from '@/lib/compareTranslations';
import { workspaceTranslations } from '@/lib/workspaceTranslations';
import { dealerActionsTranslations } from '@/lib/dealerActionsTranslations';
import { dealerProfileTranslations } from '@/lib/dealerProfileTranslations';
import { dealerEmployeesTranslations } from '@/lib/dealerEmployeesTranslations';
import { dealerTipsTranslations } from '@/lib/dealerTipsTranslations';
import { dealerLeadTranslations } from '@/lib/dealerLeadTranslations';
import { renewalTranslations } from '@/lib/renewalTranslations';
import { promoteMultiTranslations } from '@/lib/promoteMultiTranslations';
import listingStatusTranslations from '@/lib/listingStatusTranslations';
import { consignmentTranslations } from '@/lib/consignmentTranslations';
import { viewAsTranslations } from '@/lib/viewAsTranslations';
import { authTranslations } from '@/components/auth/authTranslations';
import { paymentTranslations } from '@/lib/paymentTranslations';
import { UI_TEXTS, buildResources } from '@/lib/uiTranslations';
import { FEATURE_TEXTS, GAP_TEXTS, MAP_TEXTS } from '@/lib/featureTranslations';

const uiResources = buildResources(UI_TEXTS, FEATURE_TEXTS, GAP_TEXTS, MAP_TEXTS);

// Личный кабинет: боковое меню, обзор, настройки аккаунта
const accountResources = {
  ru: {
    account: {
      title: 'Мои настройки аккаунта',
      subtitle: 'Здесь вы управляете объявлениями, избранным и данными профиля',
      nav_overview: 'Обзор',
      nav_messages: 'Сообщения',
      group_buying: 'Покупки',
      group_selling: 'Продажа',
      group_profile: 'Мой профиль',
      nav_searches: 'Мои поиски',
      nav_favorites: 'Избранное',
      nav_history: 'Просмотренные',
      nav_listings: 'Мои объявления',
      nav_offers: 'Предложения дилеров',
      nav_settings: 'Настройки аккаунта',
      nav_notifications: 'Уведомления',
      edit_profile: 'Редактировать',
      greeting: 'Здравствуйте, {{name}}, что хотите сделать сегодня?',
      breadcrumb: 'Мой аккаунт',
      tile_search_title: 'Начать новый поиск',
      tile_search_desc: '{{count}} объявлений',
      tile_searches_title: 'Посмотреть мои поиски',
      tile_searches_desc: '{{count}} сохранённых',
      tile_searches_empty: 'Нет сохранённых поисков',
      tile_favorites_title: 'Посмотреть избранное',
      tile_favorites_desc: '{{count}} авто в избранном',
      tile_favorites_empty: 'Пока пусто',
      tile_messages_title: 'К моим сообщениям',
      tile_messages_desc: '{{count}} новых',
      tile_messages_empty: 'Нет новых сообщений',
      tile_sell_title: 'Продать автомобиль',
      tile_sell_desc: 'Объявление или оценка стоимости',
      my_listings: 'Мои объявления',
      view_all: 'Все объявления',
      no_listings: 'У вас пока нет объявлений',
      add_listing: 'Разместить объявление',
      login_data: 'Данные для входа',
      email_label: 'E-mail',
      email_note: 'Email используется для входа в аккаунт и не может быть изменён здесь.',
      email_confirmed: 'Активен',
      email_change_hint: 'Чтобы изменить e-mail, сначала задайте новый пароль.',
      email_change_link: 'Изменить пароль',
      password_warning: 'После смены пароля другие устройства потребуют повторного входа.',
      password_label: 'Пароль',
      password_value: '••••••••••••',
      change: 'Изменить',
      add: 'Добавить',
      current_password: 'Текущий пароль',
      new_password: 'Новый пароль',
      password_changed: 'Пароль обновлён',
      password_not_changed: 'Не удалось изменить пароль',
      password_fill: 'Заполните оба поля пароля',
      contact_data: 'Контактные данные',
      name_label: 'Имя',
      phone_label: 'Телефон',
      city_label: 'Город',
      country_label: 'Страна',
      select_country: 'Выберите страну',
      invalid_name: 'Введите имя — только буквы',
      invalid_phone: 'Введите корректный номер телефона',
      invalid_city: 'Введите город — только буквы',
      not_specified: 'Не указано',
      saved: 'Сохранено',
      documents: 'Документы',
      invoices_title: 'Мои счета',
      invoices_desc: 'Здесь собраны оплаченные пакеты и услуги',
      show: 'Показать',
      hide: 'Скрыть',
      no_invoices: 'Счетов пока нет',
      invoice_promotion: 'Продвижение объявления',
      invoice_meta: 'Реклама Meta',
      invoice_days: '{{count}} дней'
    }
  },
  en: {
    account: {
      title: 'My account settings',
      subtitle: 'Manage your listings, favourites and profile details',
      nav_overview: 'Overview',
      nav_messages: 'Messages',
      group_buying: 'Buying',
      group_selling: 'Selling',
      group_profile: 'My profile',
      nav_searches: 'My searches',
      nav_favorites: 'Favourites',
      nav_history: 'Viewed',
      nav_listings: 'My listings',
      nav_offers: 'Dealer offers',
      nav_settings: 'Account settings',
      nav_notifications: 'Notifications',
      edit_profile: 'Edit',
      greeting: 'Hello {{name}}, what would you like to do today?',
      breadcrumb: 'My account',
      tile_search_title: 'Start a new search',
      tile_search_desc: '{{count}} listings',
      tile_searches_title: 'View my searches',
      tile_searches_desc: '{{count}} saved',
      tile_searches_empty: 'No saved searches',
      tile_favorites_title: 'View my favourites',
      tile_favorites_desc: '{{count}} saved cars',
      tile_favorites_empty: 'Still empty',
      tile_messages_title: 'Go to my messages',
      tile_messages_desc: '{{count}} new',
      tile_messages_empty: 'No new messages',
      tile_sell_title: 'Sell my car',
      tile_sell_desc: 'Listing or valuation',
      my_listings: 'My listings',
      view_all: 'All listings',
      no_listings: 'You have no listings yet',
      add_listing: 'Post a listing',
      login_data: 'Sign-in details',
      email_label: 'Email',
      email_note: 'Your email is used to sign in and cannot be changed here.',
      email_confirmed: 'Active',
      email_change_hint: 'To change your email, first set a new password.',
      email_change_link: 'Change password',
      password_warning: 'After changing your password, other devices will need to sign in again.',
      password_label: 'Password',
      password_value: '••••••••••••',
      change: 'Change',
      add: 'Add',
      current_password: 'Current password',
      new_password: 'New password',
      password_changed: 'Password updated',
      password_not_changed: 'Could not change the password',
      password_fill: 'Fill in both password fields',
      contact_data: 'Contact details',
      name_label: 'Name',
      phone_label: 'Phone',
      city_label: 'City',
      country_label: 'Country',
      select_country: 'Select a country',
      invalid_name: 'Enter a name — letters only',
      invalid_phone: 'Enter a valid phone number',
      invalid_city: 'Enter a city — letters only',
      not_specified: 'Not provided',
      saved: 'Saved',
      documents: 'Documents',
      invoices_title: 'My invoices',
      invoices_desc: 'A summary of the packages and options you paid for',
      show: 'Show',
      hide: 'Hide',
      no_invoices: 'No invoices yet',
      invoice_promotion: 'Listing promotion',
      invoice_meta: 'Meta ads',
      invoice_days: '{{count}} days'
    }
  },
  et: {
    account: {
      title: 'Minu konto seaded',
      subtitle: 'Halda oma kuulutusi, lemmikuid ja profiiliandmeid',
      nav_overview: 'Ülevaade',
      nav_messages: 'Sõnumid',
      group_buying: 'Ostmine',
      group_selling: 'Müümine',
      group_profile: 'Minu profiil',
      nav_searches: 'Minu otsingud',
      nav_favorites: 'Lemmikud',
      nav_history: 'Vaadatud',
      nav_listings: 'Minu kuulutused',
      nav_offers: 'Müüjate pakkumised',
      nav_settings: 'Konto seaded',
      nav_notifications: 'Teavitused',
      edit_profile: 'Muuda',
      greeting: 'Tere {{name}}, mida soovid täna teha?',
      breadcrumb: 'Minu konto',
      tile_search_title: 'Alusta uut otsingut',
      tile_search_desc: '{{count}} kuulutust',
      tile_searches_title: 'Vaata minu otsinguid',
      tile_searches_desc: '{{count}} salvestatud',
      tile_searches_empty: 'Salvestatud otsingud puuduvad',
      tile_favorites_title: 'Vaata lemmikuid',
      tile_favorites_desc: '{{count}} autot salvestatud',
      tile_favorites_empty: 'Veel tühi',
      tile_messages_title: 'Minu sõnumite juurde',
      tile_messages_desc: '{{count}} uut',
      tile_messages_empty: 'Uusi sõnumeid pole',
      tile_sell_title: 'Müü oma auto',
      tile_sell_desc: 'Kuulutus või hindamine',
      my_listings: 'Minu kuulutused',
      view_all: 'Kõik kuulutused',
      no_listings: 'Sul pole veel kuulutusi',
      add_listing: 'Lisa kuulutus',
      login_data: 'Sisselogimise andmed',
      email_label: 'E-post',
      email_note: 'E-posti kasutatakse sisselogimiseks ja seda ei saa siin muuta.',
      email_confirmed: 'Aktiivne',
      email_change_hint: 'E-posti muutmiseks määra esmalt uus parool.',
      email_change_link: 'Muuda parooli',
      password_warning: 'Pärast parooli muutmist tuleb teistes seadmetes uuesti sisse logida.',
      password_label: 'Parool',
      password_value: '••••••••••••',
      change: 'Muuda',
      add: 'Lisa',
      current_password: 'Praegune parool',
      new_password: 'Uus parool',
      password_changed: 'Parool uuendatud',
      password_not_changed: 'Parooli muutmine ebaõnnestus',
      password_fill: 'Täida mõlemad parooliväljad',
      contact_data: 'Kontaktandmed',
      name_label: 'Nimi',
      phone_label: 'Telefon',
      city_label: 'Linn',
      country_label: 'Riik',
      select_country: 'Vali riik',
      invalid_name: 'Sisesta nimi — ainult tähed',
      invalid_phone: 'Sisesta korrektne telefoninumber',
      invalid_city: 'Sisesta linn — ainult tähed',
      not_specified: 'Pole märgitud',
      saved: 'Salvestatud',
      documents: 'Dokumendid',
      invoices_title: 'Minu arved',
      invoices_desc: 'Siin on sinu tasutud paketid ja teenused',
      show: 'Näita',
      hide: 'Peida',
      no_invoices: 'Arveid veel pole',
      invoice_promotion: 'Kuulutuse esiletõstmine',
      invoice_meta: 'Meta reklaam',
      invoice_days: '{{count}} päeva'
    }
  },
  lv: {
    account: {
      title: 'Mani konta iestatījumi',
      subtitle: 'Pārvaldi savus sludinājumus, izlasi un profila datus',
      nav_overview: 'Pārskats',
      nav_messages: 'Ziņas',
      group_buying: 'Pirkšana',
      group_selling: 'Pārdošana',
      group_profile: 'Mans profils',
      nav_searches: 'Mani meklējumi',
      nav_favorites: 'Izlase',
      nav_history: 'Skatītie',
      nav_listings: 'Mani sludinājumi',
      nav_offers: 'Dīleru piedāvājumi',
      nav_settings: 'Konta iestatījumi',
      nav_notifications: 'Paziņojumi',
      edit_profile: 'Labot',
      greeting: 'Sveiki, {{name}}, ko šodien vēlaties darīt?',
      breadcrumb: 'Mans konts',
      tile_search_title: 'Sākt jaunu meklējumu',
      tile_search_desc: '{{count}} sludinājumi',
      tile_searches_title: 'Skatīt manus meklējumus',
      tile_searches_desc: '{{count}} saglabāti',
      tile_searches_empty: 'Nav saglabātu meklējumu',
      tile_favorites_title: 'Skatīt izlasi',
      tile_favorites_desc: '{{count}} auto izlasē',
      tile_favorites_empty: 'Pagaidām tukša',
      tile_messages_title: 'Uz manām ziņām',
      tile_messages_desc: '{{count}} jaunas',
      tile_messages_empty: 'Jaunu ziņu nav',
      tile_sell_title: 'Pārdot automašīnu',
      tile_sell_desc: 'Sludinājums vai novērtējums',
      my_listings: 'Mani sludinājumi',
      view_all: 'Visi sludinājumi',
      no_listings: 'Jums vēl nav sludinājumu',
      add_listing: 'Pievienot sludinājumu',
      login_data: 'Pieteikšanās dati',
      email_label: 'E-pasts',
      email_note: 'E-pasts tiek izmantots pieteikšanās laikā un to šeit nevar mainīt.',
      email_confirmed: 'Aktīvs',
      email_change_hint: 'Lai mainītu e-pastu, vispirms iestatiet jaunu paroli.',
      email_change_link: 'Mainīt paroli',
      password_warning: 'Pēc paroles maiņas citās ierīcēs būs jāpiesakās no jauna.',
      password_label: 'Parole',
      password_value: '••••••••••••',
      change: 'Mainīt',
      add: 'Pievienot',
      current_password: 'Pašreizējā parole',
      new_password: 'Jaunā parole',
      password_changed: 'Parole atjaunināta',
      password_not_changed: 'Paroli neizdevās mainīt',
      password_fill: 'Aizpildiet abus paroles laukus',
      contact_data: 'Kontaktinformācija',
      name_label: 'Vārds',
      phone_label: 'Tālrunis',
      city_label: 'Pilsēta',
      country_label: 'Valsts',
      select_country: 'Izvēlieties valsti',
      invalid_name: 'Ievadiet vārdu — tikai burti',
      invalid_phone: 'Ievadiet pareizu tālruņa numuru',
      invalid_city: 'Ievadiet pilsētu — tikai burti',
      not_specified: 'Nav norādīts',
      saved: 'Saglabāts',
      documents: 'Dokumenti',
      invoices_title: 'Mani rēķini',
      invoices_desc: 'Šeit apkopoti apmaksātie pakalpojumi',
      show: 'Rādīt',
      hide: 'Slēpt',
      no_invoices: 'Rēķinu vēl nav',
      invoice_promotion: 'Sludinājuma izcelšana',
      invoice_meta: 'Meta reklāma',
      invoice_days: '{{count}} dienas'
    }
  },
  lt: {
    account: {
      title: 'Mano paskyros nustatymai',
      subtitle: 'Tvarkykite skelbimus, išsirinktus ir profilio duomenis',
      nav_overview: 'Apžvalga',
      nav_messages: 'Žinutės',
      group_buying: 'Pirkimas',
      group_selling: 'Pardavimas',
      group_profile: 'Mano profilis',
      nav_searches: 'Mano paieškos',
      nav_favorites: 'Išsirinkti',
      nav_history: 'Peržiūrėti',
      nav_listings: 'Mano skelbimai',
      nav_offers: 'Pardavėjų pasiūlymai',
      nav_settings: 'Paskyros nustatymai',
      nav_notifications: 'Pranešimai',
      edit_profile: 'Redaguoti',
      greeting: 'Sveiki, {{name}}, ką norite nuveikti šiandien?',
      breadcrumb: 'Mano paskyra',
      tile_search_title: 'Pradėti naują paiešką',
      tile_search_desc: '{{count}} skelbimų',
      tile_searches_title: 'Peržiūrėti mano paieškas',
      tile_searches_desc: '{{count}} išsaugotos',
      tile_searches_empty: 'Nėra išsaugotų paieškų',
      tile_favorites_title: 'Peržiūrėti išsirinktus',
      tile_favorites_desc: '{{count}} automobiliai išsirinkti',
      tile_favorites_empty: 'Kol kas tuščia',
      tile_messages_title: 'Prie mano žinučių',
      tile_messages_desc: '{{count}} naujos',
      tile_messages_empty: 'Naujų žinučių nėra',
      tile_sell_title: 'Parduoti automobilį',
      tile_sell_desc: 'Skelbimas arba įvertinimas',
      my_listings: 'Mano skelbimai',
      view_all: 'Visi skelbimai',
      no_listings: 'Skelbimų kol kas nėra',
      add_listing: 'Pridėti skelbimą',
      login_data: 'Prisijungimo duomenys',
      email_label: 'El. paštas',
      email_note: 'El. paštas naudojamas prisijungimui ir jo čia pakeisti negalima.',
      email_confirmed: 'Aktyvus',
      email_change_hint: 'Norėdami pakeisti el. paštą, pirmiausia nustatykite naują slaptažodį.',
      email_change_link: 'Keisti slaptažodį',
      password_warning: 'Pakeitus slaptažodį, kituose įrenginiuose reikės prisijungti iš naujo.',
      password_label: 'Slaptažodis',
      password_value: '••••••••••••',
      change: 'Keisti',
      add: 'Pridėti',
      current_password: 'Dabartinis slaptažodis',
      new_password: 'Naujas slaptažodis',
      password_changed: 'Slaptažodis atnaujintas',
      password_not_changed: 'Slaptažodžio pakeisti nepavyko',
      password_fill: 'Užpildykite abu slaptažodžio laukus',
      contact_data: 'Kontaktiniai duomenys',
      name_label: 'Vardas',
      phone_label: 'Telefonas',
      city_label: 'Miestas',
      country_label: 'Šalis',
      select_country: 'Pasirinkite šalį',
      invalid_name: 'Įveskite vardą — tik raidės',
      invalid_phone: 'Įveskite teisingą telefono numerį',
      invalid_city: 'Įveskite miestą — tik raidės',
      not_specified: 'Nenurodyta',
      saved: 'Išsaugota',
      documents: 'Dokumentai',
      invoices_title: 'Mano sąskaitos',
      invoices_desc: 'Čia rasite apmokėtus paketus ir paslaugas',
      show: 'Rodyti',
      hide: 'Slėpti',
      no_invoices: 'Sąskaitų kol kas nėra',
      invoice_promotion: 'Skelbimo iškėlimas',
      invoice_meta: 'Meta reklama',
      invoice_days: '{{count}} dienos'
    }
  }
};

// Блок продавца-дилера в строчном виде каталога
const sellerBlockResources = {
  ru: { sellerBlock: { contact: 'Связаться', save: 'Сохранить', saved: 'Сохранено', reviews: 'отзывов' } },
  en: { sellerBlock: { contact: 'Contact', save: 'Save', saved: 'Saved', reviews: 'reviews' } },
  et: { sellerBlock: { contact: 'Kontakt', save: 'Salvesta', saved: 'Salvestatud', reviews: 'hinnangut' } },
  lv: { sellerBlock: { contact: 'Sazināties', save: 'Saglabāt', saved: 'Saglabāts', reviews: 'atsauksmes' } },
  lt: { sellerBlock: { contact: 'Susisiekti', save: 'Išsaugoti', saved: 'Išsaugota', reviews: 'atsiliepimai' } }
};

const mergedResources = {};
const allLangs = ['ru', 'en', 'et', 'lv', 'lt'];
const deepMerge = (target, ...sources) => {
  const result = { ...target };
  for (const src of sources) {
    for (const key of Object.keys(src || {})) {
      if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key])) {
        result[key] = deepMerge(result[key] || {}, src[key]);
      } else {
        result[key] = src[key];
      }
    }
  }
  return result;
};
for (const lng of allLangs) {
  mergedResources[lng] = {
    translation: deepMerge(
      {},
      bundledTranslations[lng] || {},
      fastSaleTranslations[lng]?.translation || fastSaleTranslations[lng] || {},
      valuationTranslations[lng] || {},
      pricingTranslations[lng] || {},
      pricingReferenceTranslations[lng] || {},
      storyTranslations[lng] || {},
      paginationTranslations[lng] || {},
      promotionTranslations[lng] || {},
      accountResources[lng] || {},
      sellerBlockResources[lng] || {},
      tileTranslations[lng] || {},
      energyTranslations[lng] || {},
      carDetailsTranslations[lng] || {},
      listingCreateTranslations[lng] || {},
      listingCreateRefTranslations[lng] || {},
      caroTranslations[lng] || {},
      advertisingInfoTranslations[lng] || {},
      dashboardRefinementTranslations[lng] || {},
      dealerApplicationTranslations[lng] || {},
      searchRefinementTranslations[lng] || {},
      compareTranslations[lng] || {},
      workspaceTranslations[lng] || {},
      dealerActionsTranslations[lng] || {},
      dealerProfileTranslations[lng] || {},
      dealerEmployeesTranslations[lng] || {},
      dealerTipsTranslations[lng] || {},
      dealerLeadTranslations[lng] || {},
      renewalTranslations[lng] || {},
      promoteMultiTranslations[lng] || {},
      listingStatusTranslations[lng] || {},
      consignmentTranslations[lng] || {},
      viewAsTranslations[lng] || {},
      paymentTranslations[lng] || {},
      authTranslations[lng] || {},
      uiResources[lng] || {},
      { authProvider: {
        en: { continue: 'Continue with {{provider}}', error: 'Unable to sign in with {{provider}}' },
        ru: { continue: 'Продолжить с {{provider}}', error: 'Не удалось войти через {{provider}}' },
        et: { continue: 'Jätka teenusega {{provider}}', error: 'Teenusega {{provider}} sisselogimine ebaõnnestus' },
        lv: { continue: 'Turpināt ar {{provider}}', error: 'Neizdevās pierakstīties ar {{provider}}' },
        lt: { continue: 'Tęsti su {{provider}}', error: 'Nepavyko prisijungti per {{provider}}' }
      }[lng] }
    ),
  };
}

// First visit (nothing saved yet): a browser language the site has wins; otherwise the country
// is guessed from the time zone (Tallinn → et, Riga → lv, Vilnius → lt); otherwise English.
const BALTIC_ZONES = { 'Europe/Tallinn': 'et', 'Europe/Riga': 'lv', 'Europe/Vilnius': 'lt' };
const detector = new LanguageDetector();
detector.addDetector({
  name: 'siteCountry',
  lookup() {
    const langs = (navigator.languages?.length ? navigator.languages : [navigator.language]).filter(Boolean)
      .map((l) => l.slice(0, 2).toLowerCase());
    const native = langs.find((l) => ['ru', 'et', 'lv', 'lt'].includes(l));
    if (native) return native;
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (BALTIC_ZONES[zone]) return BALTIC_ZONES[zone];
    } catch { /* no Intl time zone */ }
    return langs.includes('en') ? 'en' : undefined;
  },
});

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    supportedLngs: allLangs,
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    defaultNS: 'translation',
    resources: mergedResources,
    detection: {
      order: ['localStorage', 'siteCountry', 'navigator'],
      cacheUserLanguage: true,
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;