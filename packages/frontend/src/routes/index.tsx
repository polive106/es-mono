import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { t, i18n } = useTranslation('common');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div>
      <header>
        <button onClick={toggleLanguage}>
          {i18n.language === 'en' ? 'Français' : 'English'}
        </button>
      </header>
      <h1>{t('appName')}</h1>
      <p>{t('welcome')}</p>
      <nav>
        <ul>
          <li>
            <Link to="/auth/login">{t('navigation.login')}</Link>
          </li>
          <li>
            <Link to="/auth/register">{t('navigation.register')}</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
