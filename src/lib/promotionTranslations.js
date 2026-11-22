const keys = ['title','premium_until_short','premium_until','active_now','not_active','not_active_desc','platform_section','boost_title','boost_desc','best_value','max_reach','days_word','top_spot_badge','top_spot_desc','total','will_extend','processing','pay_activate','instant_activate','success_title','success_toast','error_toast','done'];
const metaKeys = ['section_title','section_desc','popular','meta_budget_label','success_toast','error_toast','success_title','meta_budget','platform_active','active_until','fulfillment_note','service_fee','processing','order_activate','fulfillment_hint'];
const pickerKeys = ['picker_title','picker_deselect_all','picker_select_all','picker_no_cars','picker_loading','picker_selected_count','picker_promote_selected'];
const rows = {
  en: [
    ['Promote listing','Premium','Premium until','Premium active','Promotion not active','Select options below to boost your listing','On platform','Boost','Moves your listing to the top of search results. More days mean better value.','Best value','Max','days','Top position','Premium placement for 7 days at the top of the catalog','Total','Days will be added to your current promotion','Activating...','Pay & activate','Activated instantly after payment','Promotion activated!','Promotion activated!','Unable to activate promotion','Done'],
    ['Facebook & Instagram ads','We will set up and run ads for your car on Facebook and Instagram to reach potential buyers across the Baltics.','Popular','Meta advertising','Order received! Ads will launch within 24 hours.','Unable to place order','Order received!','Meta Ads budget','Platform promotion activated','Active until','Our team will set up and launch your Facebook and Instagram ads within 24 hours. You will receive a launch notification.','service','Placing order...','Order & activate','Platform promotion activates immediately; Meta ads launch within 24 hours'],
    ['Promote listings','Deselect all','Select all','You have no active listings','Loading view trends...','Selected: {{count}}','Promote selected']
  ],
  ru: [
    ['Продвинуть объявление','Премиум','Премиум до','Премиум активен','Продвижение не активно','Выберите опции ниже, чтобы поднять объявление','На платформе','Буст','Поднимает объявление в топ списка и поиска. Чем больше дней, тем выгоднее.','Выгодно','Макс','дней','Топ позиция','Премиум размещение на 7 дней в самом верху каталога','Итого','Дни добавятся к текущему продвижению','Активация...','Оплатить и активировать','Активируется мгновенно после оплаты','Продвижение активировано!','Продвижение активировано!','Ошибка при активации продвижения','Готово'],
    ['Реклама в Facebook и Instagram','Мы настроим и запустим рекламу вашего автомобиля в Facebook и Instagram для потенциальных покупателей в Балтии.','Популярный','реклама в Meta','Заказ принят! Реклама будет запущена в течение 24 часов.','Ошибка при оформлении заказа','Заказ принят!','Бюджет Meta Ads','Продвижение на платформе активировано','Активно до','Наша команда настроит и запустит рекламу в Facebook и Instagram в течение 24 часов. Вы получите уведомление о запуске.','услуга','Оформление...','Заказать и активировать','Продвижение на платформе активируется сразу, реклама в Meta в течение 24 часов'],
    ['Продвижение объявлений','Снять выделение','Выбрать все','У вас нет активных объявлений','Загрузка динамики просмотров...','Выбрано: {{count}}','Продвинуть выбранные']
  ],
  et: [
    ['Reklaami kuulutust','Premium','Premium kuni','Premium on aktiivne','Reklaamimine pole aktiivne','Vali allpool kuulutuse esiletõstmise võimalused','Platvormil','Boost','Tõstab kuulutuse otsingutulemuste tippu. Rohkem päevi tähendab soodsamat hinda.','Parim hind','Maks','päeva','Tipppositsioon','Premium-paigutus 7 päevaks kataloogi tippu','Kokku','Päevad lisatakse praegusele reklaamiperioodile','Aktiveerimine...','Maksa ja aktiveeri','Aktiveerub kohe pärast maksmist','Reklaamimine aktiveeritud!','Reklaamimine aktiveeritud!','Reklaamimise aktiveerimine ebaõnnestus','Valmis'],
    ['Facebooki ja Instagrami reklaamid','Seadistame ja käivitame sinu auto reklaamid Facebookis ja Instagramis, et jõuda ostjateni kogu Baltikumis.','Populaarne','Meta reklaam','Tellimus vastu võetud! Reklaamid käivituvad 24 tunni jooksul.','Tellimuse esitamine ebaõnnestus','Tellimus vastu võetud!','Meta Ads eelarve','Platvormi reklaamimine aktiveeritud','Aktiivne kuni','Meie meeskond seadistab ja käivitab Facebooki ja Instagrami reklaamid 24 tunni jooksul. Saad käivitamise kohta teavituse.','teenus','Tellimuse esitamine...','Telli ja aktiveeri','Platvormi reklaam aktiveerub kohe, Meta reklaamid käivituvad 24 tunni jooksul'],
    ['Kuulutuste reklaamimine','Tühista valik','Vali kõik','Sul pole aktiivseid kuulutusi','Vaatamiste trendide laadimine...','Valitud: {{count}}','Reklaami valitud kuulutusi']
  ],
  lv: [
    ['Reklamēt sludinājumu','Premium','Premium līdz','Premium ir aktīvs','Reklāma nav aktīva','Izvēlies sludinājuma izcelšanas iespējas zemāk','Platformā','Boost','Paceļ sludinājumu meklēšanas rezultātu augšgalā. Vairāk dienu nozīmē izdevīgāku cenu.','Izdevīgi','Maks.','dienas','Augstākā pozīcija','Premium izvietojums uz 7 dienām kataloga augšgalā','Kopā','Dienas tiks pievienotas pašreizējai reklāmai','Aktivizēšana...','Maksāt un aktivizēt','Aktivizējas uzreiz pēc apmaksas','Reklāma aktivizēta!','Reklāma aktivizēta!','Neizdevās aktivizēt reklāmu','Gatavs'],
    ['Facebook un Instagram reklāmas','Mēs iestatīsim un palaidīsim tava auto reklāmas Facebook un Instagram, lai sasniegtu pircējus Baltijā.','Populārs','Meta reklāma','Pasūtījums saņemts! Reklāma tiks palaista 24 stundu laikā.','Neizdevās veikt pasūtījumu','Pasūtījums saņemts!','Meta Ads budžets','Reklāma platformā aktivizēta','Aktīvs līdz','Mūsu komanda iestatīs un palaidīs Facebook un Instagram reklāmas 24 stundu laikā. Saņemsi paziņojumu par palaišanu.','pakalpojums','Pasūtījuma noformēšana...','Pasūtīt un aktivizēt','Reklāma platformā aktivizējas uzreiz, Meta reklāmas tiek palaistas 24 stundu laikā'],
    ['Sludinājumu reklamēšana','Atcelt atlasi','Atlasīt visus','Nav aktīvu sludinājumu','Ielādē skatījumu tendences...','Atlasīts: {{count}}','Reklamēt atlasītos']
  ],
  lt: [
    ['Reklamuoti skelbimą','Premium','Premium iki','Premium aktyvus','Reklama neaktyvi','Žemiau pasirink skelbimo iškėlimo parinktis','Platformoje','Boost','Iškelia skelbimą į paieškos rezultatų viršų. Daugiau dienų reiškia geresnę kainą.','Geriausia kaina','Maks.','dienų','Aukščiausia pozicija','Premium vieta 7 dienoms katalogo viršuje','Iš viso','Dienos bus pridėtos prie dabartinės reklamos','Aktyvinama...','Mokėti ir aktyvinti','Aktyvinama iškart po apmokėjimo','Reklama aktyvinta!','Reklama aktyvinta!','Nepavyko aktyvinti reklamos','Atlikta'],
    ['Facebook ir Instagram reklama','Nustatysime ir paleisime tavo automobilio reklamą Facebook ir Instagram, kad pasiektume pirkėjus Baltijos šalyse.','Populiaru','Meta reklama','Užsakymas gautas! Reklama bus paleista per 24 valandas.','Nepavyko pateikti užsakymo','Užsakymas gautas!','Meta Ads biudžetas','Reklama platformoje aktyvinta','Aktyvu iki','Mūsų komanda nustatys ir paleis Facebook ir Instagram reklamą per 24 valandas. Gausi pranešimą apie paleidimą.','paslauga','Pateikiamas užsakymas...','Užsakyti ir aktyvinti','Reklama platformoje aktyvinama iškart, Meta reklama paleidžiama per 24 valandas'],
    ['Skelbimų reklamavimas','Atšaukti pasirinkimą','Pasirinkti visus','Neturi aktyvių skelbimų','Įkeliamos peržiūrų tendencijos...','Pasirinkta: {{count}}','Reklamuoti pasirinktus']
  ]
};
const map = (names, values) => Object.fromEntries(names.map((key, index) => [key, values[index]]));
const dayForms = {
  en: { days_one: 'day', days_other: 'days' },
  ru: { days_one: 'день', days_few: 'дня', days_many: 'дней', days_other: 'дня' },
  et: { days_one: 'päev', days_other: 'päeva' },
  lv: { days_zero: 'dienu', days_one: 'diena', days_other: 'dienas' },
  lt: { days_one: 'diena', days_few: 'dienos', days_many: 'dienos', days_other: 'dienų' }
};
export const promotionTranslations = Object.fromEntries(Object.entries(rows).map(([lang, [promote, meta, picker]]) => [lang, {
  promote: { ...map(keys, promote), ...dayForms[lang] },
  meta_ads: map(metaKeys, meta),
  view_decline: map(pickerKeys, picker)
}]));