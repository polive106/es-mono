import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { registerSchema } from '@es-mono/shared';
import { Button, Input, Label, Card, Alert, AlertDescription } from '@es-mono/design-system';
import { useRegister } from '../../hooks';

export const Route = createFileRoute('/auth/register')({
  component: Register,
});

function Register() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate: register, isPending, error: mutationError } = useRegister();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      inviteCode: '',
    },
    onSubmit: async ({ value }) => {
      register(
        {
          ...value,
          languagePref: i18n.language as 'en' | 'fr',
        },
        {
          onSuccess: () => {
            navigate({ to: '/auth/login' });
          },
        }
      );
    },
  });

  const error = mutationError?.message;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{t('register.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('register.hasAccount')}{' '}
            <Link to="/auth/login" className="text-primary hover:underline">
              {t('register.loginLink')}
            </Link>
          </p>
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
            data-testid="register-form"
            noValidate
          >
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const result = registerSchema.shape.name.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
                onSubmit: ({ value }) => {
                  const result = registerSchema.shape.name.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="name">{t('register.name')}</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    data-testid="name-input"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    placeholder="John Doe"
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = registerSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
                onSubmit: ({ value }) => {
                  const result = registerSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('register.email')}</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    data-testid="email-input"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    placeholder="you@example.com"
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = registerSchema.shape.password.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
                onSubmit: ({ value }) => {
                  const result = registerSchema.shape.password.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('register.password')}</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    data-testid="password-input"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    placeholder="••••••••"
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="inviteCode"
              validators={{
                onChange: ({ value }) => {
                  const result = registerSchema.shape.inviteCode.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
                onSubmit: ({ value }) => {
                  const result = registerSchema.shape.inviteCode.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="invite-code">{t('register.inviteCode')}</Label>
                  <Input
                    type="text"
                    id="invite-code"
                    name="inviteCode"
                    data-testid="invite-code-input"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isPending}
                    maxLength={8}
                    placeholder="XXXXXXXX"
                  />
                  {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <Button type="submit" data-testid="register-submit" disabled={isPending} className="w-full">
              {isPending ? t('register.loading') : t('register.submit')}
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
