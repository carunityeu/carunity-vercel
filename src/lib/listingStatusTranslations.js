// Статус объявления на странице автомобиля: закрытые объявления нельзя купить
const listingStatusTranslations = {
  ru: { car: { inactive: 'Неактивно', inactive_view_only: 'Объявление доступно только для просмотра фотографий и цены.', listing_closed: 'Объявление больше не активно', status_sold: 'Этот автомобиль уже продан', listing_closed_desc: 'Связь с продавцом и предложения цены недоступны' } },
  en: { car: { inactive: 'Inactive', inactive_view_only: 'This listing is available only to view photos and the price.', listing_closed: 'This listing is no longer active', status_sold: 'This car has already been sold', listing_closed_desc: 'Contacting the seller and making offers is disabled' } },
  et: { car: { inactive: 'Mitteaktiivne', inactive_view_only: 'Selles kuulutuses saab vaadata ainult fotosid ja hinda.', listing_closed: 'Kuulutus ei ole enam aktiivne', status_sold: 'See auto on juba müüdud', listing_closed_desc: 'Müüjaga suhtlemine ja pakkumised ei ole saadaval' } },
  lv: { car: { inactive: 'Neaktīvs', inactive_view_only: 'Šajā sludinājumā var apskatīt tikai fotoattēlus un cenu.', listing_closed: 'Sludinājums vairs nav aktīvs', status_sold: 'Šī automašīna jau ir pārdota', listing_closed_desc: 'Sazināšanās ar pārdevēju un cenu piedāvājumi nav pieejami' } },
  lt: { car: { inactive: 'Neaktyvus', inactive_view_only: 'Šiame skelbime galima peržiūrėti tik nuotraukas ir kainą.', listing_closed: 'Skelbimas nebėra aktyvus', status_sold: 'Šis automobilis jau parduotas', listing_closed_desc: 'Susisiekti su pardavėju ir siūlyti kainą negalima' } }
};

export default listingStatusTranslations;