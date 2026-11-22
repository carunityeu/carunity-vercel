// Structured content for pricing detail modals, localized for all 5 supported languages.
// Each service has: subtitle, features (shown on tariff cards), how (info items).
// plans and target also have tierFeatures: one feature list per tier card.

export const PRICING_MODAL_CONTENT = {
  ru: {
    how_title: 'Как это работает',
    cta: 'Перейти к оформлению',
    included_title: 'Что входит',
    choose_title: 'Выберите вариант',
    services: {
      place: {
        subtitle: 'Публикация объявления на 30 дней для покупателей из Эстонии, Латвии и Литвы',
        features: ['Размещение в каталоге и поиске', 'Прямая связь с покупателями без посредников', 'Без комиссий и скрытых платежей', 'Возможность продления после окончания срока'],
        how: [
          { title: 'Как это работает?', text: 'Создайте объявление за несколько минут. После публикации оно сразу появится в каталоге и поиске и станет доступно всем покупателям платформы.' },
          { title: 'Сроки', text: 'Объявление активно 30 дней. По окончании срока его можно продлить в один клик.' },
        ],
      },
      topspot: {
        subtitle: 'Первое место на главной странице и максимальная видимость вашего автомобиля',
        features: ['Закрепление на главной странице сайта', 'Ваш автомобиль первым видит каждый посетитель', 'Ограниченное количество мест', 'Быстрее находите покупателя'],
        how: [
          { title: 'Как это работает?', text: 'Ваш автомобиль закрепляется в верхнем блоке главной страницы. Это первое, что видят посетители CarUnity при входе на сайт.' },
          { title: 'Сроки', text: 'Top Spot действует 7 дней. Одновременно доступно не более 10 мест.' },
        ],
      },
      boost: {
        subtitle: 'Поднимите объявление в топ поиска и получите больше просмотров и обращений',
        features: ['Размещение на первых позициях в поиске', 'Приоритетный показ в своей категории', 'В среднем в 3 раза больше просмотров', 'Запуск сразу после оплаты'],
        how: [
          { title: 'Как это работает?', text: 'Boost поднимает выбранные объявления выше остальных в результатах поиска и в категории, поэтому покупатели видят ваши автомобили первыми.' },
          { title: 'Сроки', text: 'Boost начинает действовать сразу после оплаты. Затем объявление остаётся опубликованным и возвращается на обычную позицию.' },
        ],
      },
      target: {
        subtitle: 'Реклама ваших объявлений в Facebook и Instagram для покупателей в странах Балтии',
        tierFeatures: [
          ['Продвижение 1 автомобиля', 'Реклама в Facebook и Instagram', 'Геотаргетинг по странам Балтии', 'Запуск в течение 24 часов'],
          ['Продвижение до 3 автомобилей', 'Реклама в Facebook и Instagram', 'Таргетинг по географии и интересам', 'Отчёт по итогам кампании', 'Запуск в течение 24 часов'],
          ['Продвижение до 5 автомобилей', 'Реклама в Facebook и Instagram', 'Расширенный таргетинг по интересам и возрасту', 'Оптимизация кампании в течение всего срока', 'Запуск в течение 24 часов'],
          ['Продвижение до 10 автомобилей или всего автосалона', 'Реклама в Facebook и Instagram с максимальным охватом', 'Ретаргетинг пользователей, проявивших интерес к вашим объявлениям', 'Приоритетный запуск и детальная аналитика: охват, клики, заявки'],
        ],
        how: [
          { title: 'Как это работает?', text: 'Вы выбираете пакет и автомобили для продвижения. Наши специалисты настраивают рекламную кампанию в Meta, подбирают целевую аудиторию и показывают ваши предложения пользователям, которые находятся в активном поиске автомобиля.' },
          { title: 'Сроки запуска', text: 'Кампания запускается в течение 24 часов после оплаты. Если автомобиль продан во время кампании, его можно заменить другим.' },
          { title: 'Что вы получаете', text: 'Стабильный поток обращений от заинтересованных покупателей. Мы контролируем эффективность кампании и при необходимости корректируем настройки, чтобы получить лучший результат.' },
        ],
      },
      plans: {
        subtitle: 'Подписка для автосалонов с расширенными возможностями и инструментами продаж',
        tierFeatures: [
          ['Размещение до 5 автомобилей', 'Профиль дилера с контактными данными', 'Показ объявлений в поиске', 'Базовая аналитика'],
          ['Размещение до 30 автомобилей', 'Полноценная страница дилера', 'Повышенная позиция в результатах поиска', 'Расширенная аналитика'],
          ['Неограниченное количество автомобилей', 'Приоритетное размещение в поиске', 'Полная аналитика по каждому автомобилю', 'Smart Match: автоматический подбор покупателей без комиссии', 'Массовая загрузка автомобилей'],
        ],
        how: [
          { title: 'Как это работает?', text: 'Выберите тариф — STARTER, PRO или PREMIUM — и зарегистрируйте автосалон. Чем выше тариф, тем больше возможностей.' },
          { title: 'Что входит', text: 'От базового профиля с контактами до полной аналитики по каждому автомобилю, приоритетного размещения и Smart Match без комиссии.' },
          { title: 'Что вы получаете', text: 'Больше видимости, звонков и продаж. PREMIUM даёт максимум лидов и скорость продаж без комиссии.' },
        ],
      },
      highlight: {
        subtitle: 'Выделение объявления цветом в результатах поиска для привлечения внимания',
        features: ['Визуальное выделение цветом', 'Привлекает внимание', 'Больше кликов', 'Заметнее конкурентов'],
        how: [
          { title: 'Как это работает?', text: 'Объявление выделяется цветом в результатах поиска, привлекая внимание покупателей и повышая кликабельность.' },
          { title: 'Сроки', text: 'Выберите период продвижения: 7, 14 или 30 дней.' },
          { title: 'Что вы получаете', text: 'Повышенную кликабельность, больше шансов на звонок и осмотр автомобиля.' },
        ],
      },
    },
  },
  en: {
    how_title: 'How it works',
    cta: 'Proceed to checkout',
    included_title: "What's included",
    choose_title: 'Choose an option',
    services: {
      place: {
        subtitle: 'Publish your listing for 30 days for buyers from Estonia, Latvia and Lithuania',
        features: ['Placement in catalog and search', 'Direct contact with buyers, no middlemen', 'No commissions or hidden fees', 'Renewal option after expiry'],
        how: [
          { title: 'How it works?', text: 'Create a listing in a few minutes. After publishing it appears immediately in the catalog and search and becomes available to all platform buyers.' },
          { title: 'Duration', text: 'The listing is active for 30 days. After expiry it can be renewed in one click.' },
        ],
      },
      topspot: {
        subtitle: 'First place on the home page and maximum visibility for your car',
        features: ['Pinned on the site home page', 'Every visitor sees your car first', 'Limited number of spots', 'Find a buyer faster'],
        how: [
          { title: 'How it works?', text: 'Your car is pinned in the top block of the home page. This is the first thing visitors see when they enter CarUnity.' },
          { title: 'Duration', text: 'Top Spot lasts 7 days. No more than 10 spots are available at a time.' },
        ],
      },
      boost: {
        subtitle: 'Boost your listing to the top of search for more views and inquiries',
        features: ['Top positions in search results', 'Priority display in your category', 'On average 3x more views', 'Starts immediately after payment'],
        how: [
          { title: 'How it works?', text: 'Boost raises selected listings above others in search results and in the category, so buyers see your cars first.' },
          { title: 'Duration', text: 'Boost starts working immediately after payment. The listing then stays published and returns to its regular position.' },
        ],
      },
      target: {
        subtitle: 'Advertising your listings on Facebook and Instagram for buyers in the Baltics',
        tierFeatures: [
          ['Promotion of 1 vehicle', 'Ads on Facebook and Instagram', 'Geo-targeting across the Baltics', 'Launch within 24 hours'],
          ['Promotion of up to 3 vehicles', 'Ads on Facebook and Instagram', 'Targeting by geography and interests', 'Post-campaign report', 'Launch within 24 hours'],
          ['Promotion of up to 5 vehicles', 'Ads on Facebook and Instagram', 'Advanced targeting by interests and age', 'Campaign optimization throughout the term', 'Launch within 24 hours'],
          ['Promotion of up to 10 vehicles or the whole dealership', 'Ads on Facebook and Instagram with maximum reach', 'Retargeting of users who showed interest in your listings', 'Priority launch and detailed analytics: reach, clicks, leads'],
        ],
        how: [
          { title: 'How it works?', text: 'You choose a package and the vehicles to promote. Our specialists set up the ad campaign in Meta, select the target audience and show your offers to users actively looking for a car.' },
          { title: 'Launch timing', text: 'The campaign launches within 24 hours of payment. If a car is sold during the campaign, it can be replaced with another.' },
          { title: 'What you get', text: 'A steady stream of inquiries from interested buyers. We monitor the campaign and adjust settings as needed for the best result.' },
        ],
      },
      plans: {
        subtitle: 'Subscription for dealerships with advanced features and sales tools',
        tierFeatures: [
          ['Up to 5 vehicles', 'Dealer profile with contact details', 'Listings shown in search', 'Basic analytics'],
          ['Up to 30 vehicles', 'Full dealer page', 'Higher position in search results', 'Advanced analytics'],
          ['Unlimited vehicles', 'Priority placement in search', 'Full analytics for every vehicle', 'Smart Match: automatic buyer matching with no commission', 'Bulk vehicle upload'],
        ],
        how: [
          { title: 'How it works?', text: 'Choose a plan — STARTER, PRO or PREMIUM — and register your dealership. The higher the plan, the more features.' },
          { title: 'What is included', text: 'From a basic profile with contacts to full per-vehicle analytics, priority placement and Smart Match with no commission.' },
          { title: 'What you get', text: 'More visibility, calls and sales. PREMIUM gives maximum leads and sales speed with no commission.' },
        ],
      },
      highlight: {
        subtitle: 'Highlight your listing with color in search results to attract attention',
        features: ['Visual color highlight', 'Attracts attention', 'More clicks', 'Stands out from competitors'],
        how: [
          { title: 'How it works?', text: 'The listing is highlighted with color in search results, attracting buyer attention and increasing click-through.' },
          { title: 'Duration', text: 'Choose a promotion period: 7, 14 or 30 days.' },
          { title: 'What you get', text: 'Higher click-through rate, more chances of a call and viewing of your car.' },
        ],
      },
    },
  },
  et: {
    how_title: 'Kuidas see töötab',
    cta: 'Edasi registreerimisele',
    included_title: 'Mis kaasas',
    choose_title: 'Valige variant',
    services: {
      place: {
        subtitle: 'Kuulutuse avaldamine 30 päevaks ostjatele Eestist, Lätist ja Leedust',
        features: ['Paigutamine kataloogis ja otsingus', 'Otsene kontakt ostjatega vahendajateta', 'Ilma vahendustasude ja varjatud tasudeta', 'Võimalus uuendada pärast aegumist'],
        how: [
          { title: 'Kuidas see töötab?', text: 'Looge kuulutus paari minutiga. Pärast avaldamist ilmub see kohe kataloogis ja otsingus ning on kättesaadav kõigile platvormi ostjatele.' },
          { title: 'Kestus', text: 'Kuulutus on aktiivne 30 päeva. Pärast aegumist saab selle ühe klõpsuga uuendada.' },
        ],
      },
      topspot: {
        subtitle: 'Esimene koht avalehel ja maksimaalne nähtavus teie autole',
        features: ['Kinnitamine saidi avalehel', 'Iga külastaja näeb teie autot esimesena', 'Piiratud kohtade arv', 'Leiate ostja kiiremini'],
        how: [
          { title: 'Kuidas see töötab?', text: 'Teie auto kinnitatakse avalehe ülemises plokis. See on esimene, mida külastajad CarUnitysse sisenedes näevad.' },
          { title: 'Kestus', text: 'Top Spot kestab 7 päeva. Korraga on saadaval kuni 10 kohta.' },
        ],
      },
      boost: {
        subtitle: 'Tõstke kuulutus otsingu tippu ja saate rohkem vaatamisi ning päringuid',
        features: ['Esimesed kohad otsingutulemustes', 'Prioriteetne kuvamine oma kategoorias', 'Keskmiselt 3 korda rohkem vaatamisi', 'Käivitub kohe pärast makset'],
        how: [
          { title: 'Kuidas see töötab?', text: 'Boost tõstab valitud kuulutused teistest kõrgemale otsingutulemustes ja kategoorias, nii et ostjad näevad teie autosid esimestena.' },
          { title: 'Kestus', text: 'Boost hakkab toimima kohe pärast makset. Kuulutus jääb pärast seda avaldatuks ja naaseb tavapärasele positsioonile.' },
        ],
      },
      target: {
        subtitle: 'Teie kuulutuste reklaam Facebookis ja Instagramis Baltimaade ostjatele',
        tierFeatures: [
          ['1 sõiduki edendamine', 'Reklaam Facebookis ja Instagramis', 'Geosihtimine Baltimaades', 'Käivitus 24 tunni jooksul'],
          ['Kuni 3 sõiduki edendamine', 'Reklaam Facebookis ja Instagramis', 'Sihtimine geograafia ja huvide järgi', 'Aruanne kampaania lõppedes', 'Käivitus 24 tunni jooksul'],
          ['Kuni 5 sõiduki edendamine', 'Reklaam Facebookis ja Instagramis', 'Laiendatud sihtimine huvide ja vanuse järgi', 'Kampaania optimeerimine kogu perioodi vältel', 'Käivitus 24 tunni jooksul'],
          ['Kuni 10 sõiduki või kogu autosalongi edendamine', 'Reklaam Facebookis ja Instagramis maksimaalse ulatusega', 'Teie kuulutustest huvitunud kasutajate sihtimine uuesti', 'Prioriteetne käivitus ja detailne analüütika: ulatus, klõpsud, päringud'],
        ],
        how: [
          { title: 'Kuidas see töötab?', text: 'Valige pakett ja edendatavad sõidukid. Meie spetsialistid seadistavad reklaamikampaania Metas, valivad sihtrühma ja näitavad teie pakkumisi kasutajatele, kes otsivad aktiivselt autot.' },
          { title: 'Käivituse tähtajad', text: 'Kampaania käivitatakse 24 tunni jooksul pärast makset. Kui auto müüakse kampaania ajal, saab selle asendada teisega.' },
          { title: 'Mida saate', text: 'Stabiilne voog huvitatud ostjate päringuid. Me jälgime kampaania efektiivsust ja vajadusel korrigeerime sätteid parima tulemuse saamiseks.' },
        ],
      },
      plans: {
        subtitle: 'Tellimus autosalongidele laiendatud võimaluste ja müügitööriistadega',
        tierFeatures: [
          ['Kuni 5 sõidukit', 'Edasimüüja profiil kontaktidega', 'Kuulutused kuvatakse otsingus', 'Põhianalüütika'],
          ['Kuni 30 sõidukit', 'Täielik edasimüüja leht', 'Kõrgem positsioon otsingutulemustes', 'Laiendatud analüütika'],
          ['Piiramatud sõidukid', 'Prioriteetne paigutus otsingus', 'Täielik analüütika iga sõiduki kohta', 'Smart Match: ostjate automaatne leidmine ilma vahendustasuta', 'Sõidukite masslaadimine'],
        ],
        how: [
          { title: 'Kuidas see töötab?', text: 'Valige pakett — STARTER, PRO või PREMIUM — ja registreerige autosalong. Mida kõrgem pakett, seda rohkem võimalusi.' },
          { title: 'Mis kaasas', text: 'Põhilisest profiilist kontaktidega kuni täieliku analüütikani iga sõiduki kohta, prioriteetse paigutuse ja Smart Matchita ilma vahendustasuta.' },
          { title: 'Mida saate', text: 'Rohkem nähtavust, kõnesid ja müüki. PREMIUM annab maksimaalsed liidid ja müügikiiruse ilma vahendustasuta.' },
        ],
      },
      highlight: {
        subtitle: 'Kuulutuse esiletõstmine värviga otsingutulemustes tähelepanu köitmiseks',
        features: ['Visuaalne värviline esiletõst', 'Köidab tähelepanu', 'Rohkem klikke', 'Eristub konkurentidest'],
        how: [
          { title: 'Kuidas see töötab?', text: 'Kuulutus tõstetakse esile värviga otsingutulemustes, köites ostjate tähelepanu ja suurendades klikkimist.' },
          { title: 'Kestus', text: 'Valige reklaamiperiood: 7, 14 või 30 päeva.' },
          { title: 'Mida saate', text: 'Suurem klikkimise määr, rohkem võimalusi kõneks ja auto vaatamiseks.' },
        ],
      },
    },
  },
  lv: {
    how_title: 'Kā tas darbojas',
    cta: 'Turpināt uz reģistrāciju',
    included_title: 'Kas ietilpst',
    choose_title: 'Izvēlieties variantu',
    services: {
      place: {
        subtitle: 'Sludinājuma publicēšana 30 dienas pircējiem no Igaunijas, Latvijas un Lietuvas',
        features: ['Ievietošana katalogā un meklēšanā', 'Tiešs kontakts ar pircējiem bez starpniekiem', 'Bez komisijām un slēptām maksām', 'Atjaunošanas iespēja pēc termiņa'],
        how: [
          { title: 'Kā tas darbojas?', text: 'Izveidojiet sludinājumu dažās minūtēs. Pēc publicēšanas tas uzreiz parādās katalogā un meklēšanā un kļūst pieejams visiem platformas pircējiem.' },
          { title: 'Ilgums', text: 'Sludinājums ir aktīvs 30 dienas. Pēc termiņa beigām to var atjaunot vienā klikšķī.' },
        ],
      },
      topspot: {
        subtitle: 'Pirmā vieta sākumlapā un maksimāla jūsu auto redzamība',
        features: ['Fiksēšana vietnes sākumlapā', 'Katrs apmeklētājs jūsu auto redz pirmo', 'Ierobežots vietu skaits', 'Pircēju atrašana ātrāk'],
        how: [
          { title: 'Kā tas darbojas?', text: 'Jūsu auto tiek fiksēts sākumlapas augšējā blokā. Tas ir pirmais, ko apmeklētāji redz, ienākot CarUnity.' },
          { title: 'Ilgums', text: 'Top Spot darbojas 7 dienas. Vienlaikus pieejamas ne vairāk kā 10 vietas.' },
        ],
      },
      boost: {
        subtitle: 'Paceliet sludinājumu meklēšanas augšgalā un iegūstiet vairāk skatījumu un pieprasījumu',
        features: ['Pirmās vietas meklēšanas rezultātos', 'Prioritāra rādīšana savā kategorijā', 'Vidēji 3 reizes vairāk skatījumu', 'Sākas uzreiz pēc maksājuma'],
        how: [
          { title: 'Kā tas darbojas?', text: 'Boost paceļ izvēlētos sludinājumus virs citiem meklēšanas rezultātos un kategorijā, tāpēc pircēji jūsu auto redz pirmos.' },
          { title: 'Ilgums', text: 'Boost sāk darboties uzreiz pēc maksājuma. Pēc tam sludinājums paliek publicēts un atgriežas parastajā vietā.' },
        ],
      },
      target: {
        subtitle: 'Jūsu sludinājumu reklāma Facebook un Instagram pircējiem Baltijā',
        tierFeatures: [
          ['1 transportlīdzekļa popularizēšana', 'Reklāma Facebook un Instagram', 'Ģeomērķēšana Baltijas valstīs', 'Palaišana 24 stundu laikā'],
          ['Līdz 3 transportlīdzekļu popularizēšana', 'Reklāma Facebook un Instagram', 'Mērķēšana pēc ģeogrāfijas un interesēm', 'Pārskats pēc kampaņas', 'Palaišana 24 stundu laikā'],
          ['Līdz 5 transportlīdzekļu popularizēšana', 'Reklāma Facebook un Instagram', 'Paplašināta mērķēšana pēc interesēm un vecuma', 'Kampaņas optimizācija visu termiņu', 'Palaišana 24 stundu laikā'],
          ['Līdz 10 transportlīdzekļu vai visa autosalona popularizēšana', 'Reklāma Facebook un Instagram ar maksimālu sasniedzamību', 'Lietotāju, kas izrādīja interesi par jūsu sludinājumiem, atkārtota mērķēšana', 'Prioritāra palaišana un detalizēta analītika: sasniedzamība, klikšķi, pieprasījumi'],
        ],
        how: [
          { title: 'Kā tas darbojas?', text: 'Jūs izvēlieties paketi un popularizējamos transportlīdzekļus. Mūsu speciālisti iestata reklāmas kampaņu Meta, atlasa mērķauditoriju un rāda jūsu piedāvājumus lietotājiem, kas aktīvi meklē auto.' },
          { title: 'Palaišanas termiņi', text: 'Kampaņa tiek palaista 24 stundu laikā pēc maksājuma. Ja auto kampaņas laikā ir pārdots, to var aizstāt ar citu.' },
          { title: 'Ko jūs saņemat', text: 'Stabils pieprasījumu plūsms no ieinteresētiem pircējiem. Mēs uzraugām kampaņas efektivitāti un vajadzības gadījumā koriģējam iestatījumus, lai iegūtu labāko rezultātu.' },
        ],
      },
      plans: {
        subtitle: 'Abonements autosaloniem ar paplašinātām iespējām un pārdošanas rīkiem',
        tierFeatures: [
          ['Līdz 5 transportlīdzekļiem', 'Dīlera profils ar kontaktiem', 'Sludinājumi redzami meklēšanā', 'Pamata analītika'],
          ['Līdz 30 transportlīdzekļiem', 'Pilna dīlera lapa', 'Augstāka pozīcija meklēšanas rezultātos', 'Paplašināta analītika'],
          ['Neierobežots transportlīdzekļu skaits', 'Prioritāra izvietošana meklēšanā', 'Pilna analītika katram transportlīdzeklim', 'Smart Match: automātiska pircēju meklēšana bez komisijas', 'Transportlīdzekļu masveida augšupielāde'],
        ],
        how: [
          { title: 'Kā tas darbojas?', text: 'Izvēlieties plānu — STARTER, PRO vai PREMIUM — un reģistrējiet autosalonu. Jo augstāks plāns, jo vairāk iespēju.' },
          { title: 'Kas ietilpst', text: 'No pamata profila ar kontaktiem līdz pilnai analītikai katram transportlīdzeklim, prioritārai izvietošanai un Smart Match bez komisijas.' },
          { title: 'Ko jūs saņemat', text: 'Vairāk redzamības, zvanu un pārdošanas. PREMIUM dod maksimālus potenciālos klientus un pārdošanas ātrumu bez komisijas.' },
        ],
      },
      highlight: {
        subtitle: 'Sludinājuma izcelšana ar krāsu meklēšanas rezultātos uzmanības pievilkšanai',
        features: ['Vizuāla krāsas izcelšana', 'Pievelk uzmanību', 'Vairāk klikšķu', 'Izceļas starp konkurentiem'],
        how: [
          { title: 'Kā tas darbojas?', text: 'Sludinājums tiek izcelts ar krāsu meklēšanas rezultātos, pievelkot pircēju uzmanību un palielinot klikšķu skaitu.' },
          { title: 'Ilgums', text: 'Izvēlieties reklamēšanas periodu: 7, 14 vai 30 dienas.' },
          { title: 'Ko jūs saņemat', text: 'Lielāks klikšķu skaits, vairāk iespēju zvanam un auto apskatei.' },
        ],
      },
    },
  },
  lt: {
    how_title: 'Kaip tai veikia',
    cta: 'Tęsti registracijai',
    included_title: 'Kas įeina',
    choose_title: 'Pasirinkite variantą',
    services: {
      place: {
        subtitle: 'Skelbimo publikavimas 30 dienų pirkėjams iš Estijos, Latvijos ir Lietuvos',
        features: ['Talpinimas kataloge ir paieškoje', 'Tiesioginis kontaktas su pirkėjais be tarpininkų', 'Be komisinių ir slėptų mokesčių', 'Atnaujinimo galimybė pasibaigus terminui'],
        how: [
          { title: 'Kaip tai veikia?', text: 'Sukurkite skelbimą per kelias minutes. Po publikavimo jis iškart pasirodo kataloge ir paieškoje bei tampa prieinamas visiems platformos pirkėjams.' },
          { title: 'Trukmė', text: 'Skelbimas aktyvus 30 dienų. Pasibaigus terminui jį galima atnaujinti vienu paspaudimu.' },
        ],
      },
      topspot: {
        subtitle: 'Pirmoji vieta pagrindiniame puslapyje ir maksimalus jūsų automobilio matomumas',
        features: ['Prisegimas svetainės pagrindiniame puslapyje', 'Kiekvienas lankytojas jūsų automobilį mato pirmiausia', 'Ribotas vietų skaičius', 'Pirkėją rasite greičiau'],
        how: [
          { title: 'Kaip tai veikia?', text: 'Jūsų automobilis prisegiamas pagrindinio puslapio viršutiniame bloke. Tai pirmiausia, ką lankytojai mato įėję į CarUnity.' },
          { title: 'Trukmė', text: 'Top Spot veikia 7 dienas. Vienu metu galima ne daugiau kaip 10 vietų.' },
        ],
      },
      boost: {
        subtitle: 'Pakelkite skelbimą į paieškos viršų ir gaukite daugiau peržiūrų bei užklausų',
        features: ['Pirmos vietos paieškos rezultatuose', 'Prioritetas rodomas savo kategorijoje', 'Vidutiniškai 3 kartus daugiau peržiūrų', 'Prasideda iškart po apmokėjimo'],
        how: [
          { title: 'Kaip tai veikia?', text: 'Boost pakelia pasirinktus skelbimus aukščiau už kitus paieškos rezultatuose ir kategorijoje, todėl pirkėjai jūsų automobilius mato pirmiausia.' },
          { title: 'Trukmė', text: 'Boost pradeda veikti iškart po apmokėjimo. Po to skelbimas lieka paskelbtas ir grįžta į įprastą vietą.' },
        ],
      },
      target: {
        subtitle: 'Jūsų skelbimų reklama Facebook ir Instagram pirkėjams Baltijoje',
        tierFeatures: [
          ['1 transporto priemonės reklamavimas', 'Reklama Facebook ir Instagram', 'Geotikslinimas Baltijos šalyse', 'Paleidimas per 24 valandas'],
          ['Iki 3 transporto priemonių reklamavimas', 'Reklama Facebook ir Instagram', 'Tikslinimas pagal geografiją ir interesus', 'Ataskaita po kampanijos', 'Paleidimas per 24 valandas'],
          ['Iki 5 transporto priemonių reklamavimas', 'Reklama Facebook ir Instagram', 'Išplėstinas tikslinimas pagal interesus ir amžių', 'Kampanijos optimizavimas visą laikotarpį', 'Paleidimas per 24 valandas'],
          ['Iki 10 transporto priemonių ar viso automobilių salono reklamavimas', 'Reklama Facebook ir Instagram su maksimaliu pasiekiamumu', 'Vartotojų, parodžiusių susidomėjimą jūsų skelbimais, retikslinimas', 'Prioritetas paleidimas ir detali analitika: pasiekiamumas, paspaudimai, užklausos'],
        ],
        how: [
          { title: 'Kaip tai veikia?', text: 'Pasirinkite paketą ir reklamuos transporto priemones. Mūsų specialistai nustato reklamos kampaniją Meta, atranda tikslinę auditoriją ir rodo jūsų pasiūlymus vartotojams, aktyviai ieškantiems automobilio.' },
          { title: 'Paleidimo terminai', text: 'Kampanija paleidžiama per 24 valandas po apmokėjimo. Jei automobilis parduotas kampanijos metu, jį galima pakeisti kitu.' },
          { title: 'Ką gaunate', text: 'Pastovus užklausų srautas iš suinteresuotų pirkėjų. Mes stebime kampanijos efektyvumą ir prireikus koreguojame nustatymus, kad pasiektume geriausią rezultatą.' },
        ],
      },
      plans: {
        subtitle: 'Prenumerata automobilių salonams su išplėstinėmis funkcijomis ir pardavimo įrankiais',
        tierFeatures: [
          ['Iki 5 transporto priemonių', 'Dilerio profilis su kontaktais', 'Skelbimai rodomi paieškoje', 'Pagrindinė analitika'],
          ['Iki 30 transporto priemonių', 'Pilnas dilerio puslapis', 'Aukštesnė pozicija paieškos rezultatuose', 'Išplėstinė analitika'],
          ['Neribotas transporto priemonių skaičius', 'Prioritetas išdėstymas paieškoje', 'Pilna kiekvienos transporto priemonės analitika', 'Smart Match: automatinis pirkėjų parinkimas be komisinių', 'Transporto priemonių masinis įkėlimas'],
        ],
        how: [
          { title: 'Kaip tai veikia?', text: 'Pasirinkite planą — STARTER, PRO ar PREMIUM — ir registruokite automobilių saloną. Kuo aukštesnis planas, tuo daugiau galimybių.' },
          { title: 'Kas įeina', text: 'Nuo pagrindinio profilio su kontaktais iki pilnos kiekvienos transporto priemonės analitikos, prioriteto išdėstymo ir Smart Match be komisinių.' },
          { title: 'Ką gaunate', text: 'Daugiau matomumo, skambučių ir pardavimų. PREMIUM duoda maksimum šaltųjų kontaktų ir pardavimo greitį be komisinių.' },
        ],
      },
      highlight: {
        subtitle: 'Skelbimo išskyrimas spalva paieškos rezultatuose dėmesio patraukimui',
        features: ['Vizualus spalvos išskyrimas', 'Atkreipia dėmesį', 'Daugiau paspaudimų', 'Išsiskiria tarp konkurentų'],
        how: [
          { title: 'Kaip tai veikia?', text: 'Skelbimas išskiriamas spalva paieškos rezultatuose, atkreipdamas pirkėjų dėmesį ir didindamas paspaudimų skaičių.' },
          { title: 'Trukmė', text: 'Pasirinkite reklamos laikotarpį: 7, 14 ar 30 dienų.' },
          { title: 'Ką gaunate', text: 'Didesnis paspaudimų skaičius, daugiau galimybių skambučiui ir automobilio apžiūrai.' },
        ],
      },
    },
  },
};