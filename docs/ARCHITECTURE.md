# CarUnity — как сайт устроен сейчас (до ухода с Base44)

Справочник по исходному коду, экспортированному из Base44. Нужен, чтобы при переписывании
понимать, как всё работало, и ничего не потерять. Состояние: архив от 2026‑11‑22.

## 1. Что это за продукт

CarUnity — маркетплейс транспорта для Балтии (Эстония, Латвия, Литва). Языки интерфейса:
RU, EN, ET, LV, LT. Валюта — EUR.

Типы объявлений: легковые авто (основной, самый проработанный), мотоциклы, грузовики, автобусы,
спецтехника, лодки, автодома, прицепы. Плюс справочные разделы (модели авто/мото, люкс‑каталог,
новости) и прокат (RentalCar).

Роли пользователей:
- **гость** — каталог, карточки, дилеры, новости, справка;
- **частный продавец** (`user_type: private`) — свои объявления, сообщения, избранное, сохранённые
  поиски, офферы от дилеров, платное продвижение;
- **дилер / автосалон** (`user_type: dealer`, `dealer_id`) — кабинет дилера, сотрудники, лиды,
  аналитика, критерии выкупа, подписка Starter/Pro/Premium;
- **админ** (`role: admin`) — скрытая админка `/x9-admin`, `/LuxuryAdmin`, модерация, «войти как».

## 2. Технологии

- Фронтенд: Vite 6 + React 18 + react-router 6, Tailwind 3 + shadcn/ui (Radix), TanStack Query,
  i18next (переводы в `public/locales/*/translation.json` + много `*Translations.js` в `src/lib`),
  framer-motion, recharts, react-leaflet (карты), three.js, jsPDF/html2canvas, Stripe.js.
- Бэкенд: **полностью Base44** — БД, авторизация, файлы, серверные функции (Deno), cron/триггеры,
  LLM, отправка писем, AI‑агент, коннектор Meta Ads.
- Сторонние сервисы помимо Base44: **Stripe** (оплаты), **Resend** (часть писем,
  `RESEND_API_KEY`), **Meta Graph API** (реклама), RSS‑ленты новостей, flagcdn, api.qrserver.com.

ID приложения в Base44: `6973f00466c3a37f3d8e7e53` (виден в URL картинок).

## 3. Структура репозитория

```
base44/            ← конфигурация бэкенда Base44 (это НЕ попадает в сборку сайта)
  entities/        39 схем таблиц (JSON Schema + правила доступа RLS)
  functions/       28 серверных функций (Deno, TypeScript)
  shared/          общий код функций: цены, выдача покупок, переводы писем/уведомлений
  workflows/       7 автоматизаций (cron и триггеры на изменения таблиц)
  agents/caro.jsonc  AI‑ассистент Caro
  connectors/meta_ads.jsonc  OAuth‑коннектор Meta Ads
  emails/          3 HTML‑шаблона писем
src/
  api/base44Client.js   единственный клиент SDK, его импортируют 112 файлов
  lib/AuthContext.jsx   авторизация (через Base44)
  lib/app-params.js     app_id / токен / адрес бэкенда из env, URL и localStorage
  pages/          50 страниц
  components/     328 компонентов, по разделам (dealer, listings, admin, caro, search, …)
  lib/, utils/, hooks/  бизнес‑логика, переводы, справочники
  data/premiumCars.json  статический справочник
  entities/, functions/  устаревшие остатки (LatvianCarPrice), не используются в base44/
public/locales/   переводы i18next
vite.config.js    подключает @base44/vite-plugin (прокси /api, визуальный редактор Base44)
```

## 4. Модель данных (39 сущностей)

В Base44 у каждой записи есть служебные поля: `id`, `created_date`, `updated_date`,
`created_by` (email), `created_by_id`. Владелец записи часто определяется именно по ним, а также по
полям вроде `seller_id` (в нём лежит **email**, а не id), `user_email`, `owner_email`.
Почти все связи — по email, а не по id пользователя.

### Объявления
| Сущность | Суть |
|---|---|
| **Car** (92 поля) | Главная таблица. Марка/модель/год/цена, пробег, топливо, КПП, кузов, привод, полные ТТХ (размеры, расход, разгон, CO₂…), `images[]`, описания на 9 языках (`description_ru/en/et/lv/lt/de/fi/pl`), `features[]`, `country/location`, `status` (active/sold/pending/rejected), продвижение (`is_premium`, `is_auto_premium`, `promotion_until`), флаги `is_damaged`, `exclusive_listing`, `get_offers_enabled`, `fast_sale_enabled`, продавец (`seller_type`, `seller_id`=email, `dealer_id`, `assigned_employee`, `seller_phone`), `vin`, `license_plate`, `short_id` (9 цифр, для коротких ссылок `/cardetails/:shortId`), `views_count`, `original_price`/`price_updated_at` (для «цена снижена») |
| Motorcycle, Truck, Bus, SpecialEquipment, Boat, Motorhome, Trailer | Упрощённые объявления других типов: общие поля (title, brand, model, year, price, images, status, seller_*, country…) + специфичные (тип мото, оси, тахограф, длина лодки, спальные места…) |
| RentalCar | Авто в прокат: цена в день, категория, доступность |
| ServiceRecord | Сервисная книжка авто (ТО, ремонты, фото, стоимость, описания на 5 языках) |

### Справочники и контент
| Сущность | Суть |
|---|---|
| CarModelInfo, CarGeneration | Энциклопедия моделей авто и их поколений (описание, плюсы/минусы, рейтинг) |
| MotorcycleModelInfo | Энциклопедия мотоциклов с ТТХ |
| LuxuryBrand, LuxuryCar | Витрина люкс‑каталога (наполняется вручную из `/LuxuryAdmin`) |
| Article | Новости: заголовок/текст на 5 языках, обложка, источник, `is_published` |
| AdConfiguration | Рекламные баннеры по слотам (hero-main, home-top, catalog-mid…), локализованные картинки |

### Пользователи и дилеры
| Сущность | Суть |
|---|---|
| User | Расширение встроенного пользователя Base44: телефон, аватар, город/страна, `user_type`, `dealer_id`, согласия GDPR, настройки уведомлений, `preferred_language`, `two_factor_enabled`. Сами email/пароль/роль хранит Base44 |
| Dealer (50 полей) | Профиль салона: контакты, описания на 5 языках, сотрудники (`employees[]`), соцсети, **кастомные цвета страницы салона** (10 полей), подписка (`subscription_type`, `subscription_until`), `is_verified`, рейтинг, `custom_pricing[]` (персональные скидки на услуги). Создавать может только админ |
| DealerApplication | Заявка на регистрацию салона, модерация админом (pending → approved/rejected) |
| Review | Отзывы о дилерах |
| Referral | Реферальная программа: кто пригласил, статус, начисление бонусов |

### Взаимодействие покупатель ↔ продавец
| Сущность | Суть |
|---|---|
| Message | Чат: `chat_id`, отправитель/получатель (email), `car_id`, `is_read` |
| Favorite | Избранное (user_email + car_id) |
| ViewHistory | Каждый просмотр карточки авторизованным пользователем |
| SavedSearch | Сохранённый поиск: `filters` (объект), уведомлять о новых/снижении цены, флаг «Я ищу» |
| PriceOffer | Предложение цены от покупателя (pending/accepted/rejected/countered) |
| Notification | Уведомления в кабинете, 11 типов (car_favorited, saved_search_match, promotion_ending/ended, price_drop, new_message, offer_received, view_decline, fast_sale_match, offer_accepted, listing_expiring) |
| Report | Жалобы на объявление/пользователя/дилера |

### Дилерские инструменты
| Сущность | Суть |
|---|---|
| DealerLead | «AI‑лиды»: заинтересованные покупатели по авто дилера с `intent_score` 0–100, статус воронки (new → contacted → meeting → sold/rejected) |
| LeadTask | Задачи по лиду (звонок/встреча/задача) |
| DealerPurchaseCriteria | Что дилер готов выкупать (марки, кузова, цены, годы, страны) |
| TradeInOffer | Предложение дилера частнику: мгновенный выкуп или комиссия, с жизненным циклом сделки; `fast_sale` — «быстрая продажа» с истечением |
| ImportRequest | Заявка на импорт объявлений дилера по URL |

### Деньги
| Сущность | Суть |
|---|---|
| PaymentPurchase | Факт оплаты Stripe (session_id, сумма, позиции). Пишет только вебхук |
| ListingPromotion | Активное продвижение объявления (boost / top_spot, срок) |
| ListingRenewal | Продление объявления на 30 дней (+3 дня бонусного продвижения) |
| MetaAdsOrder | Заказ рекламы в Facebook/Instagram (бюджет, маржа, ID кампании Meta, статусы) |
| SaleFeedback | Ответ продавца «продано / не продано» по окончании срока объявления |

**Правила доступа (RLS)** заданы явно только у Dealer, DealerApplication, PaymentPurchase и
SaleFeedback. У остальных таблиц действуют дефолты Base44, а фронтенд читает и пишет их напрямую.
Значит, часть защиты держалась на Base44. При переписывании права доступа нужно проектировать заново.

## 5. Серверные функции (base44/functions)

Все работают как HTTP‑функции Deno. `base44.asServiceRole` означает работу с правами администратора.

### Вызываются с сайта (`base44.functions.invoke`)
| Функция | Что делает |
|---|---|
| createCheckoutSession | Создаёт Stripe Checkout. Цены берутся только из `shared/paymentCatalog.ts`. Режимы: подписка дилера (planId + monthly/yearly) или набор позиций (размещение, boost, top, Meta) с проверкой, что объявления принадлежат покупателю |
| renewListing | Продление объявления на 30 дней + 3 дня `is_premium` |
| dealerApplication | `submit` — подать/переподать заявку салона; `review` — админ одобряет (создаёт Dealer, ставит юзеру `user_type=dealer`) или отклоняет с причиной |
| getDealerDirectory | Каталог дилеров: поиск, фильтры по стране/городу, «только проверенные», сортировка (по числу авто, рейтингу, имени, новизне), пагинация по 12 |
| getDealerCarDynamics | Просмотры авто дилера за последние 7 дней против предыдущих 7 (падение в %) |
| getPriceRatings | **Оценка цены 1–5** («хорошая цена»): ищет похожие активные авто (та же модель → та же марка и кузов → сегмент), пересчитывает их цены под год/пробег/мощность/опции и сравнивает с медианой |
| contextSearch | Поиск на естественном языке: LLM превращает фразу («дизельный универсал до 15к») в фильтры каталога |
| importListingFromUrl | Импорт объявления с чужого сайта по URL: скачивает HTML, достаёт JSON‑LD/мета/картинки, LLM извлекает поля, vision‑LLM отбирает фото, нормализует опции/цвета, создаёт Car |
| translateMessage | Перевод сообщения в чате через LLM |
| askHelpAssistant | Чат‑помощник по сайту (LLM с зашитым описанием разделов) |
| sendContactEmail | Форма обратной связи → письмо на info@carunity.eu через Resend |
| shareListingByEmail | Отправка объявления по email (Resend, с картинкой во вложении) |
| notifyDealerNewLead | Письмо дилеру о новом лиде (через Base44 SendEmail) |
| createMetaAdsOrder | Ручная (только админ) выдача Meta‑пакета: продвижение + заказ |
| adminViewAsAccounts | Список дилеров и пользователей для режима админа «войти как» |
| parseAutoNews | Также запускается кнопкой из админки (см. ниже) |
| searchCaroCars | Инструмент AI‑агента Caro: поиск активных авто по фильтрам, отдаёт 3 результата |
| getMetaAdAccounts | Список рекламных аккаунтов Meta через коннектор (только админ) |
| shareListing | Отдаёт HTML с OG‑тегами для соцсетей по `short_id` и редиректит на `/cardetails/:sid` |

### Фоновые (workflows)
| Когда | Функция | Что делает |
|---|---|---|
| ежедневно 06:00 UTC | parseAutoNews | Тянет RSS (motor1, drom, autoreview), по 2 новые статьи с источника, LLM переписывает и переводит, сохраняет как **черновики** Article |
| ежедневно 06:00 | checkSavedSearches | Новые авто за сутки под сохранённые поиски → уведомление |
| ежедневно 07:00 | checkPromotions | Продвижение заканчивается через ≤3 дня / закончилось → уведомление (не чаще раза в сутки) |
| ежедневно 07:00 | checkExpiredListings | Объявлениям 30+ дней: за 3 дня до конца «Машина продана?», по окончании — уведомление + письмо со статистикой (избранное, сообщения, похожие цены) и предложением продлить со скидкой 20% |
| ежедневно 00:00 | checkViewDecline | Авто дилеров, у которых просмотры упали ≥30% (при ≥20 просмотрах ранее) → уведомление «продвиньте» (раз в 7 дней) |
| создание Favorite | notifyCarFavorited | Уведомить владельца, что его авто добавили в избранное |
| Car стал active | matchIamLookingSearches | Уведомить пользователей с поиском «Я ищу», под который подходит авто |

Есть функции без триггера в архиве: `matchDealersForCar` (уведомить дилеров, чьи критерии выкупа
подходят под новое частное авто), `autoCloseOffers` (истекшие быстрые офферы → expired, судя по
комментарию, раз в час). Их триггеры, видимо, остались настроены в самом Base44.

**stripeWebhook** — приём оплат Stripe: проверяет подпись, сверяет сумму с каталогом и через
`shared/paymentFulfillment.ts` выдаёт покупку: активирует объявление, включает boost/top
(`is_premium`, `promotion_until`, ListingPromotion), создаёт MetaAdsOrder, продлевает подписку
дилера. Повторные события по одной сессии не дублирует (PaymentPurchase).

### Цены (shared/paymentCatalog.ts)
- Размещение частного объявления на 30 дней — 4,99 €
- Boost: 1 день 1,99 € / 3 дня 4,99 € / 7 дней 9,99 € / 14 дней 17,99 € / 30 дней 29,99 €
- TOP Spot 7 дней — 59,99 €
- Meta Boost 49,99 € (бюджет 45) / Meta Premium 89,99 € (80) / Meta TOP 139,99 € (130)
- Подписка дилера: Starter 59 €/мес (590 €/год), Pro 119 € (1190 €), Premium 149 € (1490 €)

## 6. AI в проекте
- **LLM вызывается прямо из браузера** (`integrations.Core.InvokeLLM`) в 8 местах: перевод описания
  объявления, генерация описания по фото, разбор ТТХ в админке, рыночные инсайты и
  AI‑рекомендации дилеру, сервисная книжка, кабинет дилера.
- На сервере: contextSearch, importListingFromUrl, parseAutoNews, translateMessage,
  askHelpAssistant.
- **Caro** — агент Base44 (`/Caro`, а также AI‑сравнение на `/Compare`): разговор с памятью,
  потоковые ответы через `base44.agents.*`, инструмент `searchCaroCars`.

## 7. Фронтенд

### Маршруты
Страницы адресуются по имени файла: `/Catalog`, `/CarDetails?id=…`, `/DealerProfile?id=…`.
Параметры в основном в query string.
- Публичные: `/` (Home), Catalog, DetailedSearch, CarDetails, `/cardetails/:shortId`, Compare,
  VehicleCatalog/VehicleDetails (не‑авто типы), AllBrands, CarModelDetails, MotorcycleBrands/Models/
  ModelDetails, LuxuryCatalog/LuxuryBrand/LuxuryCarDetails, Dealers, DealerProfile, AutoNews,
  ArticleDetail, Rental, RentalCatalog, Advertising, `/Advertising/:section`, PrivatePricing,
  DealershipPricing, DealerPricing, Help, FAQ, Terms, PrivacyPolicy, CookiePolicy.
- Авторизация: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/mfa` (2FA по коду).
  Есть вход через провайдеров (`loginWithProvider`, Google/Apple) и OAuthConsent.
- Только для вошедших (`ProtectedRoute` → редирект на `/login?returnTo=`): Dashboard,
  DealerDashboard, CreateListing, EditListing, Messages, DealerRegister, Caro, Notifications,
  GetOffers, Referral, LuxuryAdmin, `/x9-admin` (админка).

### Ключевая логика, которая живёт в браузере
Многие процессы, которые обычно выполняет сервер, здесь делает фронтенд напрямую через SDK
(116 вызовов `filter`, 55 `update`, 34 `create`, 16 `delete`):
- **Создание объявления** (CreateListing): Car создаётся сразу; если есть платные позиции — со
  статусом `pending`, затем редирект в Stripe; после оплаты вебхук делает `active`.
  `short_id` генерируется на клиенте (подбор случайного 9‑значного числа с проверкой).
- **Просмотры**: CarDetails пишет ViewHistory и увеличивает `views_count`.
- **Лиды дилера** (`useDealerLeadSync`): при открытии кабинета собирает просмотры (вес 1),
  избранное (5) и офферы (8) по авто дилера; при сумме ≥8 создаёт DealerLead,
  `intent_score = min(100, raw × 3.5)`.
- **Realtime**: подписки `Message.subscribe` / `Notification.subscribe` — счётчики в шапке и чат.
- **Загрузка файлов**: `UploadFile` / `UploadPublicFile` (фото объявлений, логотипы, вложения).
- Профиль пользователя обновляется через `auth.updateMe`.

## 8. Всё, что завязано на Base44 (что придётся заменить)

| Что | Где | Масштаб |
|---|---|---|
| SDK‑клиент | `src/api/base44Client.js`, импортируется в **112 файлах** | весь фронтенд |
| Таблицы (CRUD, filter с Mongo‑подобными запросами `$in/$regex/$gte`, count, aggregate, bulkCreate, updateMany, subscribe) | ~300 вызовов в src | БД + API |
| Авторизация | AuthContext, Login/Register/Mfa/Reset, 22× `redirectToLogin`, 21× `auth.me` | auth |
| Файлы | 18× UploadFile/UploadPublicFile | хранилище |
| LLM | 9 мест во фронте + 5 функций | AI‑провайдер |
| Письма | `Core.SendEmail` (часть писем), остальное уже Resend | email |
| Агент Caro | `base44.agents.*` (3 файла) | AI‑чат |
| Серверные функции | 28 шт. на Deno + `base44:runtime` secrets | бэкенд |
| Cron/триггеры | 7 workflows (+2 функции без триггера в архиве) | планировщик |
| Коннектор Meta | OAuth‑токен Meta Ads | интеграция |
| Картинки на CDN Base44 | ~100 ссылок `media.base44.com` / `base44.app/api/apps/…/files` в коде и `index.html` (фавикон, OG‑картинка, иллюстрации) | статика |
| **Данные** | все объявления, пользователи, фото, сообщения — в БД и хранилище Base44 | экспорт/миграция |
| Vite‑плагин | `@base44/vite-plugin` в vite.config.js, `@base44/sdk` в package.json | сборка |
| Прочее | `appLogs.logUserInApp`, NavigationTracker, публичные настройки приложения в AuthContext, README | мелочи |

## 9. Заметки и риски на будущее
- Связи по email: при смене email пользователь «теряет» объявления. В новой схеме лучше связывать по user id.
- В `DealerLead.buyer_profile.raw_email` лежит настоящий email покупателя, хотя в `user_email` он
  замаскирован. Маскировка формальная.
- Расчёты по всей таблице (ViewHistory до 10 000 строк, Car до 500) — в новой версии лучше
  делать агрегатами в БД.
- Цены продублированы: `shared/paymentCatalog.ts` и `createMetaAdsOrder` (своя таблица PACKAGES),
  плюс отображаемые цены во фронтенде (`src/lib/dealerPlans.js`, `pricing*`).
- `checkExpiredListings` использует жёстко прописанный `APP_URL = https://carunity.eu`.
