import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      category: 'general',
      titleKey: 'faq.general_title',
      defaultTitle: 'Общие вопросы',
      items: [
        {
          q: t('faq.q_register', 'Как зарегистрироваться?'),
          a: t('faq.a_register', 'Нажмите «Войти» в правом верхнем углу и следуйте инструкциям. Для регистрации используйте email или аккаунт Google.')
        },
        {
          q: t('faq.q_payment', 'Какие способы оплаты доступны?'),
          a: t('faq.a_payment', 'Мы принимаем Apple Pay, Google Pay, Visa, Mastercard, а также банковские переводы для корпоративных клиентов.')
        },
      ]
    },
    {
      category: 'dealers',
      titleKey: 'faq.dealers_title',
      defaultTitle: 'Для дилеров',
      items: [
        {
          q: t('faq.q_dealer_plans', 'Какие тарифы для дилеров?'),
          a: t('faq.a_dealer_plans', 'Мы предлагаем три тарифа: Starter, Pro и Premium. Подробности — на странице тарифов для дилеров. Также мы можем подобрать индивидуальное предложение — свяжитесь с нами, и мы предложим решение под ваши задачи.')
        },
        {
          q: t('faq.q_become_dealer', 'Как зарегистрироваться как дилер?'),
          a: t('faq.a_become_dealer', 'Перейдите в раздел регистрации дилера, заполните анкету компании — после проверки вы получите доступ к личному кабинету дилера.')
        },
        {
          q: t('faq.q_dealer_cost', 'Сколько стоит работа на платформе для дилеров?'),
          a: t('faq.a_dealer_cost', 'Тарифы — в разделе Dealer Pricing. Есть пакеты под разный объём объявлений и рекламных инструментов.')
        },
        {
          q: t('faq.q_manage_leads', 'Как управлять объявлениями и лидами?'),
          a: t('faq.a_manage_leads', 'В личном кабинете дилера вы видите все активные объявления, входящие запросы (лиды), задачи и переписку с покупателями.')
        },
        {
          q: t('faq.q_promote', 'Как продвигать объявления?'),
          a: t('faq.a_promote', 'В разделе Advertising доступны платные инструменты: выделение в каталоге, приоритетный показ и баннерная реклама.')
        },
        {
          q: t('faq.q_countries', 'В каких странах работает CarUnity?'),
          a: t('faq.a_countries', 'Платформа охватывает Литву, Латвию и Эстонию — единый маркетплейс для всего балтийского региона.')
        },
      ]
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sectionTitles = [
    t('faq.general_title', 'Общие вопросы'),
    t('faq.dealers_title', 'ДЛЯ ДИЛЕРОВ'),
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {t('faq.title', 'Часто задаваемые вопросы')}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            {t('faq.subtitle', 'Найдите ответы на интересующие вас вопросы')}
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {faqData.map((section, sectionIdx) => {
            const offset = faqData.slice(0, sectionIdx).reduce((acc, s) => acc + s.items.length, 0);
            return (
              <div key={section.category}>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  {sectionTitles[sectionIdx]}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item, idx) => {
                    const globalIdx = offset + idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden hover:border-emerald-400/50 transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(globalIdx)}
                          className="w-full flex items-center justify-between p-4 sm:p-6 text-left"
                        >
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white pr-4">
                            {item.q}
                          </h3>
                          <ChevronDown
                            className={`w-5 h-5 text-emerald-500 shrink-0 transition-transform ${openIndex === globalIdx ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {openIndex === globalIdx && (
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-slate-200 dark:border-slate-800 pt-4">
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
            {t('faq.no_answer', 'Не нашли ответ?')}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
            {t('faq.contact_desc', 'Напишите нам в поддержку и мы с удовольствием поможем.')}
          </p>
          <a
            href="mailto:contact@carunity.eu"
            className="inline-block px-6 py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            {t('faq.contact_btn', 'Связаться с нами')}
          </a>
        </div>
      </div>
    </div>
  );
}