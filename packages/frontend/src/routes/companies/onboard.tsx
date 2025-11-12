import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { Button, Input, Label, Card, Alert, AlertDescription } from '@es-mono/design-system';
import { useUpdateCompany } from '../../hooks';
import { useCurrentUser } from '../../hooks';
import type { CompanySize, CompanyLocation } from '../../types/company.types';

export const Route = createFileRoute('/companies/onboard')({
  component: CompanyOnboarding,
});

function CompanyOnboarding() {
  const { t } = useTranslation('companies');
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { mutate: updateCompany, isPending, error: mutationError } = useUpdateCompany();

  const form = useForm({
    defaultValues: {
      name: '',
      industry: '',
      size: '' as CompanySize,
      location: '' as CompanyLocation,
    },
    onSubmit: async ({ value }) => {
      if (!currentUser?.companyId) {
        throw new Error('No company ID found');
      }

      updateCompany(
        {
          companyId: currentUser.companyId,
          updates: {
            industry: value.industry,
            size: value.size,
          },
        },
        {
          onSuccess: () => {
            navigate({ to: '/dashboard' });
          },
        }
      );
    },
  });

  const error = mutationError?.message;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{t('onboarding.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('onboarding.description')}</p>
        </div>

        <Card className="p-8">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
            data-testid="company-onboarding-form"
            noValidate
          >
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return t('errors.nameRequired');
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="company-name">{t('onboarding.companyName')}</Label>
                  <Input
                    type="text"
                    id="company-name"
                    name="name"
                    data-testid="company-name-input"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    placeholder="Acme Inc."
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="industry"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return t('errors.industryRequired');
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="industry">{t('onboarding.industry')}</Label>
                  <select
                    id="industry"
                    name="industry"
                    data-testid="industry-select"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select industry...</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Other">Other</option>
                  </select>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="size"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length === 0) {
                    return t('errors.sizeRequired');
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="size">{t('onboarding.size')}</Label>
                  <select
                    id="size"
                    name="size"
                    data-testid="size-select"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value as CompanySize)}
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select company size...</option>
                    <option value="1-10">{t('sizes.1-10')}</option>
                    <option value="11-50">{t('sizes.11-50')}</option>
                    <option value="51-200">{t('sizes.51-200')}</option>
                    <option value="201-500">{t('sizes.201-500')}</option>
                    <option value="501+">{t('sizes.501+')}</option>
                  </select>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="location"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.length === 0) {
                    return t('errors.locationRequired');
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="location">{t('onboarding.location')}</Label>
                  <select
                    id="location"
                    name="location"
                    data-testid="location-select"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value as CompanyLocation)}
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select location...</option>
                    <option value="FR">{t('locations.FR')}</option>
                    <option value="UK">{t('locations.UK')}</option>
                    <option value="DE">{t('locations.DE')}</option>
                    <option value="ES">{t('locations.ES')}</option>
                    <option value="IT">{t('locations.IT')}</option>
                    <option value="NL">{t('locations.NL')}</option>
                    <option value="BE">{t('locations.BE')}</option>
                    <option value="Other">{t('locations.Other')}</option>
                  </select>
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <Button
              type="submit"
              data-testid="onboarding-submit"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? t('onboarding.loading') : t('onboarding.submit')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
