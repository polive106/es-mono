import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks';
import { Card, Alert, AlertDescription } from '@es-mono/design-system';

export const Route = createFileRoute('/companies/')({
  component: CompaniesList,
});

function CompaniesList() {
  const { t } = useTranslation('companies');
  const { data: companies, isLoading, error } = useCompanies();

  if (isLoading) {
    return <div className="p-8 text-center">{t('list.loading')}</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{t('list.error.loadFailed')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('list.title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('list.description')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="companies-list">
          {companies && companies.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground">{t('list.empty')}</p>
          )}

          {companies?.map((company) => (
            <Card key={company.id} className="p-6">
              <h3 className="text-lg font-semibold">{company.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{company.industry}</p>
              <div className="mt-4 space-y-1 text-sm">
                <p>
                  <span className="font-medium">{t('profile.size')}:</span>{' '}
                  {t(`sizes.${company.size}`)}
                </p>
                <p>
                  <span className="font-medium">{t('profile.location')}:</span>{' '}
                  {t(`locations.${company.location}`)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
