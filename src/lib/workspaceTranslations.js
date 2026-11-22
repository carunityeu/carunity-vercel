const languages = { ru: 'Русский', en: 'English', et: 'Eesti', lv: 'Latviešu', lt: 'Lietuvių' };
export const workspaceTranslations = {
  ru: {
    messages: { languages, language_label: 'Язык перевода', send: 'Отправить сообщение', back: 'Назад к диалогам', report: 'Пожаловаться на сообщение' },
    dealer: { impersonating: 'Вы просматриваете кабинет от имени дилера: {{name}}', exit_preview: 'Выйти из режима просмотра' }
  },
  en: {
    messages: { languages, language_label: 'Translation language', send: 'Send message', back: 'Back to conversations', report: 'Report message' },
    dealer: { impersonating: 'Viewing the dashboard as dealer: {{name}}', exit_preview: 'Exit preview mode' }
  },
  et: {
    messages: { languages, language_label: 'Tõlke keel', send: 'Saada sõnum', back: 'Tagasi vestluste juurde', report: 'Teata sõnumist' },
    dealer: { impersonating: 'Vaatate töölauda edasimüüjana: {{name}}', exit_preview: 'Välju eelvaaterežiimist' }
  },
  lv: {
    messages: { languages, language_label: 'Tulkojuma valoda', send: 'Nosūtīt ziņu', back: 'Atpakaļ uz sarunām', report: 'Ziņot par ziņu' },
    dealer: { impersonating: 'Jūs skatāt paneli kā dīleris: {{name}}', exit_preview: 'Iziet no priekšskatījuma' }
  },
  lt: {
    messages: { languages, language_label: 'Vertimo kalba', send: 'Siųsti žinutę', back: 'Grįžti į pokalbius', report: 'Pranešti apie žinutę' },
    dealer: { impersonating: 'Peržiūrite skydelį kaip pardavėjas: {{name}}', exit_preview: 'Išeiti iš peržiūros režimo' }
  }
};