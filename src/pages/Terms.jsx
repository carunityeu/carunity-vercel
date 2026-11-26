import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const content = {
  en: {
    pageTitle: 'Terms of Use',
    backLabel: 'Legal Information',
    back: 'Back',
    body: `
**TERMS OF USE OF THE PLATFORM**
Carunity OÜ

**1. General Provisions**

**1.1.** These Terms of Use (hereinafter — the "Terms") govern access to the Carunity platform and the procedure for its use by users.

**1.2.** The Carunity platform (hereinafter — the "Platform") is operated by Carunity OÜ (hereinafter — the "Company", "we").

**1.3.** The Platform is an online service that allows users to place advertisements for the sale of vehicles, search for offers, and interact with each other.

**1.4.** By using the Platform, the user confirms that they have read these Terms, understand their content, and accept them in full.

**1.5.** If the user does not agree with the Terms, they must cease using the Platform.

**1.6.** Certain provisions of these Terms may apply differently depending on the user's status (consumer or professional market participant, including dealers) in accordance with applicable legislation.

**1.7.** When providing the Platform's services, the Company also takes into account the requirements of Directive (EU) 2019/2161 on the modernization of consumer protection legislation, as well as Directive 2000/31/EC on electronic commerce.

**1.8.** The Company operates taking into account the requirements of Regulation (EU) 2022/2065 (Digital Services Act), including obligations to ensure transparency, safety, and counteraction to illegal content.

**2. Legal Status of the Platform**

**2.1.** The Company is not a party to transactions concluded between users.

**2.2.** The Company does not act as a seller, buyer, agent, intermediary, or representative of any party to a transaction.

**2.3.** All transactions are concluded directly between users.

**2.4.** The Company does not guarantee the accuracy of advertisements, the legal purity of vehicles, the actual condition of vehicles, or the performance of obligations by the parties to a transaction.

**3. Registration and Account**

**3.1.** To access certain functions of the Platform, the user must create an account.

**3.2.** The user undertakes to provide accurate and up-to-date information, not create fictitious accounts, and not transfer access to third parties.

**3.3.** The user bears full responsibility for actions performed through their account.

**3.4.** The Company has the right to restrict access, suspend or delete an account, or refuse registration without prior notice in case of violation of the Terms.

**4. Posting Advertisements**

**4.1.** The user has the right to post advertisements for the sale of vehicles subject to compliance with these Terms.

**4.2.** The user undertakes to provide accurate information, not mislead, not post duplicate advertisements, and not use automated posting systems without the Company's consent.

**4.3.** It is prohibited to post false information, advertisements for non-existent goods, advertisements that violate legislation, or advertisements of third-party services without the Company's consent.

**4.4.** The Company has the right to edit, suspend publication, or delete advertisements in case of violation of these Terms, requirements of legislation, or if there are reasonable grounds to believe that the advertisement may violate the rights of third parties or mislead users.

**5. User Content**

**5.1.** The user bears full responsibility for the posted Content.

**5.2.** By posting Content, the user guarantees that they have the right to post it, that the Content does not violate the rights of third parties, and that the Content complies with legislation.

**5.3.** The user grants the Company a non-exclusive, free-of-charge, perpetual license to use the Content for the purposes of functioning and promotion of the Platform.

**6. Prohibited Actions**

**6.1.** The user is prohibited from using the Platform for unlawful purposes, posting fraudulent advertisements, misleading other users, collecting user data without their consent, distributing malicious software, interfering with the operation of the Platform, or bypassing technical restrictions.

**6.2.** The user undertakes to process personal data of other users exclusively in accordance with applicable data protection legislation, including Regulation (EU) 2016/679 (GDPR).

**7. Paid Services**

**7.1.** Certain functions of the Platform may be provided on a paid basis.

**7.2.** The cost and payment terms are published on the Platform.

**7.3.** All payments are final unless otherwise provided by applicable legislation.

**7.4.** All payments made for the use of paid services of the Platform are final, unless otherwise provided by mandatory rules of applicable legislation.
Paid services of the Platform, including listing and promotion of advertisements, are activated automatically and begin to be provided immediately after successful completion of payment.
In the event that the user is a natural person acting outside the scope of entrepreneurial activity, the provisions of consumer protection legislation apply, including the right to withdraw from a distance contract within 14 days.
The user expressly requests the immediate commencement of the service after payment and confirms their agreement that, after activation of the listing or other paid feature, the right to withdraw from the contract and receive a refund is forfeited in accordance with Article 16 of Directive 2011/83/EU, as amended by Directive (EU) 2019/2161.

**7.5.** Refunds are only possible in cases of a technical error of the Platform, duplicate charge, or if the paid service was not actually activated. After activation of a listing, publication of Content, or commencement of a paid service, no refund shall be issued, unless otherwise provided by mandatory rules of applicable legislation.

**8. Limitation of Liability**

**8.1.** The Platform is provided on an "as is" basis to the maximum extent permitted by applicable law.

**8.2.** The Company is not liable for the accuracy of advertisements, actions of users, transactions between users, or losses arising from the use of the Platform.

**8.3.** The Company does not guarantee uninterrupted operation of the Platform, absence of errors, or security of transactions.

**8.4.** To the maximum extent permitted by applicable law, the Company's liability is limited to the amount actually paid by the user for the Platform's services during the last 12 months preceding the relevant claim.

**9. Verification of Users and Anti-Fraud**

**9.1.** The Company has the right to verify users and posted Content, request additional data, restrict functionality, or block users in case of suspicion of fraud.

**9.2.** The Company has the right to use automated systems and algorithms to detect fraudulent activity, violations of the Terms, and to ensure the security of the Platform.

**10. Intellectual Property**

**10.1.** All rights to the Platform belong to the Company or its partners. It is prohibited to copy, distribute, or modify elements of the Platform without permission.

**11. Personal Data**

**11.1.** Processing of personal data is carried out in accordance with the Carunity Privacy Policy.

**11.2.** The use of cookies is carried out in accordance with Directive 2002/58/EC (ePrivacy Directive), taking into account applicable legislation and GDPR.

**12. Suspension and Termination of Access**

**12.1.** The Company has the right to restrict or terminate a user's access to the Platform in case of violation of the Terms, requirements of legislation, threats to security, or suspicion of fraud.

**12.2.** The user has the right to cease using the Platform at any time. Deletion of the account is carried out upon the user's request.

**13. Dispute Resolution**

**13.1.** The Company does not participate in disputes between users.

**13.2.** Users undertake to resolve disputes independently.

**13.3.** These Terms are governed by the legislation of the Republic of Estonia.

**13.4.** Disputes shall be subject to consideration in the courts of Estonia, unless otherwise provided by mandatory rules of law.

**14. Force Majeure**

**14.1.** The Company is not liable for full or partial failure to perform obligations if such failure is caused by circumstances beyond the reasonable control of the Company, including internet failures, actions of state authorities, emergencies, infrastructure failures, cyberattacks, or other unforeseen circumstances.

**15. Amendments to the Terms**

**15.1.** The Company has the right to amend these Terms. The updated version is published on the Platform.

**15.2.** In the event of discrepancies between versions of the Terms in different languages, the English version shall prevail, unless otherwise provided by applicable law.

**16. Automated Listing Import**

**16.1.** If the Dealer uses the automated listing import feature (the "Import Feature"), the Dealer grants CarUnity a non-exclusive, worldwide, royalty-free right to access, collect, copy, process, and display vehicle listing data from the website or other data source specified by the Dealer.

**16.2.** The Dealer represents and warrants that: they are the lawful owner of the data or hold all necessary rights, licenses, and permissions to use and grant CarUnity the right to use the imported data, including but not limited to texts, images, specifications, and other content; the use, copying, and display of the data by CarUnity does not infringe any intellectual property rights, database rights, or other third-party rights; the specified data source is lawfully accessible and does not contain restrictions prohibiting automated access or data extraction; the data provided is accurate and up-to-date to the best of their knowledge.

**16.3.** The Dealer acknowledges and agrees that CarUnity: acts solely as a technical intermediary and does not verify the accuracy, completeness, or legality of the imported data; bears no liability for any claims, losses, or damages arising from the use of the imported data; may suspend or disable the Import Feature at any time if there are reasonable grounds to suspect a violation of applicable law or third-party rights.

**16.4.** The Dealer may disable the Import Feature at any time and request removal of imported listings in accordance with these Terms.

**17. Contact Information**

Carunity OÜ
Email: info@carunity.eu
Address: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
`
  },
  ru: {
    pageTitle: 'Условия использования',
    backLabel: 'Правовая информация',
    back: 'Назад',
    body: `
**УСЛОВИЯ ИСПОЛЬЗОВАНИЯ ПЛАТФОРМЫ**
Carunity OÜ

**1. Общие положения**

**1.1.** Настоящие Условия использования (далее — Условия) регулируют доступ к платформе CarUnity и порядок её использования пользователями.

**1.2.** Платформа Carunity (далее — Платформа) управляется обществом с ограниченной ответственностью Carunity OÜ (далее — Компания, мы).

**1.3.** Платформа представляет собой онлайн-сервис, позволяющий пользователям размещать объявления о продаже транспортных средств, искать предложения и взаимодействовать друг с другом.

**1.4.** Используя Платформу, пользователь подтверждает, что он ознакомился с настоящими Условиями, понимает их содержание и принимает их в полном объёме.

**1.5.** Если пользователь не согласен с Условиями, он обязан прекратить использование Платформы.

**1.6.** Отдельные положения настоящих Условий могут применяться по-разному в зависимости от статуса пользователя (потребитель или профессиональный участник рынка, включая дилеров) в соответствии с применимым законодательством.

**1.7.** При предоставлении услуг Платформы Компания также учитывает требования Директивы (ЕС) 2019/2161 о модернизации законодательства о защите прав потребителей, а также Директивы 2000/31/EC об электронной коммерции.

**1.8.** Компания осуществляет деятельность с учётом требований Регламента (ЕС) 2022/2065 (Digital Services Act), включая обязанности по обеспечению прозрачности, безопасности и противодействию незаконному контенту.

**2. Правовой статус Платформы**

**2.1.** Компания не является стороной сделок, заключаемых между пользователями.

**2.2.** Компания не выступает продавцом, покупателем, агентом, посредником или представителем какой-либо стороны сделки.

**2.3.** Все сделки заключаются напрямую между пользователями.

**2.4.** Компания не гарантирует достоверность объявлений, юридическую чистоту транспортных средств, фактическое состояние автомобилей или выполнение обязательств сторонами сделки.

**3. Регистрация и учётная запись**

**3.1.** Для доступа к отдельным функциям Платформы пользователь обязан создать учётную запись.

**3.2.** Пользователь обязуется предоставлять достоверную и актуальную информацию, не создавать фиктивные аккаунты и не передавать доступ третьим лицам.

**3.3.** Пользователь несёт полную ответственность за действия, совершённые через его учётную запись.

**3.4.** Компания вправе ограничить доступ, приостановить или удалить аккаунт, отказать в регистрации без предварительного уведомления в случае нарушения Условий.

**4. Размещение объявлений**

**4.1.** Пользователь вправе размещать объявления о продаже транспортных средств при соблюдении настоящих Условий.

**4.2.** Пользователь обязуется указывать достоверную информацию, не вводить в заблуждение, не размещать дублирующиеся объявления и не использовать автоматизированные системы размещения без согласия Компании.

**4.3.** Запрещается размещение ложной информации, объявлений о несуществующих товарах, объявлений, нарушающих законодательство, или рекламы сторонних сервисов без согласия Компании.

**4.4.** Компания вправе редактировать, приостанавливать публикацию или удалять объявления в случае нарушения настоящих Условий, требований законодательства либо при наличии разумных оснований полагать, что объявление может нарушать права третьих лиц или вводить пользователей в заблуждение.

**5. Контент пользователей**

**5.1.** Пользователь несёт полную ответственность за размещённый Контент.

**5.2.** Размещая Контент, пользователь гарантирует, что он имеет право на его размещение, Контент не нарушает права третьих лиц и соответствует законодательству.

**5.3.** Пользователь предоставляет Компании неисключительную, безвозмездную, бессрочную лицензию на использование Контента в целях функционирования и продвижения Платформы.

**6. Запрещённые действия**

**6.1.** Пользователю запрещается использовать Платформу в незаконных целях, размещать мошеннические объявления, вводить других пользователей в заблуждение, собирать данные пользователей без их согласия, распространять вредоносное ПО, вмешиваться в работу Платформы или обходить технические ограничения.

**6.2.** Пользователь обязуется обрабатывать персональные данные других пользователей исключительно в соответствии с применимым законодательством о защите данных, включая Регламент (ЕС) 2016/679 (GDPR).

**7. Платные услуги**

**7.1.** Отдельные функции Платформы могут предоставляться на платной основе.

**7.2.** Стоимость и условия оплаты публикуются на Платформе.

**7.3.** Все платежи являются окончательными, если иное не предусмотрено законодательством.

**7.4.** Все платежи, осуществлённые за использование платных услуг Платформы, являются окончательными, если иное не предусмотрено обязательными нормами применимого законодательства.
Платные услуги Платформы, включая размещение и продвижение объявлений, активируются автоматически и начинают оказываться немедленно после успешного завершения оплаты.
В случае, если пользователем является физическое лицо, действующее вне рамок предпринимательской деятельности, на него распространяются положения законодательства о защите прав потребителей, включая право на отказ от дистанционного договора в течение 14 дней.
Пользователь прямо запрашивает немедленное начало оказания услуги после оплаты и подтверждает своё согласие с тем, что после активации объявления или иной платной функции право на отказ от договора и получение возврата денежных средств утрачивается в соответствии со статьёй 16 Директивы 2011/83/ЕС с учётом изменений, внесённых Директивой (ЕС) 2019/2161.

**7.5.** Возврат денежных средств возможен исключительно в случаях технической ошибки Платформы, повторного списания платежа либо если оплаченная услуга фактически не была активирована. После активации объявления, публикации Контента или начала оказания платной услуги возврат денежных средств не осуществляется, если иное не предусмотрено обязательными нормами применимого законодательства.

**8. Ограничение ответственности**

**8.1.** Платформа предоставляется по принципу «как есть» (as is) в максимально допустимой степени в соответствии с применимым законодательством.

**8.2.** Компания не несёт ответственности за достоверность объявлений, действия пользователей, сделки между пользователями или убытки, возникшие в результате использования Платформы.

**8.3.** Компания не гарантирует бесперебойную работу Платформы, отсутствие ошибок или безопасность сделок.

**8.4.** В максимальной степени, допустимой применимым законодательством, ответственность Компании ограничивается суммой, фактически уплаченной пользователем за услуги Платформы за последние 12 месяцев, предшествующих возникновению соответствующего требования.

**9. Проверка пользователей и антифрод**

**9.1.** Компания вправе осуществлять проверку пользователей и размещаемого Контента, запрашивать дополнительные данные, ограничивать функционал или блокировать пользователей при подозрении на мошенничество.

**9.2.** Компания вправе использовать автоматизированные системы и алгоритмы для выявления мошеннической активности, нарушений Условий и обеспечения безопасности Платформы.

**10. Интеллектуальная собственность**

**10.1.** Все права на Платформу принадлежат Компании или её партнёрам. Запрещается копирование, распространение или модификация элементов Платформы без разрешения.

**11. Персональные данные**

**11.1.** Обработка персональных данных осуществляется в соответствии с Политикой конфиденциальности Carunity.

**11.2.** Использование cookies осуществляется в соответствии с Директивой 2002/58/EC (ePrivacy Directive) с учётом применимого законодательства и GDPR.

**12. Приостановление и прекращение доступа**

**12.1.** Компания вправе ограничить или прекратить доступ пользователя к Платформе в случае нарушения Условий, требований законодательства, угрозы безопасности или подозрения в мошенничестве.

**12.2.** Пользователь вправе прекратить использование Платформы в любой момент. Удаление учётной записи осуществляется по запросу пользователя.

**13. Разрешение споров**

**13.1.** Компания не участвует в спорах между пользователями.

**13.2.** Пользователи обязуются самостоятельно урегулировать споры.

**13.3.** Настоящие Условия регулируются законодательством Эстонской Республики.

**13.4.** Споры подлежат рассмотрению в судах Эстонии, если иное не предусмотрено обязательными нормами права.

**14. Форс-мажор**

**14.1.** Компания не несёт ответственности за полное или частичное неисполнение обязательств, если такое неисполнение вызвано обстоятельствами вне разумного контроля Компании, включая сбои в работе интернета, действия государственных органов, чрезвычайные ситуации, перебои в работе инфраструктуры, кибератаки или иные непредвиденные обстоятельства.

**15. Изменения Условий**

**15.1.** Компания вправе изменять настоящие Условия. Обновлённая версия публикуется на Платформе.

**15.2.** В случае наличия версий настоящих Условий на нескольких языках, приоритет имеет версия на английском языке, если иное не предусмотрено применимым законодательством.

**16. Автоматический импорт объявлений**

**16.1.** В случае, если Дилер использует функцию автоматического импорта объявлений («Функция импорта»), Дилер предоставляет CarUnity неисключительное, всемирное, безвозмездное право на доступ, сбор, копирование, обработку и отображение данных объявлений о транспортных средствах с указанного Дилером веб-сайта или иного источника данных.

**16.2.** Дилер заявляет и гарантирует, что: он является законным владельцем данных или обладает всеми необходимыми правами, лицензиями и разрешениями на использование и предоставление CarUnity права использовать импортируемые данные, включая, но не ограничиваясь текстами, изображениями, характеристиками и иным контентом; использование, копирование и отображение данных CarUnity не нарушает права интеллектуальной собственности, права на базы данных или иные права третьих лиц; указанный источник данных доступен на законных основаниях и не содержит ограничений, запрещающих автоматизированный доступ или извлечение данных; предоставляемые данные являются точными и актуальными в пределах его осведомлённости.

**16.3.** Дилер подтверждает и соглашается с тем, что CarUnity: действует исключительно как технический посредник и не проверяет точность, полноту или законность импортируемых данных; не несёт ответственности за какие-либо претензии, убытки или ущерб, возникающие в связи с использованием импортируемых данных; вправе приостановить или отключить Функцию импорта в любое время при наличии обоснованных подозрений на нарушение законодательства или прав третьих лиц.

**16.4.** Дилер вправе в любой момент отключить Функцию импорта и запросить удаление импортированных объявлений в соответствии с настоящими Условиями.

**17. Контактная информация**

Carunity OÜ
Email: info@carunity.eu
Адрес: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
`
  },
  et: {
    pageTitle: 'Kasutustingimused',
    backLabel: 'Õiguslik teave',
    back: 'Tagasi',
    body: `
**PLATVORMI KASUTUSTINGIMUSED**
Carunity OÜ

**1. Üldsätted**

**1.1.** Käesolevad kasutustingimused (edaspidi — Tingimused) reguleerivad juurdepääsu CarUnity platvormile ja selle kasutamise korda kasutajate poolt.

**1.2.** Platvorm Carunity (edaspidi — Platvorm) haldab osaühing Carunity OÜ (edaspidi — Ettevõte, meie).

**1.3.** Platvorm kujutab endast veebiteenust, mis võimaldab kasutajatel avaldada sõidukite müügikuulutusi, otsida pakkumisi ja omavahel suhelda.

**1.4.** Platvormi kasutades kinnitab kasutaja, et ta on tutvunud käesolevate Tingimustega, mõistab nende sisu ja aktsepteerib neid täielikult.

**1.5.** Kui kasutaja ei nõustu Tingimustega, on ta kohustatud lõpetama Platvormi kasutamise.

**1.6.** Käesolevate Tingimuste teatud sätted võivad kohalduda erinevalt sõltuvalt kasutaja staatusest (tarbija või professionaalne turuosaline, sealhulgas edasimüüjad) vastavalt kohaldatavatele õigusaktidele.

**1.7.** Platvormi teenuste osutamisel arvestab Ettevõte samuti Euroopa Parlamendi ja nõukogu direktiivi (EL) 2019/2161 nõudeid tarbijakaitse õigusaktide ajakohastamise kohta, samuti direktiivi 2000/31/EÜ elektroonilise kaubanduse kohta.

**1.8.** Ettevõte tegutseb, arvestades Euroopa Parlamendi ja nõukogu määruse (EL) 2022/2065 (Digital Services Act) nõudeid, sealhulgas kohustusi tagada läbipaistvus, turvalisus ja võidelda ebaseadusliku sisuga.

**2. Platvormi õiguslik staatus**

**2.1.** Ettevõte ei ole kasutajate vahel sõlmitavate tehingute osapool.

**2.2.** Ettevõte ei tegutse müüjana, ostjana, agendina, vahendajana ega ühegi tehingu osapoole esindajana.

**2.3.** Kõik tehingud sõlmitakse otse kasutajate vahel.

**2.4.** Ettevõte ei garanteeri kuulutuste õigsust, sõidukite juriidilist puhtust, sõidukite tegelikku seisukorda ega tehingu osapoolte kohustuste täitmist.

**3. Registreerimine ja kasutajakonto**

**3.1.** Teatud Platvormi funktsioonidele juurdepääsuks on kasutaja kohustatud looma kasutajakonto.

**3.2.** Kasutaja kohustub esitama tõese ja ajakohase teabe, mitte looma fiktiivseid kontosid ja mitte andma juurdepääsu kolmandatele isikutele.

**3.3.** Kasutaja kannab täielikku vastutust oma kasutajakonto kaudu tehtud toimingute eest.

**3.4.** Ettevõttel on õigus piirata juurdepääsu, peatada või kustutada konto, keelduda registreerimisest ilma eelneva teavituseta Tingimuste rikkumise korral.

**4. Kuulutuste avaldamine**

**4.1.** Kasutajal on õigus avaldada sõidukite müügikuulutusi käesolevate Tingimuste järgimisel.

**4.2.** Kasutaja kohustub esitama tõese teabe, mitte eksitama, mitte avaldama dubleerivaid kuulutusi ja mitte kasutama automatiseeritud süsteeme kuulutuste avaldamiseks ilma Ettevõtte nõusolekuta.

**4.3.** Keelatud on avaldada valeinfot, olematute kaupade kuulutusi, õigusakte rikkuvaid kuulutusi või reklaami kolmandate isikute teenuste kohta ilma Ettevõtte nõusolekuta.

**4.4.** Ettevõttel on õigus muuta, peatada avaldamine või kustutada kuulutusi käesolevate Tingimuste, õigusaktide nõuete rikkumise korral või juhul, kui on põhjendatud alus arvata, et kuulutus võib rikkuda kolmandate isikute õigusi või eksitada kasutajaid.

**5. Kasutajate sisu**

**5.1.** Kasutaja kannab täielikku vastutust avaldatud Sisu eest.

**5.2.** Sisu avaldades kinnitab kasutaja, et tal on õigus seda avaldada, Sisu ei riku kolmandate isikute õigusi ja Sisu vastab õigusaktidele.

**5.3.** Kasutaja annab Ettevõttele mitteeksklusiivse, tasuta, tähtajatu litsentsi Sisu kasutamiseks Platvormi toimimise ja edendamise eesmärgil.

**6. Keelatud tegevused**

**6.1.** Kasutajal on keelatud kasutada Platvormi ebaseaduslikel eesmärkidel, avaldada pettuslikke kuulutusi, eksitada teisi kasutajaid, koguda kasutajate andmeid ilma nende nõusolekuta, levitada pahavara, sekkuda Platvormi toimimisse või mööda hiilida tehnilistest piirangutest.

**6.2.** Kasutaja kohustub töötlema teiste kasutajate isikuandmeid üksnes vastavalt kohaldatavatele andmekaitsealastele õigusaktidele, sealhulgas Euroopa Parlamendi ja nõukogu määrusele (EL) 2016/679 (GDPR).

**7. Tasulised teenused**

**7.1.** Teatud Platvormi funktsioonid võivad olla tasulised.

**7.2.** Hind ja maksetingimused avaldatakse Platvormil.

**7.3.** Kõik maksed on lõplikud, kui kohaldatavad õigusaktid ei sätesta teisiti.

**7.4.** Kõik Platvormi tasuliste teenuste kasutamise eest tehtud maksed on lõplikud, kui kohaldatavad kohustuslikud õigusnormid ei sätesta teisiti.
Platvormi tasulised teenused, sealhulgas kuulutuste avaldamine ja reklaamimine, aktiveeritakse automaatselt ja algavad vahetult pärast makse edukat sooritamist.
Juhul kui kasutaja on füüsiline isik, kes tegutseb väljaspool ettevõtlustegevust, kohaldatakse talle tarbijakaitsealaseid õigusakte, sealhulgas õigust kauglepingust taganeda 14 päeva jooksul.
Kasutaja taotleb sõnaselgelt teenuse kohest alustamist pärast makse sooritamist ja kinnitab oma nõusolekut sellega, et pärast kuulutuse või muu tasulise funktsiooni aktiveerimist kaotab ta lepingust taganemise ja raha tagasisaamise õiguse vastavalt direktiivi 2011/83/EL artiklile 16, mida on muudetud direktiiviga (EL) 2019/2161.

**7.5.** Tagasimaksed on võimalikud ainult Platvormi tehnilise vea, topeltmakse või tegelikult aktiveerimata jäänud teenuse korral. Pärast kuulutuse aktiveerimist, Sisu avaldamist või tasulise teenuse osutamise alustamist tagasimakseid ei tehta, kui kohaldatavad kohustuslikud õigusnormid ei sätesta teisiti.

**8. Vastutuse piiramine**

**8.1.** Platvormi pakutakse põhimõttel "nagu on" (as is) maksimaalses ulatuses, mis on lubatud kohaldatava õigusega.

**8.2.** Ettevõte ei vastuta kuulutuste õigsuse, kasutajate tegevuse, kasutajatevaheliste tehingute ega Platvormi kasutamisest tulenevate kahjude eest.

**8.3.** Ettevõte ei garanteeri Platvormi katkematut toimimist, vigade puudumist ega tehingute turvalisust.

**8.4.** Maksimaalses ulatuses, mis on lubatud kohaldatava õigusega, on Ettevõtte vastutus piiratud summaga, mille kasutaja on tegelikult tasunud Platvormi teenuste eest viimase 12 kuu jooksul enne vastava nõude tekkimist.

**9. Kasutajate kontroll ja pettusevastased meetmed**

**9.1.** Ettevõttel on õigus teostada kasutajate ja avaldatud Sisu kontrolli, nõuda täiendavaid andmeid, piirata funktsionaalsust või blokeerida kasutajaid pettuse kahtluse korral.

**9.2.** Ettevõttel on õigus kasutada automatiseeritud süsteeme ja algoritme pettuste, Tingimuste rikkumiste tuvastamiseks ning Platvormi turvalisuse tagamiseks.

**10. Intellektuaalne omand**

**10.1.** Kõik õigused Platvormile kuuluvad Ettevõttele või tema partneritele. Keelatud on kopeerimine, levitamine või Platvormi elementide muutmine ilma loata.

**11. Isikuandmed**

**11.1.** Isikuandmete töötlemine toimub vastavalt Carunity privaatsuspoliitikale.

**11.2.** Küpsiste kasutamine toimub vastavalt direktiivile 2002/58/EÜ (ePrivacy Directive), arvestades kohaldatavat õigust ja GDPR-i.

**12. Juurdepääsu peatamine ja lõpetamine**

**12.1.** Ettevõttel on õigus piirata või lõpetada kasutaja juurdepääs Platvormile Tingimuste rikkumise, õigusaktide nõuete, turvalisuse ohu või pettuse kahtluse korral.

**12.2.** Kasutajal on õigus lõpetada Platvormi kasutamine igal ajal. Konto kustutamine toimub kasutaja taotluse alusel.

**13. Vaidluste lahendamine**

**13.1.** Ettevõte ei osale kasutajatevahelistes vaidlustes.

**13.2.** Kasutajad kohustuvad lahendama vaidlused iseseisvalt.

**13.3.** Käesolevaid Tingimusi reguleerib Eesti Vabariigi õigus.

**13.4.** Vaidlused lahendatakse Eesti kohtutes, kui kohustuslikud õigusnormid ei sätesta teisiti.

**14. Vääramatu jõud**

**14.1.** Ettevõte ei vastuta kohustuste täieliku või osalise täitmata jätmise eest, kui see on põhjustatud asjaoludest, mis ei ole mõistlikult Ettevõtte kontrolli all, sealhulgas internetikatkestused, riigiasutuste tegevus, erakorralised olukorrad, infrastruktuuri häired, küberrünnakud või muud ettenägematud asjaolud.

**15. Tingimuste muutmine**

**15.1.** Ettevõttel on õigus käesolevaid Tingimusi muuta. Uuendatud versioon avaldatakse Platvormil.

**15.2.** Kui Tingimused on esitatud mitmes keeles, on ingliskeelne versioon ülimuslik, kui kohaldatav õigus ei sätesta teisiti.

**16. Kontaktandmed**

Carunity OÜ
Email: info@carunity.eu
Aadress: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
`
  },
  lv: {
    pageTitle: 'Lietošanas noteikumi',
    backLabel: 'Juridiskā informācija',
    back: 'Atpakaļ',
    body: `
**PLATFORMAS LIETOŠANAS NOTEIKUMI**
Carunity OÜ

**1. Vispārīgie noteikumi**

**1.1.** Šie Lietošanas noteikumi (turpmāk — Noteikumi) regulē piekļuvi CarUnity platformai un tās izmantošanas kārtību lietotājiem.

**1.2.** Platformu Carunity (turpmāk — Platforma) pārvalda sabiedrība ar ierobežotu atbildību Carunity OÜ (turpmāk — Uzņēmums, mēs).

**1.3.** Platforma ir tiešsaistes pakalpojums, kas ļauj lietotājiem izvietot transportlīdzekļu pārdošanas sludinājumus, meklēt piedāvājumus un savstarpēji mijiedarboties.

**1.4.** Izmantojot Platformu, lietotājs apstiprina, ka viņš ir iepazinies ar šiem Noteikumiem, saprot to saturu un pieņem tos pilnā apjomā.

**1.5.** Ja lietotājs nepiekrīt Noteikumiem, viņam ir pienākums pārtraukt Platformas izmantošanu.

**1.6.** Atsevišķi šo Noteikumu nosacījumi var tikt piemēroti atšķirīgi atkarībā no lietotāja statusa (patērētājs vai profesionāls tirgus dalībnieks, tostarp dīleri) saskaņā ar piemērojamo likumdošanu.

**1.7.** Sniedzot Platformas pakalpojumus, Uzņēmums ņem vērā arī Direktīvas (ES) 2019/2161 prasības par patērētāju tiesību aizsardzības modernizāciju, kā arī Direktīvu 2000/31/EK par elektronisko komerciju.

**1.8.** Uzņēmums veic darbību, ņemot vērā Regulas (ES) 2022/2065 (Digital Services Act) prasības, tostarp pienākumus nodrošināt caurspīdīgumu, drošību un cīnīties pret nelikumīgu saturu.

**2. Platformas juridiskais statuss**

**2.1.** Uzņēmums nav darījumu puse, kas tiek noslēgti starp lietotājiem.

**2.2.** Uzņēmums neuzstājas kā pārdevējs, pircējs, aģents, starpnieks vai kādas darījuma puses pārstāvis.

**2.3.** Visi darījumi tiek noslēgti tieši starp lietotājiem.

**2.4.** Uzņēmums negarantē sludinājumu patiesumu, transportlīdzekļu juridisko tīrību, automobiļu faktisko stāvokli vai darījuma pušu saistību izpildi.

**3. Reģistrācija un lietotāja konts**

**3.1.** Lai piekļūtu atsevišķām Platformas funkcijām, lietotājam ir pienākums izveidot lietotāja kontu.

**3.2.** Lietotājs apņemas sniegt patiesu un aktuālu informāciju, neveidot fiktīvus kontus un nenodot piekļuvi trešajām personām.

**3.3.** Lietotājs pilnībā atbild par darbībām, kas veiktas, izmantojot viņa kontu.

**3.4.** Uzņēmumam ir tiesības ierobežot piekļuvi, apturēt vai dzēst kontu, atteikt reģistrāciju bez iepriekšēja paziņojuma Noteikumu pārkāpuma gadījumā.

**4. Sludinājumu izvietošana**

**4.1.** Lietotājam ir tiesības izvietot transportlīdzekļu pārdošanas sludinājumus, ievērojot šos Noteikumus.

**4.2.** Lietotājs apņemas norādīt patiesu informāciju, nemaldināt, neizvietot dublējošus sludinājumus un neizmantot automatizētas izvietošanas sistēmas bez Uzņēmuma piekrišanas.

**4.3.** Aizliegts izvietot nepatiesu informāciju, sludinājumus par neesošām precēm, sludinājumus, kas pārkāpj likumdošanu, vai trešo personu pakalpojumu reklāmu bez Uzņēmuma piekrišanas.

**4.4.** Uzņēmumam ir tiesības rediģēt, apturēt publikāciju vai dzēst sludinājumus šo Noteikumu, likumdošanas prasību pārkāpuma gadījumā vai ja ir pamatots iemesls uzskatīt, ka sludinājums var pārkāpt trešo personu tiesības vai maldināt lietotājus.

**5. Lietotāju saturs**

**5.1.** Lietotājs pilnībā atbild par izvietoto Saturu.

**5.2.** Izvietojot Saturu, lietotājs garantē, ka viņam ir tiesības to izvietot, Saturs nepārkāpj trešo personu tiesības un Saturs atbilst likumdošanai.

**5.3.** Lietotājs piešķir Uzņēmumam neekskluzīvu, bezmaksas, beztermiņa licenci izmantot Saturu Platformas darbības un attīstības nolūkos.

**6. Aizliegtās darbības**

**6.1.** Lietotājam ir aizliegts izmantot Platformu nelikumīgiem mērķiem, izvietot krāpnieciskus sludinājumus, maldināt citus lietotājus, vākt lietotāju datus bez viņu piekrišanas, izplatīt kaitīgu programmatūru, iejaukties Platformas darbībā vai apiet tehniskos ierobežojumus.

**6.2.** Lietotājs apņemas apstrādāt citu lietotāju personas datus tikai saskaņā ar piemērojamo datu aizsardzības likumdošanu, tostarp Regulu (ES) 2016/679 (GDPR).

**7. Maksas pakalpojumi**

**7.1.** Atsevišķas Platformas funkcijas var tikt nodrošinātas par maksu.

**7.2.** Cena un apmaksas nosacījumi tiek publicēti Platformā.

**7.3.** Visi maksājumi ir galīgi, ja vien likumdošana neparedz citādi.

**7.4.** Visi maksājumi, kas veikti par Platformas maksas pakalpojumu izmantošanu, ir galīgi, ja vien piemērojamās obligātās tiesību normas neparedz citādi.
Platformas maksas pakalpojumi, tostarp sludinājumu izvietošana un reklamēšana, tiek aktivizēti automātiski un sāk tikt sniegti nekavējoties pēc veiksmīgas maksājuma veikšanas.
Gadījumā, ja lietotājs ir fiziska persona, kas darbojas ārpus uzņēmējdarbības ietvariem, uz viņu attiecas patērētāju tiesību aizsardzības likumdošana, tostarp tiesības atteikties no distances līguma 14 dienu laikā.
Lietotājs skaidri pieprasa pakalpojuma nekavējošu uzsākšanu pēc maksājuma veikšanas un apliecina savu piekrišanu tam, ka pēc sludinājuma vai citas maksas funkcijas aktivizēšanas tiesības atteikties no līguma un saņemt naudas atmaksu tiek zaudētas saskaņā ar Direktīvas 2011/83/ES 16. pantu, kas grozīts ar Direktīvu (ES) 2019/2161.

**7.5.** Naudas atmaksa iespējama tikai Platformas tehniskas kļūdas, dubultas iekasēšanas vai faktiski neaktivizēta pakalpojuma gadījumā. Pēc sludinājuma aktivizēšanas, Satura publicēšanas vai maksas pakalpojuma sniegšanas uzsākšanas naudas atmaksa netiek veikta, ja vien piemērojamās obligātās tiesību normas neparedz citādi.

**8. Atbildības ierobežojums**

**8.1.** Platforma tiek nodrošināta pēc principa "kā ir" (as is) maksimāli pieļaujamajā apmērā saskaņā ar piemērojamo likumdošanu.

**8.2.** Uzņēmums neuzņemas atbildību par sludinājumu patiesumu, lietotāju darbībām, darījumiem starp lietotājiem vai zaudējumiem, kas radušies Platformas izmantošanas rezultātā.

**8.3.** Uzņēmums negarantē nepārtrauktu Platformas darbību, kļūdu neesamību vai darījumu drošību.

**8.4.** Maksimālajā apmērā, ko pieļauj piemērojamā likumdošana, Uzņēmuma atbildība ir ierobežota ar summu, ko lietotājs faktiski samaksājis par Platformas pakalpojumiem pēdējo 12 mēnešu laikā pirms attiecīgās prasības rašanās.

**9. Lietotāju pārbaude un krāpšanas novēršana**

**9.1.** Uzņēmumam ir tiesības veikt lietotāju un izvietotā Satura pārbaudi, pieprasīt papildu datus, ierobežot funkcionalitāti vai bloķēt lietotājus aizdomu par krāpšanu gadījumā.

**9.2.** Uzņēmumam ir tiesības izmantot automatizētas sistēmas un algoritmus krāpnieciskas darbības, Noteikumu pārkāpumu atklāšanai un Platformas drošības nodrošināšanai.

**10. Intelektuālais īpašums**

**10.1.** Visas tiesības uz Platformu pieder Uzņēmumam vai tā partneriem. Ir aizliegts kopēt, izplatīt vai modificēt Platformas elementus bez atļaujas.

**11. Personas dati**

**11.1.** Personas datu apstrāde tiek veikta saskaņā ar Carunity Privātuma politiku.

**11.2.** Sīkdatņu (cookies) izmantošana tiek veikta saskaņā ar Direktīvu 2002/58/EK (ePrivacy Directive), ņemot vērā piemērojamo likumdošanu un GDPR.

**12. Piekļuves apturēšana un izbeigšana**

**12.1.** Uzņēmumam ir tiesības ierobežot vai izbeigt lietotāja piekļuvi Platformai Noteikumu pārkāpuma, likumdošanas prasību pārkāpuma, drošības apdraudējuma vai aizdomu par krāpšanu gadījumā.

**12.2.** Lietotājam ir tiesības pārtraukt Platformas izmantošanu jebkurā laikā. Lietotāja konta dzēšana tiek veikta pēc lietotāja pieprasījuma.

**13. Strīdu risināšana**

**13.1.** Uzņēmums nepiedalās strīdos starp lietotājiem.

**13.2.** Lietotāji apņemas patstāvīgi risināt strīdus.

**13.3.** Šie Noteikumi tiek regulēti ar Igaunijas Republikas likumdošanu.

**13.4.** Strīdi tiek izskatīti Igaunijas tiesās, ja vien obligātās tiesību normas neparedz citādi.

**14. Nepārvarama vara**

**14.1.** Uzņēmums neuzņemas atbildību par pilnīgu vai daļēju saistību neizpildi, ja šāda neizpilde ir radusies interneta darbības traucējumu, valsts iestāžu darbības, ārkārtas situāciju, infrastruktūras darbības traucējumu, kiberuzbrukumu vai citu neparedzētu apstākļu dēļ.

**15. Noteikumu izmaiņas**

**15.1.** Uzņēmumam ir tiesības mainīt šos Noteikumus. Atjauninātā versija tiek publicēta Platformā.

**15.2.** Ja šie Noteikumi ir pieejami vairākās valodās, priekšroka ir versijai angļu valodā, ja vien piemērojamā likumdošana neparedz citādi.

**16. Kontaktinformācija**

Carunity OÜ
E-pasts: info@carunity.eu
Adrese: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
`
  },
  lt: {
    pageTitle: 'Naudojimosi sąlygos',
    backLabel: 'Teisinė informacija',
    back: 'Atgal',
    body: `
**NAUDOJIMOSI PLATFORMA SĄLYGOS**
Carunity OÜ

**1. Bendrosios nuostatos**

**1.1.** Šios naudojimosi sąlygos (toliau — Sąlygos) reglamentuoja prieigą prie CarUnity platformos ir jos naudojimo tvarką naudotojams.

**1.2.** Platformą Carunity (toliau — Platforma) valdo ribotos atsakomybės bendrovė Carunity OÜ (toliau — Bendrovė, mes).

**1.3.** Platforma yra internetinė paslauga, leidžianti naudotojams skelbti transporto priemonių pardavimo skelbimus, ieškoti pasiūlymų ir bendrauti tarpusavyje.

**1.4.** Naudodamasis Platforma naudotojas patvirtina, kad jis susipažino su šiomis Sąlygomis, supranta jų turinį ir priima jas visa apimtimi.

**1.5.** Jei naudotojas nesutinka su Sąlygomis, jis privalo nutraukti naudojimąsi Platforma.

**1.6.** Kai kurios šių Sąlygų nuostatos gali būti taikomos skirtingai, priklausomai nuo naudotojo statuso (vartotojas arba profesionalus rinkos dalyvis, įskaitant dilerius), pagal taikomus teisės aktus.

**1.7.** Teikdama Platformos paslaugas Bendrovė taip pat atsižvelgia į Euroopa Parlamento ir Tarybos direktyvos (ES) 2019/2161 reikalavimus dėl vartotojų apsaugos teisės aktų modernizavimo, taip pat į Direktyvą 2000/31/EB dėl elektroninės komercijos.

**1.8.** Bendrovė vykdo veiklą atsižvelgdama į Reglamento (ES) 2022/2065 (Digital Services Act) reikalavimus, įskaitant pareigas užtikrinti skaidrumą, saugumą ir kovą su neteisėtu turiniu.

**2. Platformos teisinis statusas**

**2.1.** Bendrovė nėra sandorių, sudaromų tarp naudotojų, šalis.

**2.2.** Bendrovė neveikia kaip pardavėjas, pirkėjas, agentas, tarpininkas ar bet kurios sandorio šalies atstovas.

**2.3.** Visi sandoriai sudaromi tiesiogiai tarp naudotojų.

**2.4.** Bendrovė negarantuoja skelbimų patikimumo, transporto priemonių teisinio švarumo, faktinės automobilių būklės ar sandorio šalių įsipareigojimų vykdymo.

**3. Registracija ir paskyra**

**3.1.** Norėdamas naudotis tam tikromis Platformos funkcijomis, naudotojas privalo susikurti paskyrą.

**3.2.** Naudotojas įsipareigoja pateikti teisingą ir aktualią informaciją, nekurti fiktyvių paskyrų ir neperduoti prieigos tretiesiems asmenims.

**3.3.** Naudotojas visiškai atsako už veiksmus, atliktus naudojantis jo paskyra.

**3.4.** Bendrovė turi teisę apriboti prieigą, sustabdyti arba ištrinti paskyrą, atsisakyti registruoti be išankstinio pranešimo, jei pažeidžiamos Sąlygos.

**4. Skelbimų skelbimas**

**4.1.** Naudotojas turi teisę skelbti transporto priemonių pardavimo skelbimus laikydamasis šių Sąlygų.

**4.2.** Naudotojas įsipareigoja pateikti teisingą informaciją, neklaidinti, neskelbti pasikartojančių skelbimų ir nenaudoti automatizuotų skelbimo sistemų be Bendrovės sutikimo.

**4.3.** Draudžiama skelbti melagingą informaciją, skelbimus apie neegzistuojančias prekes, skelbimus, pažeidžiančius teisės aktus, ar trečiųjų šalių paslaugų reklamą be Bendrovės sutikimo.

**4.4.** Bendrovė turi teisę redaguoti, sustabdyti publikavimą arba pašalinti skelbimus, jei pažeidžiamos šios Sąlygos, teisės aktų reikalavimai arba yra pagrįstų priežasčių manyti, kad skelbimas gali pažeisti trečiųjų asmenų teises arba klaidinti naudotojus.

**5. Naudotojų turinys**

**5.1.** Naudotojas visiškai atsako už paskelbtą Turinį.

**5.2.** Skelbdamas Turinį naudotojas garantuoja, kad jis turi teisę jį skelbti, Turinys nepažeidžia trečiųjų asmenų teisių ir Turinys atitinka teisės aktus.

**5.3.** Naudotojas suteikia Bendrovei neišimtinę, neatlygintiną, neterminuotą licenciją naudoti Turinį Platformos veikimo ir plėtros tikslais.

**6. Draudžiami veiksmai**

**6.1.** Naudotojui draudžiama naudoti Platformą neteisėtais tikslais, skelbti apgaulingus skelbimus, klaidinti kitus naudotojus, rinkti naudotojų duomenis be jų sutikimo, platinti kenkėjišką programinę įrangą, kištis į Platformos veikimą ar apeiti techninius apribojimus.

**6.2.** Naudotojas įsipareigoja tvarkyti kitų naudotojų asmens duomenis tik pagal taikomus duomenų apsaugos teisės aktus, įskaitant Reglamentą (ES) 2016/679 (GDPR).

**7. Mokamos paslaugos**

**7.1.** Kai kurios Platformos funkcijos gali būti mokamos.

**7.2.** Kainos ir mokėjimo sąlygos skelbiamos Platformoje.

**7.3.** Visi mokėjimai yra galutiniai, jei teisės aktai nenustato kitaip.

**7.4.** Visi mokėjimai, atlikti už Platformos mokamų paslaugų naudojimą, yra galutiniai, jei taikomi privalomieji teisės aktai nenustato kitaip.
Platformos mokamos paslaugos, įskaitant skelbimų patalpinimą ir reklamavimą, aktyvuojamos automatiškai ir pradedamos teikti iš karto po sėkmingo mokėjimo atlikimo.
Jei naudotojas yra fizinis asmuo, veikiantis ne verslo tikslais, jam taikomos vartotojų apsaugos teisės aktų nuostatos, įskaitant teisę atsisakyti nuotolinės sutarties per 14 dienų.
Naudotojas aiškiai prašo nedelsiant pradėti teikti paslaugą po mokėjimo ir patvirtina savo sutikimą, kad aktyvavus skelbimą ar kitą mokamą funkciją, teisė atsisakyti sutarties ir susigrąžinti pinigus prarandama pagal Direktyvos 2011/83/ES 16 straipsnį su pakeitimais, padarytais Direktyva (ES) 2019/2161.

**7.5.** Pinigų grąžinimas galimas tik platformos techninės klaidos, dvigubo nuskaitymo arba faktiškai neaktyvuotos paslaugos atveju. Aktyvavus skelbimą, paskelbus Turinį ar pradėjus teikti mokamą paslaugą, pinigai negrąžinami, jei taikomi privalomieji teisės aktai nenustato kitaip.

**8. Atsakomybės ribojimas**

**8.1.** Platforma teikiama principu "tokia, kokia yra" (as is) maksimalia apimtimi, leidžiama pagal taikomus teisės aktus.

**8.2.** Bendrovė neatsako už skelbimų patikimumą, naudotojų veiksmus, sandorius tarp naudotojų ar nuostolius, atsiradusius naudojantis Platforma.

**8.3.** Bendrovė negarantuoja nepertraukiamo Platformos veikimo, klaidų nebuvimo ar sandorių saugumo.

**8.4.** Maksimalia apimtimi, leidžiama pagal taikomus teisės aktus, Bendrovės atsakomybė ribojama suma, kurią naudotojas faktiškai sumokėjo už Platformos paslaugas per paskutinius 12 mėnesių iki atitinkamo reikalavimo atsiradimo.

**9. Naudotojų tikrinimas ir antifraudas**

**9.1.** Bendrovė turi teisę tikrinti naudotojus ir skelbiamą Turinį, reikalauti papildomų duomenų, apriboti funkcionalumą ar blokuoti naudotojus įtarus sukčiavimą.

**9.2.** Bendrovė turi teisę naudoti automatizuotas sistemas ir algoritmus sukčiavimui, Sąlygų pažeidimams nustatyti ir Platformos saugumui užtikrinti.

**10. Intelektinė nuosavybė**

**10.1.** Visos teisės į Platformą priklauso Bendrovei arba jos partneriams. Draudžiama kopijuoti, platinti ar modifikuoti Platformos elementus be leidimo.

**11. Asmens duomenys**

**11.1.** Asmens duomenų tvarkymas vykdomas pagal Carunity privatumo politiką.

**11.2.** Slapukų naudojimas vykdomas pagal Direktyvą 2002/58/EB (ePrivacy Directive), atsižvelgiant į taikomus teisės aktus ir GDPR.

**12. Prieigos sustabdymas ir nutraukimas**

**12.1.** Bendrovė turi teisę apriboti arba nutraukti naudotojo prieigą prie Platformos Sąlygų pažeidimo, teisės aktų reikalavimų, saugumo grėsmės ar įtarimo sukčiavimu atvejais.

**12.2.** Naudotojas turi teisę bet kuriuo metu nutraukti naudojimąsi Platforma. Paskyros ištrynimas atliekamas naudotojo prašymu.

**13. Ginčų sprendimas**

**13.1.** Bendrovė nedalyvauja ginčuose tarp naudotojų.

**13.2.** Naudotojai įsipareigoja ginčus spręsti savarankiškai.

**13.3.** Šias Sąlygas reglamentuoja Estijos Respublikos teisė.

**13.4.** Ginčai nagrinėjami Estijos teismuose, jei imperatyvios teisės normos nenustato kitaip.

**14. Force majeure**

**14.1.** Bendrovė neatsako už visišką ar dalinį įsipareigojimų nevykdymą, jei tai lemia interneto sutrikimai, valstybės institucijų veiksmai, ekstremalios situacijos, infrastruktūros sutrikimai, kibernetinės atakos ar kitos nenumatytos aplinkybės.

**15. Sąlygų keitimas**

**15.1.** Bendrovė turi teisę keisti šias Sąlygas. Atnaujinta versija skelbiama Platformoje.

**15.2.** Jei šios Sąlygos pateikiamos keliomis kalbomis, pirmenybė teikiama versijai anglų kalba, jei taikomi teisės aktai nenustato kitaip.

**16. Kontaktinė informacija**

Carunity OÜ
Email: info@carunity.eu
Adresas: Harju maakond, Viimsi vald, Laiaküla, Väike-Käspre tee 7, 74008, Estonia
`
  }
};

// Simple markdown-to-jsx renderer for bold and paragraphs
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

// Map i18n language codes to our content keys
function getLangKey(lng) {
  if (!lng) return 'ru';
  const base = lng.split('-')[0];
  if (content[base]) return base;
  return 'ru';
}

export default function Terms() {
  const { i18n } = useTranslation();
  const langKey = getLangKey(i18n.language);
  const c = content[langKey];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-1.5 text-sm mb-8">
          <span className="text-slate-500">{c.pageTitle}</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{c.pageTitle}</h1>
        <p className="text-slate-400 text-xs mb-10">Carunity OÜ</p>

        <div>
          {renderBody(c.body)}
        </div>
      </div>
    </div>
  );
}