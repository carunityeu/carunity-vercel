import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ui = {
  ru: { pageTitle: 'Политика конфиденциальности', backLabel: 'Правовая информация', back: 'Назад' },
  en: { pageTitle: 'Privacy Policy', backLabel: 'Legal Information', back: 'Back' },
};

const bodyEn = `
**PRIVACY POLICY**
Carunity OÜ

**1. General Provisions**

**1.1.** This Privacy Policy (hereinafter — the "Policy") defines the procedure, purposes, legal grounds and conditions for the processing of personal data of users of the CarUnity platform by Carunity OÜ (hereinafter — the "Company", the "Controller", "we").

**1.2.** For the purposes of this Policy, the Carunity platform (hereinafter — the "Platform") means the website, as well as other digital solutions, services and interfaces used by the Company to provide services to users in Estonia, Latvia, Lithuania and, where necessary, other countries of the European Economic Area.

**1.3.** The Company recognizes the particular importance of personal data protection and processes personal data lawfully, fairly and transparently, exclusively for predetermined purposes and only to the extent necessary to achieve such purposes.

**1.4.** When processing personal data, the Company is guided by Regulation (EU) 2016/679 (GDPR), as well as applicable regulatory acts of the Republic of Estonia and other mandatory legal provisions applicable to the Company's activities in the Baltic states.

**1.5.** By using the Platform, the user confirms that they have familiarized themselves with this Policy, understand the procedure for processing their personal data and agree to its terms to the extent that such consent is required by applicable legislation.

**1.6.** This Policy applies to all natural persons who visit the Platform, register on the Platform, place advertisements, interact with other users, send requests to the Company or otherwise use the Platform or services provided through the Platform.

**2. Terms and Definitions**

**2.1.** Personal data — any information relating to an identified or identifiable natural person.

**2.2.** Processing of personal data — any action or set of actions performed with personal data, including collection, recording, systematization, storage, use, transfer, restriction, deletion and destruction.

**2.3.** User — a natural or legal person using the Platform.

**2.4.** Account — a personal user account on the Platform created to gain access to certain functions and services.

**2.5.** Content — any data, materials and information posted by the user on the Platform, including texts of advertisements, photographs, messages, descriptions and other materials.

**2.6.** Controller — Carunity OÜ, independently determining the purposes and means of processing personal data.

**2.7.** Processor — a natural or legal person who processes personal data on behalf of the Controller on the basis of a contract or other legal ground.

**2.8.** Dealer — a legal entity or individual entrepreneur carrying out professional activity in the sale of vehicles and using the Platform to place advertisements, promote and sell vehicles.

**3. Information about the Controller**

**3.1.** The controller of personal data is:
Carunity OÜ
Registration code: 17302573
Registered address: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
Email: info@carunity.eu

**4. Principles of Personal Data Processing**

**4.1.** The Company processes personal data lawfully, fairly and transparently; collects data for specific, predetermined and legitimate purposes; ensures data is adequate, relevant and limited to what is necessary; takes measures to ensure data accuracy; stores data no longer than necessary; and ensures appropriate security of personal data. The Company is accountable for compliance with these principles.

**5. Sources of Personal Data**

**5.1.** The Company obtains personal data directly from the user upon registration, account creation, placing advertisements, purchasing paid services or contacting the Company; automatically when using the Platform (technical data, device data, browser data, IP address, cookies); and from third parties including payment services, banks, telecommunications operators and publicly available sources, where permitted by law.

**6. Purposes of Processing, Categories of Data and Legal Grounds**

**6.1.** The Company processes personal data for the following purposes:

**6.1.1. Registration and account administration** — name, surname, email address, phone number, login, user identifier, interface language, IP address, date and time of registration. Legal basis: performance of a contract (Art. 6(1)(b) GDPR); legitimate interest (Art. 6(1)(f) GDPR).

**6.1.2. Posting and management of advertisements** — profile data, contact data, information contained in advertisements, photographs, technical parameters, location data, history of changes. Legal basis: performance of a contract (Art. 6(1)(b) GDPR).

**6.1.3. Communication between users** — name, phone number, email address, content of messages, time of sending and receiving messages. Legal basis: performance of a contract; legitimate interest (Art. 6(1)(f) GDPR).

**6.1.4. Provision of paid services and payments** — name, surname, email address, phone number, billing details, information about ordered services, invoices, payments, tax data. Legal basis: performance of a contract (Art. 6(1)(b) GDPR); compliance with legal obligations (Art. 6(1)(c) GDPR).

**6.1.5. Handling requests and complaints** — name, surname, email address, phone number, content of the request, attached documents. Legal basis: performance of a contract; compliance with a legal obligation; legitimate interest (Art. 6(1)(f) GDPR).

**6.1.6. Ensuring platform security and preventing fraud** — IP address, device data, browser data, user behavior data, account activity history. Legal basis: legitimate interest (Art. 6(1)(f) GDPR).

**6.1.7. Sending service notifications** — name, email address, phone number, device data for push notifications, notification settings. Legal basis: performance of a contract (Art. 6(1)(b) GDPR); legitimate interest (Art. 6(1)(f) GDPR); consent (Art. 6(1)(a) GDPR) where required.

**6.1.8. Analytics and platform improvement** — anonymized or pseudonymized usage data, technical data, interaction data. Legal basis: legitimate interest (Art. 6(1)(f) GDPR); consent (Art. 6(1)(a) GDPR) for non-essential cookies.

**6.1.9. Marketing and advertising** — email address, phone number, advertising identifiers, data on user interaction with advertisements. Legal basis: consent (Art. 6(1)(a) GDPR); legitimate interest (Art. 6(1)(f) GDPR) for direct marketing to existing customers within applicable limits.

**6.1.10. Dealer-specific processing** — company name, registration number, VAT number, authorized person's data, vehicle inventory data, contact details, financial data, CRM data. Legal basis: performance of a contract (Art. 6(1)(b) GDPR); compliance with legal obligations (Art. 6(1)(c) GDPR).

**6.1.11. Compliance with legal obligations** — data necessary to comply with applicable law, including tax legislation, anti-money laundering legislation, and legal obligations to state authorities. Legal basis: compliance with a legal obligation (Art. 6(1)(c) GDPR).

**7. Retention Periods**

**7.1.** Personal data is stored for the period necessary for the purposes of its processing and for fulfilling legal obligations: account data — for the duration of the account and for 3 years after deletion; advertisement data — for the duration of the advertisement and for 3 years after removal; payment and financial data — for 7 years; data processed on the basis of consent — until consent is withdrawn, unless another legal basis exists; data processed for legal claims — until the claim is resolved plus the applicable limitation period.

**8. Transfer of Personal Data**

**8.1.** The Company may transfer personal data to: processors acting on behalf of the Company (IT service providers, hosting providers, analytics services); payment service providers; state authorities when required by law; other users of the Platform to the extent necessary for providing the Platform's services; partners of the Company, if the user has given consent or where permitted by law.

**8.2.** In the event of transfer of personal data outside the European Economic Area, the Company ensures appropriate safeguards in accordance with GDPR requirements, including the use of Standard Contractual Clauses (SCCs) approved by the European Commission.

**9. Rights of Data Subjects**

**9.1.** Users have the following rights under GDPR:

Right of access — to obtain confirmation as to whether personal data is being processed and access to such data.
Right to rectification — to request correction of inaccurate or incomplete data.
Right to erasure ("right to be forgotten") — to request deletion of data in cases provided for by GDPR.
Right to restriction of processing — to request restriction of data processing in cases provided for by GDPR.
Right to data portability — to receive data in a structured, commonly used and machine-readable format.
Right to object — to object to processing based on legitimate interest or for direct marketing purposes.
Right to withdraw consent — to withdraw consent at any time, without affecting the lawfulness of processing carried out before withdrawal.
Right to lodge a complaint — to lodge a complaint with the supervisory authority (Estonian Data Protection Inspectorate, www.aki.ee).

**9.2.** To exercise the above rights, the user may contact the Company at: info@carunity.eu

**10. Use of Cookies and Similar Technologies**

**10.1.** The Company uses cookies and similar technologies in accordance with this Policy and the Cookie Policy, which is an integral part of this Privacy Policy.

**11. Security Measures**

**11.1.** The Company applies appropriate technical and organizational measures to ensure the security of personal data, including: encryption of data during transmission (SSL/TLS); access control; regular security audits; employee training on data protection issues; processing agreements with processors.

**12. Automated Decision-Making and Profiling**

**12.1.** The Company may use automated analysis tools to assess user activity, detect fraudulent behavior, and improve the relevance of services and advertising. Where automated decision-making produces legal or similarly significant effects on the user, the user has the right to request human review and to express their point of view.

**13. Changes to the Privacy Policy**

**13.1.** The Company has the right to make changes to this Policy. The current version of the Policy is published on the Platform. If the changes materially affect the rights of users, the Company will notify users by means available to the Company.

**14. Contact Information**

Carunity OÜ
Registration code: 17302573
Address: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
Email: info@carunity.eu
`;

const bodyRu = `
**ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ**
Carunity OÜ

**1. Общие положения**

**1.1.** Настоящая Политика конфиденциальности (далее — Политика) определяет порядок, цели, правовые основания и условия обработки персональных данных пользователей платформы CarUnity обществом с ограниченной ответственностью Carunity OÜ (далее — Компания, Оператор, мы).

**1.2.** Для целей настоящей Политики под платформой Carunity (далее — Платформа) понимаются веб-сайт, а также иные цифровые решения, сервисы и интерфейсы, используемые Компанией для предоставления услуг пользователям в Эстонии, Латвии, Литве и, при необходимости, иных странах Европейской экономической зоны.

**1.3.** Компания признаёт особую важность защиты персональных данных и обрабатывает персональные данные законно, справедливо и прозрачно, исключительно для заранее определённых целей и только в той мере, в которой это необходимо для достижения таких целей.

**1.4.** При обработке персональных данных Компания руководствуется Регламентом (ЕС) 2016/679 (GDPR), а также применимыми нормативными актами Эстонской Республики и иными обязательными правовыми нормами.

**1.5.** Используя Платформу, пользователь подтверждает, что ознакомился с настоящей Политикой, понимает порядок обработки своих персональных данных и соглашается с её условиями в той мере, в какой такое согласие требуется применимым законодательством.

**1.6.** Настоящая Политика распространяется на всех физических лиц, которые посещают Платформу, регистрируются на ней, размещают объявления, взаимодействуют с другими пользователями, направляют запросы Компании или иным образом используют Платформу.

**2. Термины и определения**

**2.1.** Персональные данные — любая информация, относящаяся к идентифицированному или идентифицируемому физическому лицу.

**2.2.** Обработка персональных данных — любое действие или совокупность действий с персональными данными, включая сбор, запись, систематизацию, хранение, уточнение, использование, передачу, ограничение, удаление и уничтожение.

**2.3.** Пользователь — физическое или юридическое лицо, использующее Платформу.

**2.4.** Аккаунт — личная учётная запись пользователя на Платформе.

**2.5.** Контент — любые данные, материалы и информация, размещаемые пользователем на Платформе.

**2.6.** Оператор — Carunity OÜ, самостоятельно определяющий цели и средства обработки персональных данных.

**2.7.** Обработчик — физическое или юридическое лицо, обрабатывающее персональные данные от имени Оператора.

**2.8.** Дилер — юридическое лицо или индивидуальный предприниматель, осуществляющий профессиональную деятельность по продаже транспортных средств и использующий Платформу.

**3. Информация об операторе**

**3.1.** Оператором персональных данных является:
Carunity OÜ
Регистрационный код: 17302573
Юридический адрес: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
Email: info@carunity.eu

**4. Принципы обработки персональных данных**

**4.1.** Компания обрабатывает персональные данные законно, справедливо и прозрачно; собирает данные для конкретных, заранее определённых и законных целей; обеспечивает адекватность, актуальность и минимальность данных; принимает меры по обеспечению их точности; хранит данные не дольше необходимого; обеспечивает надлежащую безопасность персональных данных. Компания несёт ответственность за соблюдение указанных принципов.

**5. Источники персональных данных**

**5.1.** Компания получает персональные данные непосредственно от пользователя при регистрации, создании аккаунта, размещении объявлений, приобретении платных услуг или обращении в Компанию; автоматически при использовании Платформы (технические данные, данные устройства, браузера, IP-адрес, cookies); от третьих лиц, включая платёжные сервисы, банки, операторов связи, а также из общедоступных источников, где это допускается законодательством.

**6. Цели обработки, категории данных и правовые основания**

**6.1.** Компания обрабатывает персональные данные в следующих целях:

**6.1.1. Регистрация и администрирование аккаунта** — имя, фамилия, email, телефон, логин, идентификатор пользователя, язык интерфейса, IP-адрес, дата и время регистрации. Правовое основание: исполнение договора (ст. 6(1)(b) GDPR); законный интерес (ст. 6(1)(f) GDPR).

**6.1.2. Размещение и управление объявлениями** — данные профиля, контактные данные, информация в объявлениях, фотографии, технические параметры, данные о местонахождении объекта, история изменений. Правовое основание: исполнение договора (ст. 6(1)(b) GDPR).

**6.1.3. Обеспечение коммуникации между пользователями** — имя, телефон, email, содержание сообщений, время отправки и получения. Правовое основание: исполнение договора; законный интерес (ст. 6(1)(f) GDPR).

**6.1.4. Предоставление платных услуг и проведение платежей** — имя, фамилия, email, телефон, платёжные реквизиты, информация о заказанных услугах, счета, платежи, налоговые данные. Правовое основание: исполнение договора (ст. 6(1)(b) GDPR); соблюдение юридических обязательств (ст. 6(1)(c) GDPR).

**6.1.5. Обработка запросов и жалоб** — имя, фамилия, email, телефон, содержание запроса, прилагаемые документы. Правовое основание: исполнение договора; соблюдение юридических обязательств; законный интерес (ст. 6(1)(f) GDPR).

**6.1.6. Безопасность Платформы и предотвращение мошенничества** — IP-адрес, данные устройства и браузера, данные о поведении пользователя, история активности аккаунта. Правовое основание: законный интерес (ст. 6(1)(f) GDPR).

**6.1.7. Направление служебных уведомлений** — имя, email, телефон, данные устройства для push-уведомлений, настройки уведомлений. Правовое основание: исполнение договора; законный интерес; согласие (ст. 6(1)(a) GDPR) где требуется.

**6.1.8. Аналитика и улучшение Платформы** — анонимизированные или псевдонимизированные данные об использовании, технические данные, данные о взаимодействии. Правовое основание: законный интерес (ст. 6(1)(f) GDPR); согласие (ст. 6(1)(a) GDPR) для необязательных cookies.

**6.1.9. Маркетинг и реклама** — email, телефон, рекламные идентификаторы, данные о взаимодействии с рекламой. Правовое основание: согласие (ст. 6(1)(a) GDPR); законный интерес (ст. 6(1)(f) GDPR) для прямого маркетинга действующим клиентам.

**6.1.10. Обработка данных дилеров** — наименование компании, регистрационный номер, НДС, данные уполномоченного лица, информация об инвентаре транспортных средств, контактные данные, финансовые данные. Правовое основание: исполнение договора; соблюдение юридических обязательств.

**6.1.11. Соблюдение юридических обязательств** — данные, необходимые для выполнения требований законодательства. Правовое основание: соблюдение юридических обязательств (ст. 6(1)(c) GDPR).

**7. Сроки хранения данных**

**7.1.** Персональные данные хранятся в течение срока, необходимого для целей обработки: данные аккаунта — в течение срока действия аккаунта и 3 года после его удаления; данные объявлений — в течение срока действия объявления и 3 года после его удаления; платёжные и финансовые данные — 7 лет; данные, обрабатываемые на основании согласия — до отзыва согласия; данные для защиты правовых требований — до разрешения требования с учётом применимого срока исковой давности.

**8. Передача персональных данных**

**8.1.** Компания может передавать персональные данные: обработчикам, действующим от имени Компании (IT-провайдеры, хостинг, аналитические сервисы); платёжным сервисам; государственным органам в случаях, предусмотренных законодательством; другим пользователям Платформы в части, необходимой для предоставления услуг; партнёрам Компании при наличии согласия пользователя или в случаях, допускаемых законодательством.

**8.2.** В случае передачи персональных данных за пределы Европейской экономической зоны Компания обеспечивает надлежащие гарантии в соответствии с требованиями GDPR, включая использование стандартных договорных положений (SCC), одобренных Европейской Комиссией.

**9. Права субъектов данных**

**9.1.** Пользователи имеют следующие права в соответствии с GDPR:

Право доступа — получить подтверждение обработки и доступ к своим данным.
Право на исправление — запросить исправление неточных или неполных данных.
Право на удаление («право на забвение») — запросить удаление данных в случаях, предусмотренных GDPR.
Право на ограничение обработки — запросить ограничение обработки данных.
Право на переносимость данных — получить данные в структурированном машиночитаемом формате.
Право возражения — возразить против обработки на основании законного интереса или в целях прямого маркетинга.
Право на отзыв согласия — отозвать согласие в любой момент, без ущерба для законности обработки, проведённой до отзыва.
Право на жалобу — подать жалобу в надзорный орган (Инспекция по защите данных Эстонии, www.aki.ee).

**9.2.** Для реализации указанных прав пользователь может обратиться по адресу: info@carunity.eu

**10. Использование cookies**

**10.1.** Компания использует cookies в соответствии с настоящей Политикой и Политикой cookies, являющейся её неотъемлемой частью.

**11. Меры безопасности**

**11.1.** Компания применяет надлежащие технические и организационные меры для обеспечения безопасности персональных данных, включая шифрование данных при передаче (SSL/TLS), контроль доступа, регулярные аудиты безопасности, обучение сотрудников и соглашения об обработке данных с обработчиками.

**12. Автоматизированное принятие решений и профилирование**

**12.1.** Компания может использовать автоматизированные инструменты анализа для оценки активности пользователей, выявления мошеннического поведения и повышения релевантности услуг и рекламы. В случаях, когда автоматизированное принятие решений влечёт юридически значимые или аналогичные последствия для пользователя, пользователь вправе запросить проверку с участием человека и выразить свою позицию.

**13. Изменения Политики**

**13.1.** Компания вправе вносить изменения в настоящую Политику. Актуальная версия публикуется на Платформе. При существенных изменениях, затрагивающих права пользователей, Компания уведомит пользователей доступными способами.

**14. Контактная информация**

Carunity OÜ
Регистрационный код: 17302573
Адрес: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
Email: info@carunity.eu
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

    // Top-level section header: **1. Title**
    if (trimmed.match(/^\*\*\d+\.\s[^*]+\*\*$/) && !trimmed.match(/^\*\*\d+\.\d+/)) {
      const title = trimmed.replace(/\*\*/g, '');
      return (
        <h2 key={i} className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-10 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
          {title}
        </h2>
      );
    }

    // Sub-section like **6.1.1. Title**
    if (trimmed.match(/^\*\*\d+\.\d+(\.\d+)?[\.\s]/)) {
      return (
        <p key={i} className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3 pl-0">
          {parseParts(trimmed)}
        </p>
      );
    }

    return (
      <p key={i} className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
        {parseParts(trimmed)}
      </p>
    );
  });
}

export default function PrivacyPolicy() {
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
        <p className="text-slate-400 text-xs mb-10">Carunity OÜ</p>

        <div>
          {renderBody(body)}
        </div>
      </div>
    </div>
  );
}