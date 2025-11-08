import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import { LanguageSwitcher } from '../settings/LanguageSwitcher';

/**
 * Application header with navigation, user menu, and language switcher
 */
export function Header() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo and app name */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
            S
          </div>
          <h1 className="text-xl font-bold text-foreground">SkillSwap</h1>
        </div>

        {/* Right side: User menu and language switcher */}
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <LanguageSwitcher />

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0 text-right text-sm">
                <span className="font-medium text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
