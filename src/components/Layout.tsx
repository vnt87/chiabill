import { Heart, Github, Sun, Moon, Calculator, ClockIcon } from 'lucide-react';
import { useLanguage, translations } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export function Layout({ children, isDarkMode, setIsDarkMode }: LayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Set initial theme based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col">
      <div className="w-[95%] sm:w-[90%] max-w-[1200px] mx-auto px-2 sm:px-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isActive('/')
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <Calculator size={20} />
                <span className="hidden sm:inline">{t.navigation.calculator}</span>
              </Link>
              <Link
                to="/history"
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isActive('/history')
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors`}
              >
                <ClockIcon size={20} />
                <span className="hidden sm:inline">{t.navigation.history}</span>
              </Link>
            </nav>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        
        {children}
      </div>
      
      <footer className="mt-8 space-y-2 text-center">
        <button
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {language === 'en' ? translations.vi.languageName : translations.en.languageName}
        </button>
        <div className="py-2 text-xs text-gray-500 dark:text-gray-400">
          Crafted with <Heart size={12} className="inline text-red-500" /> by Nam Vu
          {' • '}
          <a 
            href="https://github.com/vnt87/Billbill" 
            className="hover:text-gray-600 dark:hover:text-gray-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={12} className="inline" /> Source Code
          </a>
        </div>
      </footer>
    </div>
  );
}
