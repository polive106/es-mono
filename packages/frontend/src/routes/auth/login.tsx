import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/auth/login')({
  component: Login,
});

function Login() {
  const { t } = useTranslation('auth');

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <form>
        <div>
          <label htmlFor="email">{t('login.email')}:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">{t('login.password')}:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <button type="submit">{t('login.submit')}</button>
      </form>
      <p>
        {t('login.noAccount')} <Link to="/auth/register">{t('login.registerLink')}</Link>
      </p>
    </div>
  );
}
