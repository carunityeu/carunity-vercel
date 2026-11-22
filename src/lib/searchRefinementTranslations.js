const rows = {
  intro: ['Choose the same specifications and equipment available when creating a listing.','Выберите характеристики и оснащение из формы создания объявления.','Valige samad tehnilised andmed ja varustus nagu kuulutuse lisamisel.','Izvēlieties parametrus un aprīkojumu no sludinājuma izveides formas.','Pasirinkite tuos pačius parametrus ir įrangą kaip kuriant skelbimą.'],
  dimensions: ['Dimensions and performance','Размеры и динамика','Mõõtmed ja dünaamika','Izmēri un dinamika','Matmenys ir dinamika'],
  rangeError: ['The minimum value cannot exceed the maximum.','Значение «от» не может превышать значение «до».','Alampiir ei tohi ületada ülempiiri.','Minimālā vērtība nedrīkst pārsniegt maksimālo.','Mažiausia reikšmė negali viršyti didžiausios.'],
  loadMore: ['Load more listings','Показать ещё объявления','Näita rohkem kuulutusi','Rādīt vairāk sludinājumu','Rodyti daugiau skelbimų'],
  failed: ['Could not load the listings. Please try again.','Не удалось загрузить объявления. Попробуйте ещё раз.','Kuulutusi ei õnnestunud laadida. Proovige uuesti.','Neizdevās ielādēt sludinājumus. Mēģiniet vēlreiz.','Nepavyko įkelti skelbimų. Bandykite dar kartą.'],
  retry: ['Try again','Попробовать снова','Proovi uuesti','Mēģināt vēlreiz','Bandyti dar kartą'],
  removeSearch: ['Unsave search','Удалить сохранённый поиск','Eemalda salvestatud otsing','Dzēst saglabāto meklējumu','Pašalinti išsaugotą paiešką'],
  searchRemoved: ['Saved search removed','Сохранённый поиск удалён','Salvestatud otsing eemaldatud','Saglabātais meklējums dzēsts','Išsaugota paieška pašalinta'],
  saveFailed: ['Could not update the saved search. Please try again.','Не удалось изменить сохранённый поиск. Попробуйте ещё раз.','Salvestatud otsingu muutmine ebaõnnestus. Proovige uuesti.','Neizdevās mainīt saglabāto meklējumu. Mēģiniet vēlreiz.','Nepavyko pakeisti išsaugotos paieškos. Bandykite dar kartą.'],
};
export const searchRefinementTranslations = Object.fromEntries(['en','ru','et','lv','lt'].map((lang,i)=>[lang,{searchRef:Object.fromEntries(Object.entries(rows).map(([key,values])=>[key,values[i]]))}]));