import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useCurrentUser, useCompany } from '../../hooks';
import { Card, Alert, AlertDescription } from '@es-mono/design-system';

export const Route = createFileRoute('/companies/profile')({
  component: CompanyProfile,
});

function CompanyProfile() {
  const { t } = useTranslation('companies');
  const { data: currentUser } = useCurrentUser();
  const { data: company, isLoading, error } = useCompany(currentUser?.companyId);

  if (isLoading) {
    return <div className="p-8 text-center">{t('profile.loading')}</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>{t('profile.error.loadFailed')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!company) {
    return <div className="p-8 text-center">Company not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('profile.title')}</h1>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('profile.name')}
              </label>
              <p className="mt-1 text-lg" data-testid="company-name">
                {company.name}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('profile.industry')}
              </label>
              <p className="mt-1" data-testid="company-industry">
                {company.industry}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('profile.size')}
              </label>
              <p className="mt-1" data-testid="company-size">
                {t(`sizes.${company.size}`)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('profile.location')}
              </label>
              <p className="mt-1" data-testid="company-location">
                {t(`locations.${company.location}`)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('profile.inviteCode')}
              </label>
              <p className="mt-1 font-mono">{company.inviteCode}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t('profile.creditBalance')}
              </label>
              <p className="mt-1" data-testid="credit-balance">
                {company.creditBalance}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
