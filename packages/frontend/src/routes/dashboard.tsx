import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCurrentUser, useCompany } from '../hooks';
import { Card } from '@es-mono/design-system';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { t } = useTranslation('common');
  const { t: tCompanies } = useTranslation('companies');
  const { data: currentUser } = useCurrentUser();
  const { data: company } = useCompany(currentUser?.companyId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">{t('appName')}</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8" data-testid="company-dashboard">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">{t('dashboard')}</h2>
          <p className="mt-2 text-muted-foreground">{t('welcome')}</p>
        </div>

        {company && (
          <div className="mb-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">{company.name}</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">{tCompanies('profile.industry')}</p>
                  <p className="font-medium">{company.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{tCompanies('profile.size')}</p>
                  <p className="font-medium">{tCompanies(`sizes.${company.size}`)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {tCompanies('profile.creditBalance')}
                  </p>
                  <p className="font-medium" data-testid="credit-balance">
                    {company.creditBalance}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground">Card 1</h3>
            <p className="mt-2 text-sm text-muted-foreground">Dashboard content coming soon...</p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground">Card 2</h3>
            <p className="mt-2 text-sm text-muted-foreground">Dashboard content coming soon...</p>
          </div>
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground">Card 3</h3>
            <p className="mt-2 text-sm text-muted-foreground">Dashboard content coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
