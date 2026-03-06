import { useTranslation } from 'react-i18next';

const LANGUAGES = ['pl', 'en', 'de'] as const;

export default function Navbar() {
  const { t, i18n } = useTranslation();

  return (
    <nav className="bg-slate-800 text-white px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          {t('nav.title')}
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-slate-400 text-sm">
            {t('nav.source')}
          </p>
          <select
            value={i18n.language.split('-')[0]}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 cursor-pointer"
          >
            {LANGUAGES.map((lng) => (
              <option key={lng} value={lng}>
                {t(`lang.${lng}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
