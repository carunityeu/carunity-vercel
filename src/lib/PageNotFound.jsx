import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function PageNotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="text-center space-y-6 max-w-sm">
        <h1 className="text-8xl font-light text-slate-200 dark:text-slate-800">404</h1>
        <div className="h-px w-16 bg-slate-200 dark:bg-slate-700 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            {t('errors.page_not_found', 'Страница не найдена')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t('errors.page_not_found_desc', 'Запрашиваемая страница не существует или была удалена.')}
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
        >
          {t('errors.go_home', 'На главную')}
        </Link>
      </div>
    </div>
  );
}