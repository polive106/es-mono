import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useForm } from '@tanstack/react-form';
import { loginSchema } from '@es-mono/shared';
import { Button, Input, Label, Card, Alert, AlertDescription } from '@es-mono/design-system';
import { useLogin } from '../../hooks';

export const Route = createFileRoute('/auth/login')({
  component: Login,
});

function Login() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate: login, isPending, error: mutationError } = useLogin();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      login(value, {
        onSuccess: () => {
          navigate({ to: '/dashboard' });
        },
      });
    },
  });

  const error = mutationError?.message;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('login.noAccount')}{' '}
            <Link to="/auth/register" className="text-primary hover:underline">
              {t('login.registerLink')}
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
            data-testid="login-form"
            noValidate
          >
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = loginSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
                onSubmit: ({ value }) => {
                  const result = loginSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">{t('login.email')}</Label>
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
                  if (!value) return 'Password is required';
                  return undefined;
                },
                onSubmit: ({ value }) => {
                  if (!value) return 'Password is required';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('login.password')}</Label>
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

            <Button type="submit" data-testid="login-submit" disabled={isPending} className="w-full">
              {isPending ? t('login.loading') : t('login.submit')}
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
