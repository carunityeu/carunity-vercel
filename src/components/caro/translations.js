const rows = {
  banner: ['Your personal AI guide. I’ll help you find the right car on CarUnity.', 'Ваш персональный ИИ-помощник. Помогу найти подходящую машину на CarUnity.', 'Sinu isiklik tehisintellekti abiline. Aitan leida CarUnityst sobiva auto.', 'Tavs personīgais MI palīgs. Palīdzēšu atrast piemērotu auto CarUnity.', 'Jūsų asmeninis DI asistentas. Padėsiu rasti tinkamą automobilį CarUnity.'],
  ask: ['Ask Caro AI', 'Спросить Caro AI', 'Küsi Caro AI-lt', 'Jautāt Caro AI', 'Klausti Caro AI'],
  hello: ['Hello, I’m', 'Привет, я', 'Tere, mina olen', 'Sveiki, es esmu', 'Sveiki, aš esu'],
  intro: ['Tell me what car you’re looking for.', 'Расскажите, какую машину вы ищете.', 'Räägi, millist autot otsid.', 'Pastāsti, kādu auto meklē.', 'Papasakokite, kokio automobilio ieškote.'],
  disclaimer: ['AI answers may be inaccurate. Check listing details with the seller and avoid sharing personal information.', 'ИИ может ошибаться. Уточняйте детали объявлений у продавца и не сообщайте личные данные.', 'Tehisintellekt võib eksida. Kontrolli kuulutuse andmeid müüjalt ja ära jaga isikuandmeid.', 'MI var kļūdīties. Precizē sludinājuma informāciju pie pārdevēja un neizpaud personas datus.', 'DI gali klysti. Skelbimo informaciją patikslinkite su pardavėju ir nesidalykite asmens duomenimis.'],
  newChat: ['New chat', 'Новый чат', 'Uus vestlus', 'Jauna saruna', 'Naujas pokalbis'],
  placeholder: ['Ask Caro about your next car…', 'Напишите Caro, какую машину ищете…', 'Kirjuta Carole, millist autot otsid…', 'Raksti Caro, kādu auto meklē…', 'Parašykite Caro, kokio automobilio ieškote…'],
  send: ['Send message', 'Отправить сообщение', 'Saada sõnum', 'Nosūtīt ziņu', 'Siųsti žinutę'],
  thinking: ['Caro is thinking…', 'Caro думает…', 'Caro mõtleb…', 'Caro domā…', 'Caro galvoja…'],
  searching: ['Searching CarUnity listings…', 'Ищу объявления на CarUnity…', 'Otsin CarUnity kuulutusi…', 'Meklēju CarUnity sludinājumus…', 'Ieškau CarUnity skelbimų…'],
  checked: ['Catalog checked', 'Каталог проверен', 'Kataloog kontrollitud', 'Katalogs pārbaudīts', 'Katalogas patikrintas'],
  error: ['Could not get a response. Please try again.', 'Не удалось получить ответ. Попробуйте ещё раз.', 'Vastuse saamine ebaõnnestus. Proovi uuesti.', 'Neizdevās saņemt atbildi. Mēģini vēlreiz.', 'Nepavyko gauti atsakymo. Bandykite dar kartą.'],
  retry: ['Retry', 'Повторить', 'Proovi uuesti', 'Mēģināt vēlreiz', 'Bandyti dar kartą'],
  unavailable: ['These listings are no longer available.', 'Эти объявления больше недоступны.', 'Need kuulutused pole enam saadaval.', 'Šie sludinājumi vairs nav pieejami.', 'Šie skelbimai nebepasiekiami.'],
  loading: ['Loading listings…', 'Загружаю объявления…', 'Laadin kuulutusi…', 'Ielādēju sludinājumus…', 'Įkeliami skelbimai…'],
  privacy: ['Privacy Policy', 'Конфиденциальность', 'Privaatsuspoliitika', 'Privātuma politika', 'Privatumo politika'],
  terms: ['Terms and Conditions', 'Условия использования', 'Kasutustingimused', 'Lietošanas noteikumi', 'Naudojimo sąlygos'],
  back: ['Back to CarUnity', 'Вернуться на CarUnity', 'Tagasi CarUnitysse', 'Atpakaļ uz CarUnity', 'Grįžti į CarUnity'],
  login: ['Sign in to chat with Caro', 'Войдите, чтобы общаться с Caro', 'Caroga vestlemiseks logi sisse', 'Piesakies, lai sarunātos ar Caro', 'Prisijunkite ir kalbėkitės su Caro']
};
export const caroTranslations = Object.fromEntries(['en', 'ru', 'et', 'lv', 'lt'].map((lang, index) => [lang, { caro: Object.fromEntries(Object.entries(rows).map(([key, values]) => [key, values[index]])) }]));