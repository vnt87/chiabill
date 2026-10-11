import { useEffect, useState } from 'react';
import { Github, Sun, Moon, Calculator, ClockIcon, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { RollingText } from './ui/RollingText';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const BOOT_KEY = 'chiabill:booted';

// The page-load reveal plays once per browser session, not on every visit to a page.
function shouldBoot(): boolean {
  try {
    if (sessionStorage.getItem(BOOT_KEY)) return false;
    sessionStorage.setItem(BOOT_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

const navLinkClass = (active: boolean) =>
  cn(
    'rolling-text-trigger flex flex-col items-center gap-0.5 border-b-2 px-2 py-1.5 text-[0.6875rem] font-medium transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:text-sm',
    active
      ? 'border-wnt-red text-white'
      : 'border-transparent text-slate-400 hover:text-white',
  );

const iconButtonClass =
  'flex h-10 min-w-10 items-center justify-center px-2.5 text-sm font-semibold text-slate-300 transition-colors hover:text-white active:scale-[0.98]';

export function Layout({ children, isDarkMode, setIsDarkMode }: LayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const [isBooting, setIsBooting] = useState(shouldBoot);

  useEffect(() => {
    if (!isBooting) return;
    const timer = setTimeout(() => setIsBooting(false), 1500);
    return () => clearTimeout(timer);
  }, [isBooting]);

  // Pause decorative animation while the tab is hidden.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => root.classList.toggle('tab-hidden', document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/calculator';
    }
    return location.pathname === path ||
      (path === '/history' && location.pathname.startsWith('/bill/'));
  };

  return (
    <div
      className={cn(
        'flex min-h-[100dvh] flex-col bg-slate-100 text-slate-700 transition-colors dark:bg-slate-950 dark:text-slate-100',
        isBooting && 'boot',
      )}
    >
      <header className="site-header bg-wnt-black text-slate-100">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-3">
          <Link to="/" className="flex shrink-0 items-baseline gap-3" aria-label={`ChiaBill - ${t.title}`}>
            <span className="font-heading text-2xl font-bold lowercase leading-none text-white sm:text-3xl">
              chiabill<span className="text-wnt-red">.</span>
            </span>
            <span className="hidden text-sm font-light text-slate-400 md:inline">{t.title}</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <nav aria-label={t.accessibility.primaryNavigation} className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                aria-current={isActive('/') ? 'page' : undefined}
                title={t.navigation.calculator}
                className={navLinkClass(isActive('/'))}
              >
                <Calculator size={20} aria-hidden="true" />
                <RollingText>{t.navigation.calculator}</RollingText>
              </Link>
              <Link
                to="/history"
                aria-current={isActive('/history') ? 'page' : undefined}
                title={t.navigation.history}
                className={navLinkClass(isActive('/history'))}
              >
                <ClockIcon size={20} aria-hidden="true" />
                <RollingText>{t.navigation.history}</RollingText>
              </Link>
            </nav>
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              aria-label={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
              title={language === 'en' ? 'Tiếng Việt' : 'English'}
              className={cn('rolling-text-trigger', iconButtonClass)}
            >
              <RollingText>{language === 'en' ? 'VI' : 'EN'}</RollingText>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? t.accessibility.useLightTheme : t.accessibility.useDarkTheme}
              title={isDarkMode ? 'Light theme' : 'Dark theme'}
              className={iconButtonClass}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] flex-grow px-4 pb-28 pt-6 sm:px-6 lg:pb-8">
        {children}
      </div>

      <footer className="mt-8 bg-wnt-black text-center">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-1 px-4 py-6 text-sm text-slate-400">
          <div>
            Built with <Heart className="mx-0.5 inline fill-wnt-red text-wnt-red" size={14} /> by{' '}
            <a
              href="https://namvu.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-200 hover:underline"
            >
              Nam Vu
            </a>
          </div>
          <div>
            <a
              href="https://github.com/vnt87/Billbill"
              className="inline-flex items-center gap-1 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={14} /> Source code
            </a>
          </div>
          <div className="text-xs opacity-75" aria-label={`Build ${__BUILD_NUMBER__}`}>
            Build {__BUILD_NUMBER__}
          </div>
        </div>
      </footer>
    </div>
  );
}
