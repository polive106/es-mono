import { useTranslation } from 'react-i18next';

/**
 * Application footer with links and copyright
 */
export function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>
            &copy; {currentYear} SkillSwap. {t('allRightsReserved')}
          </p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              {t('privacy')}
            </a>
            <a href="/terms" className="hover:text-foreground transition-colors">
              {t('terms')}
            </a>
            <a href="/contact" className="hover:text-foreground transition-colors">
              {t('contact')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
