import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
'@/components/ui/accordion';
import {
  Search,
  HelpCircle,
  Car,
  CreditCard,
  Shield,
  User,
  Building2,
  MessageSquare,
  Mail,
  Sparkles,
  Loader2 } from
'lucide-react';

import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import helpAssistantLabels from '@/lib/helpAssistantLabels';
import { Link } from 'react-router-dom';

const categoryIcons = {
  buying: Car,
  selling: CreditCard,
  account: User,
  dealers: Building2,
  safety: Shield,
  payments: CreditCard
};

const CONTENT = {
  ru: {
    hero_title: 'Центр помощи',
    hero_subtitle: 'Найдите ответы на часто задаваемые вопросы',
    search_placeholder: 'Поиск по вопросам...',
    search_results: 'Результаты поиска',
    not_found: 'Ничего не найдено. Попробуйте другой запрос.',
    ai_fallback: 'Готового ответа нет — отвечает ИИ',
    contact_title: 'Не нашли ответ?',
    contact_subtitle: 'Свяжитесь с нашей командой поддержки — мы поможем!',
    chat_label: 'Онлайн-чат',
    chat_hours: 'Пн–Пт, 9:00–18:00',
    categories: {
      buying: { title: 'Покупка', desc: 'Как покупать автомобили' },
      selling: { title: 'Продажа', desc: 'Как продавать автомобили' },
      account: { title: 'Аккаунт', desc: 'Управление профилем' },
      dealers: { title: 'Дилеры', desc: 'Для автосалонов' },
      safety: { title: 'Безопасность', desc: 'Защита сделок' },
      payments: { title: 'Оплата', desc: 'Платежи и тарифы' }
    },
    faq: {
      buying: [
      { q: 'Как найти подходящий автомобиль?', a: 'Используйте фильтры в каталоге — марка, модель, цена, год, тип топлива и другие параметры помогут сузить поиск до нужных вариантов.' },
      { q: 'Как связаться с продавцом?', a: 'На странице объявления нажмите «Написать» или «Позвонить». Все переписки хранятся в разделе «Сообщения» вашего аккаунта.' },
      { q: 'Как сохранить понравившееся объявление?', a: 'Нажмите на значок сердечка на карточке или странице объявления — автомобиль добавится в «Избранное».' },
      { q: 'Как проверить историю автомобиля?', a: 'На странице объявления доступна история обслуживания, если продавец её указал. Также рекомендуем запросить VIN-проверку.' }],

      selling: [
      { q: 'Как разместить объявление?', a: 'Нажмите «Разместить объявление», выберите тип транспорта, заполните форму и загрузите фотографии. Объявление появится после проверки.' },
      { q: 'Сколько стоит размещение?', a: 'Базовое размещение: 1 объявление на 30 дней — 9.99€. Дополнительную информацию о тарифах вы можете найти на сайте в разделе «Тарифы».' },
      { q: 'Как редактировать объявление?', a: 'Зайдите в «Мои объявления» в личном кабинете и нажмите «Редактировать» рядом с нужным.' },
      { q: 'Как пометить автомобиль как проданный?', a: 'В личном кабинете откройте объявление и нажмите «Отметить как проданное».' }],

      account: [
      { q: 'Как зарегистрироваться?', a: 'Нажмите «Войти» в правом верхнем углу и следуйте инструкциям. Для регистрации используйте email или аккаунт Google.' },
      { q: 'Как изменить данные профиля?', a: 'Зайдите в «Настройки» → «Профиль» и обновите нужные данные.' },
      { q: 'Как восстановить пароль?', a: 'На странице входа нажмите «Забыли пароль?» и следуйте инструкциям на email.' },
      { q: 'Как удалить аккаунт?', a: 'Напишите нам на support@carunity.eu с темой «Удаление аккаунта» — мы обработаем запрос в течение 5 рабочих дней.' }],

      dealers: [
      { q: 'Какие преимущества у дилерского аккаунта?', a: 'Дилеры получают расширенную аналитику, управление объявлениями, приоритетный показ и CRM-инструменты.' },
      { q: 'Какие тарифы для дилеров?', a: 'Мы предлагаем три тарифа: Starter, Pro и Premium. Подробности — на странице тарифов для дилеров. Также мы можем подобрать индивидуальное предложение — свяжитесь с нами.' },
      { q: 'Как продвигать объявления?', a: 'В разделе «Реклама» доступны платные инструменты: выделение в каталоге, приоритетный показ и баннерная реклама.' },
      { q: 'В каких странах работает CarUnity?', a: 'Платформа охватывает Литву, Латвию и Эстонию — единый маркетплейс для всего балтийского региона.' }],

      safety: [
      { q: 'Как убедиться в надёжности продавца?', a: 'Обращайте внимание на отзывы, рейтинг и значок верификации продавца. Дилеры проходят дополнительную проверку.' },
      { q: 'Что делать при мошенничестве?', a: 'Немедленно нажмите «Пожаловаться» на странице объявления и напишите нам на support@carunity.eu.' },
      { q: 'Как безопасно передать деньги?', a: 'Рекомендуем встречаться лично, осматривать автомобиль и использовать банковский перевод. Никогда не переводите деньги без осмотра.' }],

      payments: [
      { q: 'Сколько стоят размещения?', a: 'Базовое размещение: 1 объявление на 30 дней — 9.99€. Дополнительную информацию о тарифах и продвижении вы можете найти на сайте в разделе «Тарифы».' },
      { q: 'Можно ли получить возврат?', a: 'Возврат возможен в случае технической ошибки платформы, повторного списания платежа либо если оплаченная услуга фактически не была активирована. После активации объявления возврат не осуществляется.' },
      { q: 'Какие способы оплаты доступны?', a: 'Мы принимаем Apple Pay, Google Pay, Visa, Mastercard, а также банковские переводы для корпоративных клиентов.' }]

    }
  },
  en: {
    hero_title: 'Help Center',
    hero_subtitle: 'Find answers to frequently asked questions',
    search_placeholder: 'Search questions...',
    search_results: 'Search results',
    not_found: 'Nothing found. Try a different query.',
    ai_fallback: 'No ready answer found — the AI answers',
    contact_title: "Didn't find an answer?",
    contact_subtitle: 'Contact our support team — we are happy to help!',
    chat_label: 'Live Chat',
    chat_hours: 'Mon–Fri, 9:00–18:00',
    categories: {
      buying: { title: 'Buying', desc: 'How to buy cars' },
      selling: { title: 'Selling', desc: 'How to sell cars' },
      account: { title: 'Account', desc: 'Profile management' },
      dealers: { title: 'Dealers', desc: 'For car dealerships' },
      safety: { title: 'Safety', desc: 'Transaction safety' },
      payments: { title: 'Payments', desc: 'Payments & plans' }
    },
    faq: {
      buying: [
      { q: 'How do I find the right car?', a: 'Use the catalog filters — make, model, price, year, fuel type and other parameters will help narrow down your search.' },
      { q: 'How do I contact a seller?', a: 'On the listing page, click "Message" or "Call". All conversations are stored in the "Messages" section of your account.' },
      { q: 'How do I save a listing?', a: 'Click the heart icon on the card or listing page — the car will be added to "Favorites".' },
      { q: 'How do I check a car\'s history?', a: 'Service history is available on the listing page if provided by the seller. We also recommend requesting a VIN check.' }],

      selling: [
      { q: 'How do I post a listing?', a: 'Click "Post a listing", choose the vehicle type, fill in the form and upload photos. The listing will appear after review.' },
      { q: 'How much does listing cost?', a: 'Basic listing: 1 ad for 30 days — 9.99€. You can find more information about pricing on the website under "Pricing".' },
      { q: 'How do I edit my listing?', a: 'Go to "My Listings" in your dashboard and click "Edit" next to the desired listing.' },
      { q: 'How do I mark a car as sold?', a: 'In your dashboard, open the listing and click "Mark as Sold".' }],

      account: [
      { q: 'How do I register?', a: 'Click "Sign In" in the top right corner and follow the instructions. Register with email or a Google account.' },
      { q: 'How do I update my profile?', a: 'Go to Settings → Profile and update the required information.' },
      { q: 'How do I reset my password?', a: 'On the login page, click "Forgot password?" and follow the instructions sent to your email.' },
      { q: 'How do I delete my account?', a: 'Email us at support@carunity.eu with the subject "Account deletion" — we will process your request within 5 business days.' }],

      dealers: [
      { q: 'What are the benefits of a dealer account?', a: 'Dealers get advanced analytics, listing management, priority display and CRM tools.' },
      { q: 'What plans are available for dealers?', a: 'We offer three plans: Starter, Pro and Premium. Details are on the dealer pricing page. We can also provide a custom offer — contact us.' },
      { q: 'How do I promote my listings?', a: 'In the Advertising section, paid tools are available: catalog highlighting, priority display and banner ads.' },
      { q: 'Which countries does CarUnity operate in?', a: 'The platform covers Lithuania, Latvia and Estonia — a single marketplace for the entire Baltic region.' }],

      safety: [
      { q: 'How do I verify a seller?', a: 'Check reviews, ratings and the verified badge. Dealers go through additional verification.' },
      { q: 'What should I do about fraud?', a: 'Click "Report" on the listing page immediately and email us at support@carunity.eu.' },
      { q: 'How do I transfer money safely?', a: 'We recommend meeting in person, inspecting the car and using bank transfer. Never send money without inspection.' }],

      payments: [
      { q: 'How much does listing cost?', a: 'Basic listing: 1 ad for 30 days — 9.99€. You can find more information about pricing on the website under "Pricing".' },
      { q: 'Can I get a refund?', a: 'Refunds are only possible in case of a platform technical error, duplicate charge, or if the paid service was not activated. After a listing is activated, no refund is issued.' },
      { q: 'What payment methods are available?', a: 'We accept Apple Pay, Google Pay, Visa, Mastercard and bank transfers for corporate clients.' }]

    }
  },
  et: {
    hero_title: 'Abikas',
    hero_subtitle: 'Leia vastused korduma kippuvatele küsimustele',
    search_placeholder: 'Otsi küsimusi...',
    search_results: 'Otsingutulemused',
    not_found: 'Midagi ei leitud. Proovi teist päringut.',
    ai_fallback: 'Valmis vastust ei leitud — vastab AI',
    contact_title: 'Ei leidnud vastust?',
    contact_subtitle: 'Võta ühendust meie tugimeeskonnaga — aitame meeleldi!',
    chat_label: 'Live-vestlus',
    chat_hours: 'E–R, 9:00–18:00',
    categories: {
      buying: { title: 'Ostmine', desc: 'Kuidas autosid osta' },
      selling: { title: 'Müümine', desc: 'Kuidas autosid müüa' },
      account: { title: 'Konto', desc: 'Profiili haldus' },
      dealers: { title: 'Edasimüüjad', desc: 'Autoesinduste jaoks' },
      safety: { title: 'Turvalisus', desc: 'Tehingute turvalisus' },
      payments: { title: 'Maksed', desc: 'Maksed ja hinnaplaanid' }
    },
    faq: {
      buying: [
      { q: 'Kuidas leida sobiv auto?', a: 'Kasuta kataloogi filtreid — mark, mudel, hind, aasta, kütuse tüüp aitavad otsingut kitsendada.' },
      { q: 'Kuidas müüjaga ühendust võtta?', a: 'Klõpsa kuulutuse lehel "Kirjuta" või "Helista". Kõik vestlused salvestatakse konto jaotises "Sõnumid".' },
      { q: 'Kuidas kuulutust salvestada?', a: 'Klõpsa südame ikoonil — auto lisatakse "Lemmikutesse".' },
      { q: 'Kuidas kontrollida auto ajalugu?', a: 'Kuulutuse lehel on hooldusajalugu saadaval, kui müüja selle on lisanud. Soovitame ka VIN-kontrolli.' }],

      selling: [
      { q: 'Kuidas kuulutust lisada?', a: 'Klõpsa "Lisa kuulutus", vali sõiduki tüüp, täida vorm ja laadi üles fotod. Kuulutus ilmub pärast kontrollimist.' },
      { q: 'Kui palju maksab kuulutus?', a: 'Põhikuulutus: 1 kuulutus 30 päevaks — 9.99€. Lisateavet hindade kohta leiad veebisaidilt jaotisest "Hinnakirjad".' },
      { q: 'Kuidas kuulutust muuta?', a: 'Mine "Minu kuulutused" ja klõpsa "Muuda".' },
      { q: 'Kuidas märkida auto müüduks?', a: 'Ava kuulutus ja klõpsa "Märgi müüduks".' }],

      account: [
      { q: 'Kuidas registreeruda?', a: 'Klõpsa paremas ülanurgas "Logi sisse" ja järgi juhiseid. Kasuta e-posti või Google\'i kontot.' },
      { q: 'Kuidas profiili andmeid muuta?', a: 'Mine Seaded → Profiil ja uuenda vajalikud andmed.' },
      { q: 'Kuidas parooli taastada?', a: 'Klõpsa sisselogimislehel "Unustasid parooli?" ja järgi e-postile saadetud juhiseid.' },
      { q: 'Kuidas kontot kustutada?', a: 'Saada e-kiri aadressile support@carunity.eu teemaga "Konto kustutamine" — käsitleme taotlust 5 tööpäeva jooksul.' }],

      dealers: [
      { q: 'Millised on edasimüüja konto eelised?', a: 'Edasimüüjad saavad täiustatud analüütika, kuulutuste halduse, prioriteetse kuvamise ja CRM-tööriistad.' },
      { q: 'Millised hinnaplaanid on edasimüüjatele?', a: 'Pakume kolme plaani: Starter, Pro ja Premium. Üksikasjad leiad edasimüüjate hinnalehelt. Saame pakkuda ka individuaalset pakkumist.' },
      { q: 'Kuidas kuulutusi reklaamida?', a: 'Reklaamijaotises on tasulised tööriistad: esiletõstmine kataloogis, prioriteetne kuvamine ja bännerreklaam.' },
      { q: 'Millistel riikides CarUnity tegutseb?', a: 'Platvorm hõlmab Leedut, Lätit ja Eestit — ühtne turg kogu Balti regiooni jaoks.' }],

      safety: [
      { q: 'Kuidas veenduda müüja usaldusväärsuses?', a: 'Kontrolli arvustusi, reitingut ja kinnituse märki. Edasimüüjad läbivad lisakontrolli.' },
      { q: 'Mida teha pettuse korral?', a: 'Klõpsa kohe "Teata" kuulutuse lehel ja kirjuta meile aadressile support@carunity.eu.' },
      { q: 'Kuidas raha turvaliselt üle kanda?', a: 'Soovitame kohtuda isiklikult, autot üle vaadata ja kasutada pangaülekannet. Ära kunagi maksa ilma ülevaatuseta.' }],

      payments: [
      { q: 'Kui palju maksab kuulutus?', a: 'Põhikuulutus: 1 kuulutus 30 päevaks — 9.99€. Lisateavet hindade kohta leiad veebisaidilt jaotisest "Hinnakirjad".' },
      { q: 'Kas saan raha tagasi?', a: 'Tagasimaksed on võimalikud ainult platvormi tehnilise vea, topeltmakse või teenuse aktiveerimata jätmise korral. Pärast kuulutuse aktiveerimist tagasimakseid ei tehta.' },
      { q: 'Millised maksemeetodid on saadaval?', a: 'Aktsepteerime Apple Pay, Google Pay, Visa, Mastercard ja pangaülekandeid ettevõtetele.' }]

    }
  },
  lv: {
    hero_title: 'Palīdzības centrs',
    hero_subtitle: 'Atrodiet atbildes uz biežāk uzdotajiem jautājumiem',
    search_placeholder: 'Meklēt jautājumus...',
    search_results: 'Meklēšanas rezultāti',
    not_found: 'Nekas netika atrasts. Mēģiniet citu pieprasījumu.',
    ai_fallback: 'Gatavas atbildes nav — atbild MI',
    contact_title: 'Neatradāt atbildi?',
    contact_subtitle: 'Sazinieties ar mūsu atbalsta komandu — mēs ar prieku palīdzēsim!',
    chat_label: 'Tiešsaistes tērzēšana',
    chat_hours: 'P–Pk, 9:00–18:00',
    categories: {
      buying: { title: 'Pirkšana', desc: 'Kā pirkt automašīnas' },
      selling: { title: 'Pārdošana', desc: 'Kā pārdot automašīnas' },
      account: { title: 'Konts', desc: 'Profila pārvaldība' },
      dealers: { title: 'Dīleri', desc: 'Auto saloniem' },
      safety: { title: 'Drošība', desc: 'Darījumu drošība' },
      payments: { title: 'Maksājumi', desc: 'Maksājumi un tarifi' }
    },
    faq: {
      buying: [
      { q: 'Kā atrast piemērotu automašīnu?', a: 'Izmantojiet kataloga filtrus — marka, modelis, cena, gads, degvielas veids palīdzēs sašaurināt meklēšanu.' },
      { q: 'Kā sazināties ar pārdevēju?', a: 'Sludinājuma lapā noklikšķiniet "Rakstīt" vai "Zvanīt". Visi sarakstes tiek saglabātas sadaļā "Ziņojumi".' },
      { q: 'Kā saglabāt sludinājumu?', a: 'Noklikšķiniet uz sirds ikonas — automašīna tiks pievienota "Izlasē".' },
      { q: 'Kā pārbaudīt automašīnas vēsturi?', a: 'Apkopes vēsture ir pieejama sludinājuma lapā, ja pārdevējs to ir norādījis. Iesakām arī VIN pārbaudi.' }],

      selling: [
      { q: 'Kā ievietot sludinājumu?', a: 'Noklikšķiniet "Ievietot sludinājumu", izvēlieties transportlīdzekļa veidu, aizpildiet veidlapu un augšupielādējiet fotoattēlus.' },
      { q: 'Cik maksā sludinājums?', a: 'Pamata izvietojums: 1 sludinājums uz 30 dienām — 9.99€. Papildinformāciju par tarifiem varat atrast vietnē sadaļā "Tarifi".' },
      { q: 'Kā rediģēt sludinājumu?', a: 'Dodieties uz "Mani sludinājumi" un noklikšķiniet "Rediģēt".' },
      { q: 'Kā atzīmēt automašīnu kā pārdotu?', a: 'Atveriet sludinājumu un noklikšķiniet "Atzīmēt kā pārdotu".' }],

      account: [
      { q: 'Kā reģistrēties?', a: 'Noklikšķiniet "Ieiet" augšējā labajā stūrī un sekojiet norādījumiem. Reģistrējieties ar e-pastu vai Google kontu.' },
      { q: 'Kā atjaunināt profila datus?', a: 'Dodieties uz Iestatījumi → Profils un atjauniniet nepieciešamos datus.' },
      { q: 'Kā atjaunot paroli?', a: 'Pieteikšanās lapā noklikšķiniet "Aizmirsāt paroli?" un sekojiet e-pastā sūtītajiem norādījumiem.' },
      { q: 'Kā dzēst kontu?', a: 'Rakstiet mums uz support@carunity.eu ar tēmu "Konta dzēšana" — izskatīsim pieprasījumu 5 darba dienu laikā.' }],

      dealers: [
      { q: 'Kādas ir dīlera konta priekšrocības?', a: 'Dīleri saņem uzlabotu analītiku, sludinājumu pārvaldību, prioritāru attēlošanu un CRM rīkus.' },
      { q: 'Kādi tarifi ir pieejami dīleriem?', a: 'Mēs piedāvājam trīs tarifus: Starter, Pro un Premium. Sīkāk — dīleru cenu lapā. Varam arī sagatavot individuālu piedāvājumu.' },
      { q: 'Kā reklamēt sludinājumus?', a: 'Reklāmas sadaļā pieejami maksas rīki: izcelšana katalogā, prioritāra attēlošana un banneru reklāma.' },
      { q: 'Kurās valstīs darbojas CarUnity?', a: 'Platforma aptver Lietuvu, Latviju un Igauniju — vienots tirgus visam Baltijas reģionam.' }],

      safety: [
      { q: 'Kā pārliecināties par pārdevēja uzticamību?', a: 'Pievērsiet uzmanību atsauksmēm, reitingam un verifikācijas zīmei. Dīleri iziet papildu pārbaudi.' },
      { q: 'Ko darīt krāpšanas gadījumā?', a: 'Nekavējoties noklikšķiniet "Ziņot" sludinājuma lapā un rakstiet mums uz support@carunity.eu.' },
      { q: 'Kā droši pārskaitīt naudu?', a: 'Iesakām tikties klātienē, apskatīt automašīnu un izmantot bankas pārskaitījumu. Nekad nemaksājiet bez apskates.' }],

      payments: [
      { q: 'Cik maksā sludinājums?', a: 'Pamata izvietojums: 1 sludinājums uz 30 dienām — 9.99€. Papildinformāciju par tarifiem varat atrast vietnē sadaļā "Tarifi".' },
      { q: 'Vai var saņemt atmaksu?', a: 'Atmaksa iespējama tikai platformas tehniskas kļūdas, dubultas iekasēšanas vai pakalpojuma neaktivizēšanas gadījumā. Pēc sludinājuma aktivizēšanas atmaksa netiek veikta.' },
      { q: 'Kādi maksājumu veidi ir pieejami?', a: 'Pieņemam Apple Pay, Google Pay, Visa, Mastercard un bankas pārskaitījumus korporatīvajiem klientiem.' }]

    }
  },
  lt: {
    hero_title: 'Pagalbos centras',
    hero_subtitle: 'Raskite atsakymus į dažnai užduodamus klausimus',
    search_placeholder: 'Ieškoti klausimų...',
    search_results: 'Paieškos rezultatai',
    not_found: 'Nieko nerasta. Pabandykite kitą užklausą.',
    ai_fallback: 'Paruošto atsakymo nėra — atsako DI',
    contact_title: 'Neradote atsakymo?',
    contact_subtitle: 'Susisiekite su mūsų palaikymo komanda — mielai padėsime!',
    chat_label: 'Tiesioginė pagalba',
    chat_hours: 'Pr–Pt, 9:00–18:00',
    categories: {
      buying: { title: 'Pirkimas', desc: 'Kaip pirkti automobilius' },
      selling: { title: 'Pardavimas', desc: 'Kaip parduoti automobilius' },
      account: { title: 'Paskyra', desc: 'Profilio valdymas' },
      dealers: { title: 'Pardavėjai', desc: 'Autoalonams' },
      safety: { title: 'Saugumas', desc: 'Sandorių saugumas' },
      payments: { title: 'Mokėjimai', desc: 'Mokėjimai ir planai' }
    },
    faq: {
      buying: [
      { q: 'Kaip rasti tinkamą automobilį?', a: 'Naudokite katalogo filtrus — markė, modelis, kaina, metai, kuro tipas padės susiaurinti paiešką.' },
      { q: 'Kaip susisiekti su pardavėju?', a: 'Skelbimo puslapyje paspauskite "Rašyti" arba "Skambinti". Visi pokalbiai saugomi skyriuje "Žinutės".' },
      { q: 'Kaip išsaugoti skelbimą?', a: 'Paspauskite širdies piktogramą — automobilis bus pridėtas prie "Mėgstamiausiųjų".' },
      { q: 'Kaip patikrinti automobilio istoriją?', a: 'Techninės priežiūros istorija prieinama skelbimo puslapyje, jei pardavėjas ją nurodė. Rekomenduojame ir VIN patikrinimą.' }],

      selling: [
      { q: 'Kaip įdėti skelbimą?', a: 'Paspauskite "Įdėti skelbimą", pasirinkite transporto priemonės tipą, užpildykite formą ir įkelkite nuotraukas.' },
      { q: 'Kiek kainuoja skelbimas?', a: 'Pagrindinis patalpinimas: 1 skelbimas 30 dienų — 9.99€. Daugiau informacijos apie tarifus rasite svetainėje skyriuje "Tarifai".' },
      { q: 'Kaip redaguoti skelbimą?', a: 'Eikite į "Mano skelbimai" ir paspauskite "Redaguoti".' },
      { q: 'Kaip pažymėti automobilį kaip parduotą?', a: 'Atidarykite skelbimą ir paspauskite "Pažymėti kaip parduotą".' }],

      account: [
      { q: 'Kaip užsiregistruoti?', a: 'Paspauskite "Prisijungti" viršutiniame dešiniajame kampe ir vykdykite instrukcijas. Registruokitės el. paštu arba Google paskyra.' },
      { q: 'Kaip atnaujinti profilio duomenis?', a: 'Eikite į Nustatymai → Profilis ir atnaujinkite reikiamus duomenis.' },
      { q: 'Kaip atkurti slaptažodį?', a: 'Prisijungimo puslapyje paspauskite "Pamiršote slaptažodį?" ir vykdykite el. paštu atsiųstas instrukcijas.' },
      { q: 'Kaip ištrinti paskyrą?', a: 'Parašykite mums support@carunity.eu tema "Paskyros ištrynimas" — apdorosime užklausą per 5 darbo dienas.' }],

      dealers: [
      { q: 'Kokie yra pardavėjo paskyros privalumai?', a: 'Pardavėjai gauna išplėstinę analitiką, skelbimų valdymą, prioritetinį rodymą ir CRM įrankius.' },
      { q: 'Kokie tarifai prieinami pardavėjams?', a: 'Siūlome tris planus: Starter, Pro ir Premium. Išsamiau — pardavėjų kainų puslapyje. Galime paruošti ir individualų pasiūlymą.' },
      { q: 'Kaip reklamuoti skelbimus?', a: 'Reklamos skyriuje prieinami mokami įrankiai: išryškinimas kataloge, prioritetinis rodymas ir reklamjuostės reklama.' },
      { q: 'Kuriose šalyse veikia CarUnity?', a: 'Platforma apima Lietuvą, Latviją ir Estiją — viena rinka visam Baltijos regionui.' }],

      safety: [
      { q: 'Kaip įsitikinti pardavėjo patikimumu?', a: 'Atkreipkite dėmesį į atsiliepimus, įvertinimą ir patvirtinimo ženklelį. Pardavėjai praeina papildomą patikrinimą.' },
      { q: 'Ką daryti sukčiavimo atveju?', a: 'Nedelsiant paspauskite "Pranešti" skelbimo puslapyje ir parašykite mums support@carunity.eu.' },
      { q: 'Kaip saugiai pervesti pinigus?', a: 'Rekomenduojame susitikti asmeniškai, apžiūrėti automobilį ir naudoti banko pavedimą. Niekada nemokėkite be apžiūros.' }],

      payments: [
      { q: 'Kiek kainuoja skelbimas?', a: 'Pagrindinis patalpinimas: 1 skelbimas 30 dienų — 9.99€. Daugiau informacijos apie tarifus rasite svetainėje skyriuje "Tarifai".' },
      { q: 'Ar galima gauti pinigų grąžinimą?', a: 'Grąžinimas galimas tik platformos techninės klaidos, dvigubo nuskaitymo arba paslaugos neaktyvavimo atveju. Aktyvavus skelbimą, pinigai negrąžinami.' },
      { q: 'Kokie mokėjimo būdai prieinami?', a: 'Priimame Apple Pay, Google Pay, Visa, Mastercard ir banko pavedimus verslo klientams.' }]

    }
  }
};

function getContent(lang) {
  if (lang && CONTENT[lang]) return CONTENT[lang];
  if (lang && lang.length > 2 && CONTENT[lang.slice(0, 2)]) return CONTENT[lang.slice(0, 2)];
  return CONTENT.ru;
}

export default function Help() {
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('buying');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const language = (i18n.resolvedLanguage || i18n.language || 'ru').split('-')[0];
  const aiLabels = helpAssistantLabels(language);

  const c = getContent(i18n.language);

  const categoryIds = ['buying', 'selling', 'account', 'dealers', 'safety', 'payments'];

  const allItems = categoryIds.flatMap((id) =>
  (c.faq[id] || []).map((item) => ({ ...item, cat: id }))
  );

  const filteredFAQ = searchQuery ?
  allItems.filter(
    (item) =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.a.toLowerCase().includes(searchQuery.toLowerCase())
  ) :
  c.faq[selectedCategory] || [];

  // The AI only steps in when the prepared FAQ answers have nothing for this query.
  const trimmedQuery = searchQuery.trim();
  const noPreparedAnswer = trimmedQuery.length > 2 && filteredFAQ.length === 0;

  useEffect(() => {
    if (!noPreparedAnswer) {
      setAiAnswer(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }
    let cancelled = false;
    setAiAnswer(null);
    setAiError(null);
    setAiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await base44.functions.invoke('askHelpAssistant', { question: trimmedQuery, language });
        if (!cancelled) setAiAnswer(response.data.answer);
      } catch (error) {
        if (!cancelled) setAiError(error.response?.status === 401 || error.status === 401 ? 'signIn' : 'error');
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [noPreparedAnswer, trimmedQuery, language]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
          <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mx-auto mb-4 md:mb-6" />
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{c.hero_title}</h1>
          <p className="text-slate-400 text-base md:text-lg mb-6 md:mb-8">{c.hero_subtitle}</p>
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder={c.search_placeholder}
                value={searchQuery}
                maxLength={2000}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 h-12 md:h-14 text-base md:text-lg rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {!searchQuery &&
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 md:-mt-8">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            {categoryIds.map((id, index) => {
            const Icon = categoryIcons[id];
            const cat = c.categories[id];
            return (
              <motion.button
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelectedCategory(id)}
                className={`p-3 md:p-4 rounded-2xl text-center transition-all ${
                selectedCategory === id ?
                'bg-emerald-500 text-white shadow-lg' :
                'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:shadow-md border border-slate-100 dark:border-slate-800'}`
                }>
                
                  <Icon
                  className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 ${
                  selectedCategory === id ? 'text-white' : 'text-emerald-500'}`
                  } />
                
                  <h3 className="font-medium text-xs md:text-sm leading-tight">{cat.title}</h3>
                </motion.button>);

          })}
          </div>
        </div>
      }

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              {searchQuery ?
              `${c.search_results} (${filteredFAQ.length})` :
              c.categories[selectedCategory]?.title}
            </h2>
          </div>

          {filteredFAQ.length === 0 ?
          <div className="p-4 sm:p-6 md:p-8">
              {!noPreparedAnswer ?
            <div className="py-6 text-center">
                  <HelpCircle className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">{c.not_found}</p>
                </div> :

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="min-w-0">
                  <p className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {c.ai_fallback}
                  </p>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:bg-emerald-900/20 md:p-5">
                    <p className="mb-2 break-words text-xs text-slate-500 dark:text-slate-400">{trimmedQuery}</p>
                    {aiLoading ?
                <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-500" aria-hidden="true" />
                        {aiLabels.thinking}
                      </div> :
                aiError ?
                <p role="alert" className="text-sm text-slate-600 dark:text-slate-300">
                        {aiError === 'signIn' ?
                  <Link className="text-primary underline" to={`/login?returnTo=${encodeURIComponent('/Help')}`}>{aiLabels.signIn}</Link> :
                  aiLabels.error}
                      </p> :

                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200 md:text-[15px]">{aiAnswer}</p>}
                  </div>
                </motion.div>}
            </div> :

          <Accordion type="single" collapsible className="px-4 md:px-6">
              {filteredFAQ.map((item, index) =>
            <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left py-4 hover:no-underline">
                    <span className="font-medium text-sm md:text-base text-slate-900 dark:text-white pr-2">{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-400 pb-4 text-sm md:text-base leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
            )}
            </Accordion>
          }
        </div>
      </div>

      {/* Contact */}
      <div className="bg-slate-100 dark:bg-slate-800 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4">{c.contact_title}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 md:mb-8 text-sm md:text-base">{c.contact_subtitle}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
            <a
              href="mailto:info@carunity.eu"
              className="bg-white dark:bg-slate-700 p-5 md:p-6 rounded-2xl hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-600 block">
              
              <Mail className="w-9 h-9 md:w-10 md:h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email</h3>
              <p className="text-slate-500 dark:text-slate-300 text-sm">info@carunity.eu</p>
            </a>

            <div className="bg-white dark:bg-slate-700 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-600">
              <MessageSquare className="w-9 h-9 md:w-10 md:h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{c.chat_label}</h3>
              <p className="text-slate-500 dark:text-slate-300 text-sm">{c.chat_hours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>);

}