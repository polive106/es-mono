import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

/**
 * Language switcher component for FR/EN locale switching
 *
 * Implements FR-003: Support for French and English languages
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = async (language: string) => {
    await i18n.changeLanguage(language);
    setCurrentLanguage(language);
    // Optionally persist language preference to localStorage
    localStorage.setItem('language', language);
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ];

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
            currentLanguage === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          aria-label={`Switch to ${lang.label}`}
          aria-current={currentLanguage === lang.code}
        >
          {lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
