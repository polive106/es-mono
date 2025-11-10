import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation('common');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
      <p className="mt-4 text-muted-foreground">
        {t('welcome')}
      </p>
    </div>
  );
}
