
import React from 'react';
import { useLocalization, Language } from '@/contexts/LocalizationContext';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLocalization();

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{t('settings.language')}</label>
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {t('lang.english')}
        </button>
        <button
          onClick={() => setLanguage('he')}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            language === 'he'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          {t('lang.hebrew')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
