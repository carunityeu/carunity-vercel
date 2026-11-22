// Notification string translations for all 5 supported languages.
// Used by backend functions to create notifications in the user's preferred language.
// Also mirrored in src/utils/notificationI18n.js for frontend rendering.

const NOTIFICATION_LANGS = ['ru', 'en', 'et', 'lv', 'lt'];

const notificationStrings = {
  car_favorited: {
    ru: { title: 'Ваше объявление добавили в избранное', content: (c) => `Кто-то добавил "${c.carTitle}" в избранное` },
    en: { title: 'Your listing was added to favorites', content: (c) => `Someone added "${c.carTitle}" to favorites` },
    et: { title: 'Teie kuulutuse lisati lemmikuks', content: (c) => `Keegi lisas "${c.carTitle}" lemmikuks` },
    lv: { title: 'Jūsu sludinājumu pievienoja izlasei', content: (c) => `Kāds pievienoja "${c.carTitle}" izlasei` },
    lt: { title: 'Jūsų skelbimą pridėjo prie mėgstamiausių', content: (c) => `Kažkas pridėjo "${c.carTitle}" prie mėgstamiausių` },
  },
  saved_search_match: {
    ru: { title: 'Новые авто по вашему поиску', content: (c) => `Появилось ${c.count} новых авто по поиску "${c.searchName}"` },
    en: { title: 'New cars matching your search', content: (c) => `${c.count} new cars matching your search "${c.searchName}"` },
    et: { title: 'Uued autod vastavad teie otsingule', content: (c) => `Leitud ${c.count} uut autot otsingu "${c.searchName}" jaoks` },
    lv: { title: 'Jaunas automašīnas atbilst jūsu meklēšanai', content: (c) => `Atrastas ${c.count} jaunas automašīnas meklēšanai "${c.searchName}"` },
    lt: { title: 'Nauji automobiliai pagal jūsų paiešką', content: (c) => `Rasta ${c.count} naujų automobilių pagal paiešką "${c.searchName}"` },
  },
  saved_search_match_iolooking: {
    ru: { title: 'Новое авто по вашему запросу', content: (c) => `${c.carTitle} — ${c.price}€ появился по поиску «${c.searchName}»` },
    en: { title: 'New car matching your request', content: (c) => `${c.carTitle} — ${c.price}€ appeared for your search "${c.searchName}"` },
    et: { title: 'Uus auto vastab teie taotlusele', content: (c) => `${c.carTitle} — ${c.price}€ ilmus otsingule "${c.searchName}"` },
    lv: { title: 'Jauna automašīna atbilst jūsu pieprasījumam', content: (c) => `${c.carTitle} — ${c.price}€ parādījās meklēšanai "${c.searchName}"` },
    lt: { title: 'Naujas automobilis pagal jūsų užklausą', content: (c) => `${c.carTitle} — ${c.price}€ pasirodė paieškai "${c.searchName}"` },
  },
  promotion_ending: {
    ru: { title: 'Продвижение скоро закончится', content: (c) => `Продвижение "${c.carTitle}" истекает через ${c.daysLeft} ${c.daysLeft === 1 ? 'день' : 'дня'}` },
    en: { title: 'Promotion ending soon', content: (c) => `Promotion for "${c.carTitle}" expires in ${c.daysLeft} ${c.daysLeft === 1 ? 'day' : 'days'}` },
    et: { title: 'Reklaam lõpeb varsti', content: (c) => `"${c.carTitle}" reklaam lõpeb ${c.daysLeft} ${c.daysLeft === 1 ? 'päeva' : 'päeva'} pärast` },
    lv: { title: 'Reklāma drīz beigsies', content: (c) => `"${c.carTitle}" reklāma beigsies pēc ${c.daysLeft} ${c.daysLeft === 1 ? 'dienas' : 'dienām'}` },
    lt: { title: 'Reklama greitai baigsis', content: (c) => `"${c.carTitle}" reklama baigsis po ${c.daysLeft} ${c.daysLeft === 1 ? 'dienos' : 'dienų'}` },
  },
  promotion_ended: {
    ru: { title: 'Продвижение объявления закончилось', content: (c) => `Продвижение для "${c.carTitle}" завершилось. Продлите продвижение, чтобы получать больше просмотров.` },
    en: { title: 'Listing promotion ended', content: (c) => `Promotion for "${c.carTitle}" has ended. Renew the promotion to get more views.` },
    et: { title: 'Kuulutuse reklaam on lõppenud', content: (c) => `"${c.carTitle}" reklaam on lõppenud. Pikenda reklaami, et saada rohkem vaatamisi.` },
    lv: { title: 'Sludinājuma reklāma beigusies', content: (c) => `"${c.carTitle}" reklāma ir beigusies. Atjaunojiet reklāmu, lai iegūtu vairāk skatījumu.` },
    lt: { title: 'Skelbimo reklama baigėsi', content: (c) => `"${c.carTitle}" reklama baigėsi. Atnaujinkite reklamą, kad gautumėte daugiau peržiūrų.` },
  },
  listing_expiring: {
    ru: { title: 'Машина продана?', content: (c) => `Объявление «${c.carTitle}» заканчивается через ${c.daysLeft} дн. Отметьте продажу или продлите бесплатно — с Boost на 3 дня.` },
    en: { title: 'Has the car been sold?', content: (c) => `"${c.carTitle}" expires in ${c.daysLeft} days. Mark it as sold or renew for free with a 3-day Boost.` },
    et: { title: 'Kas auto on müüdud?', content: (c) => `"${c.carTitle}" aegub ${c.daysLeft} päeva pärast. Märgi müüduks või pikenda tasuta — 3-päevane Boost.` },
    lv: { title: 'Vai automašīna ir pārdota?', content: (c) => `"${c.carTitle}" beigsies pēc ${c.daysLeft} dienām. Atzīmējiet kā pārdotu vai pagariniet bez maksas — 3 dienu Boost.` },
    lt: { title: 'Ar automobilis parduotas?', content: (c) => `"${c.carTitle}" baigsis po ${c.daysLeft} d. Pažymėkite parduotą arba pratęskite nemokamai — 3 dienų Boost.` },
  },
  view_decline: {
    ru: { title: (c) => `${c.carTitle} получает меньше просмотров`, content: (c) => `${c.carTitle} сейчас получает на ${c.declinePercent}% меньше просмотров, чем обычно.` },
    en: { title: (c) => `${c.carTitle} is getting fewer views`, content: (c) => `${c.carTitle} is now getting ${c.declinePercent}% fewer views than usual.` },
    et: { title: (c) => `${c.carTitle} saab vähem vaatamisi`, content: (c) => `${c.carTitle} saab nüüd ${c.declinePercent}% võrra vähem vaatamisi kui tavaliselt.` },
    lv: { title: (c) => `${c.carTitle} saņem mazāk skatījumu`, content: (c) => `${c.carTitle} tagad saņem par ${c.declinePercent}% mazāk skatījumu nekā parasti.` },
    lt: { title: (c) => `${c.carTitle} gauna mažiau peržiūrų`, content: (c) => `${c.carTitle} dabar gauna ${c.declinePercent}% mažiau peržiūrų nei įprastai.` },
  },
  fast_sale_match: {
    ru: { title: 'Новое авто по вашим критериям', content: (c) => `${c.carTitle} — ${c.price || ''}. Новое объявление соответствует вашим критериям покупки.` },
    en: { title: 'New car matches your criteria', content: (c) => `${c.carTitle} — ${c.price || ''}. A new listing matches your purchase criteria.` },
    et: { title: 'Uus auto vastab teie kriteeriumidele', content: (c) => `${c.carTitle} — ${c.price || ''}. Uus kuulutus vastab teie ostukriteeriumidele.` },
    lv: { title: 'Jauna automašīna atbilst jūsu kritērijiem', content: (c) => `${c.carTitle} — ${c.price || ''}. Jauns sludinājums atbilst jūsu pirkšanas kritērijiem.` },
    lt: { title: 'Naujas automobilis atitinka jūsų kriterijus', content: (c) => `${c.carTitle} — ${c.price || ''}. Naujas skelbimas atitinka jūsų pirkimo kriterijus.` },
  },
  new_message: {
    ru: { title: 'Новое сообщение', content: (c) => `У вас новое сообщение от ${c.senderName || 'пользователя'}` },
    en: { title: 'New message', content: (c) => `You have a new message from ${c.senderName || 'a user'}` },
    et: { title: 'Uus sõnum', content: (c) => `Teil on uus sõnum kasutajalt ${c.senderName || 'kasutaja'}` },
    lv: { title: 'Jauns ziņojums', content: (c) => `Jums ir jauns ziņojums no ${c.senderName || 'lietotāja'}` },
    lt: { title: 'Nauja žinutė', content: (c) => `Turite naują žinutę nuo ${c.senderName || 'naudotojo'}` },
  },
  offer_received: {
    ru: { title: 'Новое предложение', content: (c) => `Дилер ${c.dealerName || ''} отправил предложение по вашему авто ${c.carTitle || ''}` },
    en: { title: 'New offer received', content: (c) => `Dealer ${c.dealerName || ''} sent an offer for your car ${c.carTitle || ''}` },
    et: { title: 'Uus pakkumine', content: (c) => `Müüja ${c.dealerName || ''} saatis pakkumise teie autole ${c.carTitle || ''}` },
    lv: { title: 'Jauns piedāvājums', content: (c) => `Pārdevējs ${c.dealerName || ''} nosūtīja piedāvājumu jūsu automašīnai ${c.carTitle || ''}` },
    lt: { title: 'Naujas pasiūlymas', content: (c) => `Pardavėjas ${c.dealerName || ''} atsiuntė pasiūlymą jūsų automobiliui ${c.carTitle || ''}` },
  },
  offer_expired: {
    ru: { title: 'Предложение истекло', content: (c) => `Предложение от ${c.dealerName || 'дилера'} на ${c.carTitle || 'ваше авто'} истекло (прошло 48ч).` },
    en: { title: 'Offer expired', content: (c) => `The offer from ${c.dealerName || 'dealer'} for ${c.carTitle || 'your car'} has expired (48h passed).` },
    et: { title: 'Pakkumine on aegunud', content: (c) => `${c.dealerName || 'müüja'} pakkumine ${c.carTitle || 'teie auto'} on aegunud (48h möödunud).` },
    lv: { title: 'Piedāvājums beidzies', content: (c) => `${c.dealerName || 'pārdevēja'} piedāvājums ${c.carTitle || 'jūsu auto'} ir beidzies (48h pagājušas).` },
    lt: { title: 'Pasiūlymas baigėsi', content: (c) => `${c.dealerName || 'pardavėjo'} pasiūlymas ${c.carTitle || 'jūsų automobiliui'} baigėsi (praėjo 48h).` },
  },
  offer_accepted: {
    ru: { title: 'Предложение принято', content: (c) => `Продавец принял ваше предложение на ${c.carTitle || ''}` },
    en: { title: 'Offer accepted', content: (c) => `The seller accepted your offer for ${c.carTitle || ''}` },
    et: { title: 'Pakkumine vastu võetud', content: (c) => `Müüja võttis vastu teie pakkumise ${c.carTitle || ''}` },
    lv: { title: 'Piedāvājums pieņemts', content: (c) => `Pārdevējs pieņēma jūsu piedāvājumu ${c.carTitle || ''}` },
    lt: { title: 'Pasiūlymas priimtas', content: (c) => `Pardavėjas priėmė jūsų pasiūlymą ${c.carTitle || ''}` },
  },
  price_drop: {
    ru: { title: 'Цена снизилась', content: (c) => `Цена на ${c.carTitle || ''} снизилась на ${c.dropAmount || ''}€` },
    en: { title: 'Price dropped', content: (c) => `Price for ${c.carTitle || ''} dropped by ${c.dropAmount || ''}€` },
    et: { title: 'Hind langes', content: (c) => `${c.carTitle || ''} hind langes ${c.dropAmount || ''}€ võrra` },
    lv: { title: 'Cena samazināta', content: (c) => `${c.carTitle || ''} cena samazināta par ${c.dropAmount || ''}€` },
    lt: { title: 'Kaina sumažėjo', content: (c) => `${c.carTitle || ''} kaina sumažėjo ${c.dropAmount || ''}€` },
  },
  referral_instant: {
    ru: { title: 'Друг зарегистрировался!', content: (c) => `Ваш друг ${c.invitedName || ''} зарегистрировался по вашей ссылке. +${c.bonusDays || ''} дней Premium!` },
    en: { title: 'Friend registered!', content: (c) => `Your friend ${c.invitedName || ''} registered via your referral link. +${c.bonusDays || ''} days Premium bonus!` },
    et: { title: 'Sõber registreerus!', content: (c) => `Teie sõber ${c.invitedName || ''} registreerus teie viitelinki kaudu. +${c.bonusDays || ''} päeva Premium!` },
    lv: { title: 'Draugs reģistrējās!', content: (c) => `Jūsu draugs ${c.invitedName || ''} reģistrējās, izmantojot jūsu atsauces saiti. +${c.bonusDays || ''} dienas Premium!` },
    lt: { title: 'Draugas užsiregistravo!', content: (c) => `Jūsų draugas ${c.invitedName || ''} užsiregistravo per jūsų nuorodą. +${c.bonusDays || ''} dienų Premium!` },
  },
  referral_main: {
    ru: { title: 'Друг выполнил действие!', content: (c) => `Ваш друг ${c.invitedName || ''} ${c.actionType === 'dealer_subscribed' ? 'стал платным дилером' : 'создал объявление'}. +${c.bonusDays || ''} дней Premium!` },
    en: { title: 'Friend completed an action!', content: (c) => `Your friend ${c.invitedName || ''} ${c.actionType === 'dealer_subscribed' ? 'became a paying dealer' : 'created a listing'}. +${c.bonusDays || ''} days Premium bonus!` },
    et: { title: 'Sõber sooritas tegevuse!', content: (c) => `Teie sõber ${c.invitedName || ''} ${c.actionType === 'dealer_subscribed' ? 'sain maksvaks müüjaks' : 'loo kuulutuse'}. +${c.bonusDays || ''} päeva Premium!` },
    lv: { title: 'Draugs veica darbību!', content: (c) => `Jūsu draugs ${c.invitedName || ''} ${c.actionType === 'dealer_subscribed' ? 'kļuva par maksājošu pārdevēju' : 'izveidoja sludinājumu'}. +${c.bonusDays || ''} dienas Premium!` },
    lt: { title: 'Draugas atliko veiksmą!', content: (c) => `Jūsų draugas ${c.invitedName || ''} ${c.actionType === 'dealer_subscribed' ? 'tapo mokančiu pardavėju' : 'sukūrė skelbimą'}. +${c.bonusDays || ''} dienų Premium!` },
  },
};

/**
 * Get a user's preferred language by email.
 * Returns 'ru' as fallback if user not found or no preference set.
 */
export async function getUserPreferredLanguage(base44, email) {
  if (!email) return 'ru';
  try {
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const user = users[0];
    if (user && user.preferred_language && NOTIFICATION_LANGS.includes(user.preferred_language)) {
      return user.preferred_language;
    }
  } catch {
    // fallback to ru
  }
  return 'ru';
}

/**
 * Get translated notification title and content.
 * Uses the notification `type` and `data` context to render in the requested language.
 */
export function getNotificationText(type, lang, ctx) {
  const strSet = notificationStrings[type];
  if (!strSet) return { title: String(ctx.title || ''), content: String(ctx.content || '') };
  const langSet = strSet[lang] || strSet.ru;
  const title = typeof langSet.title === 'function' ? langSet.title(ctx) : langSet.title;
  const content = langSet.content(ctx);
  return { title, content };
}