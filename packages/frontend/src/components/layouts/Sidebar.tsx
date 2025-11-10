import { useTranslation } from 'react-i18next';
import { Link, useLocation } from '@tanstack/react-router';
import { useAuth } from '../../lib/auth';

/**
 * Left sidebar navigation with context-aware menu items
 *
 * Shows different menu items based on user role:
 * - talent: Profile, Skills, Opportunities
 * - talent_manager: Dashboard, Companies, Skill Needs, Talent Search, Credits
 */
export function Sidebar() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isTalentManager = user?.role === 'talent_manager';

  const navItems = isTalentManager
    ? [
        { href: '/dashboard', label: t('dashboard') },
        { href: '/companies', label: t('companies') },
        { href: '/skill-needs', label: t('skillNeeds') },
        { href: '/talent/search', label: t('talentSearch') },
        { href: '/missions', label: t('missions') },
        { href: '/credits', label: t('credits') },
      ]
    : [
        { href: '/profile', label: t('profile') },
        { href: '/profile/skills', label: t('skills') },
        { href: '/profile/availability', label: t('availability') },
        { href: '/opportunities', label: t('opportunities') },
        { href: '/missions', label: t('myMissions') },
      ];

  return (
    <aside className="w-64 border-r border-border bg-card">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
