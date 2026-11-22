const LOGO_URL = 'https://media.base44.com/images/public/6973f00466c3a37f3d8e7e53/fc09a8e55_culogo.png';

// ── Translations for all 5 supported languages ──────────────────────────────
const STRINGS = {
  ru: {
    subject: 'Ваше объявление теперь активно',
    thankYou: 'СПАСИБО',
    title: 'Ваше объявление теперь активно',
    subtitle: 'Вы всегда можете управлять, продлевать или продвигать свои объявления через личный кабинет',
    noPhoto: 'Нет фото',
    colService: 'Услуга',
    colAmount: 'Кол-во',
    colPrice: 'Цена',
    baseListing: 'Базовое размещение',
    topSpot: 'TOP Spot',
    boost: 'Boost',
    targeting: 'Таргет',
    days: (n) => `${n} дн.`,
    subtotal: 'Подытог',
    vat: 'НДС (24%)',
    total: 'Итого',
    editPrompt: 'Хотите отредактировать объявление?',
    editSubtitle: 'Управляйте всеми данными через личный кабинет.',
    dashboardBtn: 'Мой кабинет',
  },
  en: {
    subject: 'Your listing is now active',
    thankYou: 'THANK YOU',
    title: 'Your listing is now active',
    subtitle: 'You can always manage, extend or promote your listings using personal dashboard',
    noPhoto: 'No photo',
    colService: 'Service',
    colAmount: 'Amount',
    colPrice: 'Price',
    baseListing: 'Base listing',
    topSpot: 'Top spot',
    boost: 'Boost',
    targeting: 'Targeting',
    days: (n) => `${n} days`,
    subtotal: 'Subtotal',
    vat: 'VAT (24%)',
    total: 'Total',
    editPrompt: 'Want to edit your listing?',
    editSubtitle: 'Manage all your data with personal dashboard.',
    dashboardBtn: 'My Dashboard',
  },
  et: {
    subject: 'Teie kuulutus on nüüd aktiivne',
    thankYou: 'TÄNAN TEID',
    title: 'Teie kuulutus on nüüd aktiivne',
    subtitle: 'Saate alati hallata, pikendada või reklaamida oma kuulutusi isikliku armatuurlaua kaudu',
    noPhoto: 'Pilti pole',
    colService: 'Teenus',
    colAmount: 'Kogus',
    colPrice: 'Hind',
    baseListing: 'Baaskuulutus',
    topSpot: 'TOP Spot',
    boost: 'Boost',
    targeting: 'Sihtimine',
    days: (n) => `${n} päeva`,
    subtotal: 'Vahesumma',
    vat: 'Käibemaks (24%)',
    total: 'Kokku',
    editPrompt: 'Kas soovite kuulutust muuta?',
    editSubtitle: 'Hallake kõiki oma andmeid isikliku armatuurlauaga.',
    dashboardBtn: 'Minu armatuurlaud',
  },
  lv: {
    subject: 'Jūsu sludinājums ir aktīvs',
    thankYou: 'PALDIES',
    title: 'Jūsu sludinājums ir aktīvs',
    subtitle: 'Vienmēr varat pārvaldīt, pagarināt vai veicināt savus sludinājumus, izmantojot personīgo paneli',
    noPhoto: 'Nav foto',
    colService: 'Pakalpojums',
    colAmount: 'Daudzums',
    colPrice: 'Cena',
    baseListing: 'Pamata sludinājums',
    topSpot: 'TOP Spot',
    boost: 'Boost',
    targeting: 'Mērķēšana',
    days: (n) => `${n} dienas`,
    subtotal: 'Starpsumma',
    vat: 'PVN (24%)',
    total: 'Kopā',
    editPrompt: 'Vai vēlaties rediģēt sludinājumu?',
    editSubtitle: 'Pārvaldiet visus savus datus ar personīgo paneli.',
    dashboardBtn: 'Mans panelis',
  },
  lt: {
    subject: 'Jūsų skelbimas dabar aktyvus',
    thankYou: 'AČIŪ',
    title: 'Jūsų skelbimas dabar aktyvus',
    subtitle: 'Visada galite tvarkyti, pratęsti ar reklamuoti savo skelbimus asmeninėje sąskaitoje',
    noPhoto: 'Nėra nuotraukos',
    colService: 'Paslauga',
    colAmount: 'Kiekis',
    colPrice: 'Kaina',
    baseListing: 'Bazinis skelbimas',
    topSpot: 'TOP Spot',
    boost: 'Boost',
    targeting: 'Taikymas',
    days: (n) => `${n} dienos`,
    subtotal: 'Tarpinė suma',
    vat: 'PVM (24%)',
    total: 'Iš viso',
    editPrompt: 'Norite redaguoti skelbimą?',
    editSubtitle: 'Tvarkykite visus savo duomenis asmenine sąskaita.',
    dashboardBtn: 'Mano sąskaita',
  },
};

/**
 * Generates the HTML for the "Your listing is now active" confirmation email.
 * Design adapted from Figma export — converted from absolute positioning to
 * a responsive table-based email layout for mail-client compatibility.
 *
 * @param {Object} params
 * @param {string} params.lang          — 'ru' | 'en' | 'et' | 'lv' | 'lt' (default 'ru')
 * @param {string} params.carTitle      — e.g. "Alfa Romeo Giulia 2020"
 * @param {string|null} params.carImage — first listing image URL or null
 * @param {string} params.listingUrl    — full public URL to the listing
 * @param {string} params.dashboardUrl  — full URL to the user dashboard
 * @param {Array<{service:string,amount:string,price:string}>} params.items
 * @param {string} params.subtotal      — formatted "86.27€"
 * @param {string} params.vat            — formatted "20.71€"
 * @param {string} params.total          — formatted "106.98€"
 * @returns {string} full HTML document
 */
export function generateListingConfirmationEmail({ lang = 'ru', carTitle, carImage, listingUrl, dashboardUrl, items, subtotal, vat, total }) {
  const L = STRINGS[lang] || STRINGS.ru;

  const itemRows = items.map(item => (
    `      <tr>
        <td style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#CCCCCC;padding:7px 0;">${item.service}</td>
        <td align="center" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#CCCCCC;padding:7px 0;">${item.amount}</td>
        <td align="right" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#CCCCCC;padding:7px 0;">${item.price}</td>
      </tr>`
  )).join('\n');

  const imageBlock = carImage
    ? `<a href="${listingUrl}" target="_blank"><img src="${carImage}" alt="${carTitle}" class="car-img" style="width:100%;max-width:553px;height:auto;border-radius:24px;border:1px solid rgba(255,255,255,0.1);display:block;" /></a>`
    : `<a href="${listingUrl}" target="_blank"><div class="car-img" style="width:100%;max-width:553px;height:220px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);background:#1b1b22;display:flex;align-items:center;justify-content:center;text-decoration:none;"><span style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:16px;color:rgba(255,255,255,0.4);">${L.noPhoto}</span></div></a>`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${L.subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @media only screen and (max-width:600px){
    .email-title{font-size:28px!important;}
    .email-inner{padding:12px 10px!important;}
    .receipt-table td{font-size:13px!important;padding:5px 0!important;}
    .car-img{border-radius:18px!important;}
    .dash-btn{padding:12px 28px!important;font-size:16px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#0F172A;font-family:'Inter',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0F172A;">
<tr><td align="center" style="padding:24px 0;">
<table role="presentation" class="email-inner" width="675" cellpadding="0" cellspacing="0" style="max-width:675px;width:100%;">

  <!-- Logo -->
  <tr><td align="center" style="padding:16px 0 28px;">
    <img src="${LOGO_URL}" alt="CarUnity" style="height:40px;width:auto;border:0;" />
  </td></tr>

  <!-- THANK YOU -->
  <tr><td align="center" style="padding:0 16px 6px;">
    <span style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;color:#01B980;letter-spacing:0.08em;">${L.thankYou}</span>
  </td></tr>

  <!-- Title -->
  <tr><td align="center" style="padding:0 16px 10px;">
    <h1 class="email-title" style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:36px;font-weight:600;color:#FFFFFF;line-height:1.1;">${L.title}</h1>
  </td></tr>

  <!-- Subtitle -->
  <tr><td align="center" style="padding:0 20px 28px;">
    <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;color:#CCCCCC;line-height:1.4;">${L.subtitle}</p>
  </td></tr>

  <!-- Car image -->
  <tr><td align="center" style="padding:0 16px 24px;">
    ${imageBlock}
  </td></tr>

  <!-- Car title -->
  <tr><td align="center" style="padding:0 16px 28px;">
    <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:20px;font-weight:500;color:#FFFFFF;">${carTitle}</p>
  </td></tr>

  <!-- Receipt -->
  <tr><td style="padding:0 16px 32px;">
    <table role="presentation" class="receipt-table" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;padding:0 0 10px;">${L.colService}</td>
        <td align="center" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;padding:0 0 10px;">${L.colAmount}</td>
        <td align="right" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;padding:0 0 10px;">${L.colPrice}</td>
      </tr>
${itemRows}
      <!-- Faint divider -->
      <tr><td colspan="3" style="border-top:1px solid rgba(1,185,128,0.12);padding:0;line-height:0;font-size:0;">&nbsp;</td></tr>
      <!-- Subtotal -->
      <tr>
        <td style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#CCCCCC;padding:8px 0 0;">${L.subtotal}</td>
        <td></td>
        <td align="right" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#CCCCCC;padding:8px 0 0;">${subtotal}</td>
      </tr>
      <!-- VAT -->
      <tr>
        <td style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#CCCCCC;padding:4px 0;">${L.vat}</td>
        <td></td>
        <td align="right" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#CCCCCC;padding:4px 0;">${vat}</td>
      </tr>
      <!-- Total -->
      <tr>
        <td style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#FFFFFF;padding:4px 0;">${L.total}</td>
        <td></td>
        <td align="right" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:800;color:#FFFFFF;padding:4px 0;">${total}</td>
      </tr>
      <!-- Strong divider -->
      <tr><td colspan="3" style="border-top:1.5px solid rgba(1,185,128,0.45);padding:0;line-height:0;font-size:0;">&nbsp;</td></tr>
    </table>
  </td></tr>

  <!-- Edit section -->
  <tr><td align="center" style="padding:0 16px 4px;">
    <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:18px;font-weight:400;color:#01B980;">${L.editPrompt}</p>
  </td></tr>
  <tr><td align="center" style="padding:0 16px 20px;">
    <p style="margin:0;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:16px;color:#CCCCCC;">${L.editSubtitle}</p>
  </td></tr>

  <!-- Dashboard button -->
  <tr><td align="center" style="padding:0 16px 40px;">
    <a href="${dashboardUrl}" target="_blank" class="dash-btn" style="display:inline-block;background:#01B980;color:#FFFFFF;padding:14px 40px;border-radius:13px;font-family:'Inter',Helvetica,Arial,sans-serif;font-size:18px;font-weight:600;text-decoration:none;">${L.dashboardBtn} &#8594;</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:0 16px 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;">
      <tr>
        <td style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;color:#CCCCCC;white-space:nowrap;">
          <img src="${LOGO_URL}" alt="" style="height:24px;width:auto;border:0;vertical-align:middle;margin-right:8px;" />Carunity O&Uuml;
        </td>
        <td align="right" style="font-family:'Inter',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;color:#CCCCCC;white-space:nowrap;">
          <a href="mailto:info@carunity.eu" style="color:#CCCCCC;text-decoration:none;">info@carunity.eu</a>
        </td>
      </tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Helper: build localized email item labels for the receipt */
export function getListingEmailItemLabels(lang) {
  const L = STRINGS[lang] || STRINGS.ru;
  return {
    baseListing: L.baseListing,
    topSpot: L.topSpot,
    boost: L.boost,
    targeting: L.targeting,
    days: L.days,
  };
}

/** Helper: get localized email subject */
export function getListingEmailSubject(lang) {
  const L = STRINGS[lang] || STRINGS.ru;
  return L.subject;
}