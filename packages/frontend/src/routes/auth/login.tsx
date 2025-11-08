import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { api } from '../../lib/api';

export const Route = createFileRoute('/auth/login')({
  component: Login,
});

function Login() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Type-safe Hono RPC call with full validation
      // api.auth.$post is fully typed based on the server's auth route
      const response = await api.auth.$post({
        json: {
          email: formData.email,
          password: formData.password,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to dashboard on successful login
        navigate({ to: '/dashboard' });
      } else {
        setError(t('login.error.invalidCredentials'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('login.error.networkError')
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
    <div>
      <h1>{t('login.title')}</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">{t('login.email')}:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password">{t('login.password')}:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? t('login.loading') : t('login.submit')}
        </button>
      </form>
      <p>
        {t('login.noAccount')} <Link to="/auth/register">{t('login.registerLink')}</Link>
      </p>
    </div>
  );
}
