import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { API_URL } from '../../lib/api';

export const Route = createFileRoute('/auth/register')({
  component: Register,
});

function Register() {
  const { t, i18n } = useTranslation('auth');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: '',
  });

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 12) {
      errors.password = 'Password must be at least 12 characters';
    }

    // Validate invite code
    if (!formData.inviteCode.trim()) {
      errors.inviteCode = 'Invite code is required';
    } else if (formData.inviteCode.trim().length !== 8) {
      errors.inviteCode = 'Invite code must be exactly 8 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          inviteCode: formData.inviteCode,
          languagePref: i18n.language as 'en' | 'fr',
        }),
      });

      if (response.ok) {
        await response.json();
        // Redirect to login page on successful registration
        navigate({ to: '/auth/login' });
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || t('register.error.registrationFailed'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('register.error.networkError')
      );
    } finally {
      setIsLoading(false);
    }
  };

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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? t('register.loading') : t('register.submit')}
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
