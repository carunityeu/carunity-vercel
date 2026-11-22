// Predefined ad slots configurable from admin panel
export const AD_SLOTS = [
  { slot: 'hero-main', title: 'Hero — главный баннер', description: 'Баннер на главной странице (соотношение 10:3)', placement: 'Главная — верхний hero-блок', maxImages: 5, format: 'hero' },
  { slot: 'home-top', title: 'Главная — верх', description: 'Баннер вверху главной страницы (соотношение 10:3)', placement: 'Главная — под поиском', maxImages: 5, format: 'horizontal' },
  { slot: 'home-before-news', title: 'Главная — перед новостями', description: 'Баннер перед блоком новостей (соотношение 10:3)', placement: 'Главная — перед новостями', maxImages: 5, format: 'horizontal' },
  { slot: 'catalog-mid', title: 'Каталог — середина', description: 'Баннер в середине каталога', placement: 'Каталог — после 6-й карточки', maxImages: 5, format: 'horizontal' },
  { slot: 'catalog-sidebar', title: 'Каталог — сайдбар', description: 'Вертикальный баннер в сайдбаре каталога', placement: 'Каталог — под фильтрами (десктоп)', maxImages: 5, format: 'vertical' },
  { slot: 'article-top', title: 'Статья — верх', description: 'Баннер вверху страницы статьи', placement: 'Статья — верх', maxImages: 5, format: 'horizontal' },
  { slot: 'article-bottom', title: 'Статья — низ', description: 'Баннер внизу страницы статьи', placement: 'Статья — низ', maxImages: 5, format: 'horizontal' },
  { slot: 'news-list-top', title: 'Новости — верх', description: 'Баннер вверху страницы новостей', placement: 'Новости — верх', maxImages: 5, format: 'horizontal' },
  { slot: 'listing-gallery-slide', title: 'Объявление — слайд в галерее', description: 'Изображение последним слайдом при пролистывании фото в объявлении (соотношение 3:2, горизонтальное)', placement: 'Страница объявления — после всех фото', maxImages: 5, format: 'slide' },
];