import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/auth/register')({
  component: Register,
});

function Register() {
  const { t } = useTranslation('auth');

  return (
    <div>
      <h1>{t('register.title')}</h1>
      <form>
        <div>
          <label htmlFor="name">{t('register.name')}:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="email">{t('register.email')}:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="password">{t('register.password')}:</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label htmlFor="invite-code">{t('register.inviteCode')}:</label>
          <input type="text" id="invite-code" name="inviteCode" required />
        </div>
        <button type="submit">{t('register.submit')}</button>
      </form>
      <p>
        {t('register.hasAccount')} <Link to="/auth/login">{t('register.loginLink')}</Link>
      </p>
    </div>
  );
}
