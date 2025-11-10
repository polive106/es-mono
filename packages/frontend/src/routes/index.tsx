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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <button
          onClick={toggleLanguage}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
        >
          {i18n.language === 'en' ? 'Français' : 'English'}
        </button>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{t('appName')}</h1>
        <p className="text-xl text-muted-foreground mb-8">{t('welcome')}</p>
        <nav>
          <ul className="flex gap-4">
            <li>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-3 text-sm font-medium"
              >
                {t('navigation.login')}
              </Link>
            </li>
            <li>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 text-sm font-medium"
              >
                {t('navigation.register')}
              </Link>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
