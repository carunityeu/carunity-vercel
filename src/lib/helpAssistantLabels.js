const rows = {
  title: ['CarUnity AI Assistant','ИИ-помощник CarUnity','CarUnity AI-assistent','CarUnity MI palīgs','CarUnity DI asistentas'],
  subtitle: ['Ask any question about the site','Задайте любой вопрос о сайте','Küsi midagi saidi kohta','Uzdodiet jautājumu par vietni','Užduokite klausimą apie svetainę'],
  placeholder: ['E.g. Where can I find dealers?','Например: Где найти дилеров?','Näiteks: Kust leida edasimüüjaid?','Piemēram: Kur atrast dīlerus?','Pavyzdžiui: Kur rasti pardavėjus?'],
  send: ['Send','Отправить','Saada','Sūtīt','Siųsti'],
  thinking: ['Processing your request… Preparing an answer.','Обрабатываем запрос… Готовим ответ.','Töötleme päringut… Koostame vastust.','Apstrādājam pieprasījumu… Gatavojam atbildi.','Apdorojame užklausą… Rengiame atsakymą.'],
  welcome: ['Hi! I am the CarUnity AI assistant. Ask me about finding a section, posting a listing or using our services.','Привет! Я ИИ-помощник CarUnity. Спросите, как найти нужный раздел, разместить объявление или пользоваться нашими сервисами.','Tere! Olen CarUnity AI-assistent. Küsi jaotiste leidmise, kuulutuse lisamise või meie teenuste kasutamise kohta.','Sveiki! Esmu CarUnity MI palīgs. Jautājiet par sadaļu atrašanu, sludinājumu ievietošanu vai mūsu pakalpojumu izmantošanu.','Sveiki! Esu CarUnity DI asistentas. Klauskite, kaip rasti skyrių, įdėti skelbimą ar naudotis mūsų paslaugomis.'],
  error: ['Could not get an answer. Please try again.','Не удалось получить ответ. Попробуйте ещё раз.','Vastust ei õnnestunud saada. Proovi uuesti.','Neizdevās saņemt atbildi. Mēģiniet vēlreiz.','Nepavyko gauti atsakymo. Bandykite dar kartą.'],
  signIn: ['Sign in to ask the AI assistant.','Войдите, чтобы задать вопрос ИИ-помощнику.','AI-assistendilt küsimiseks logi sisse.','Pierakstieties, lai uzdotu jautājumu MI palīgam.','Prisijunkite, kad užduotumėte klausimą DI asistentui.'],
  suggestions: [['How to post a listing?','Where to find dealers?','How much does listing cost?'],['Как разместить объявление?','Где найти дилеров?','Сколько стоит размещение?'],['Kuidas kuulutust lisada?','Kust leida edasimüüjaid?','Kui palju maksab kuulutus?'],['Kā ievietot sludinājumu?','Kur atrast dīlerus?','Cik maksā sludinājums?'],['Kaip įdėti skelbimą?','Kur rasti pardavėjus?','Kiek kainuoja skelbimas?']]
};
export default function helpAssistantLabels(language) {
  const index = ['en','ru','et','lv','lt'].indexOf(language?.split('-')[0]);
  return Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index < 0 ? 0 : index]]));
}