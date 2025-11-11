import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRegister } from '../../hooks';

export const Route = createFileRoute('/auth/register')({
  component: Register,
});

function Register() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const { mutate: register, isPending, error: mutationError } = useRegister();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    register(
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        inviteCode: formData.inviteCode,
        languagePref: i18n.language as 'en' | 'fr',
      },
      {
        onSuccess: () => {
          navigate({ to: '/auth/login' });
        },
        onError: (error) => {
          // Handle Zod validation errors
          // ZodError messages are in the error message
          if (error.message.includes('validation')) {
            // Try to parse Zod error from message
            // In a real app, you'd have better error handling
            const match = error.message.match(/path: \[([^\]]+)\], message: "([^"]+)"/);
            if (match) {
              const field = match[1];
              const message = match[2];
              setFieldErrors({ [field]: message });
            }
          }
        },
      }
    );
  };

  const error = mutationError && !Object.keys(fieldErrors).length ? mutationError.message : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="register-form" noValidate>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                {t('register.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                data-testid="name-input"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="John Doe"
              />
              {fieldErrors.name && (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('register.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                data-testid="email-input"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('register.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                data-testid="password-input"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="invite-code" className="text-sm font-medium text-foreground">
                {t('register.inviteCode')}
              </label>
              <input
                type="text"
                id="invite-code"
                name="inviteCode"
                data-testid="invite-code-input"
                value={formData.inviteCode}
                onChange={handleInputChange}
                disabled={isPending}
                maxLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="XXXXXXXX"
              />
              {fieldErrors.inviteCode && (
                <p className="text-sm text-destructive">{fieldErrors.inviteCode}</p>
              )}
            </div>

            <button
              type="submit"
              data-testid="register-submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isPending ? t('register.loading') : t('register.submit')}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
