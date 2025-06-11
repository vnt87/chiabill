import { Heart, Github, Sun, Moon, Calculator, ClockIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
interface LayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

export function Layout({ children, isDarkMode, setIsDarkMode }: LayoutProps) {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => 
    location.pathname === path || 
    (path === '/history' && location.pathname.startsWith('/bill/'));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col">
      <div className="w-[95%] sm:w-[90%] max-w-[1200px] mx-auto px-2 sm:px-4 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity">
            {t.title}
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isActive('/')
                    ? 'bg-blue-500 text-white h-10'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 h-10'
                } transition-colors flex items-center px-3`}
              >
                <Calculator size={20} />
                <span className="hidden sm:inline">{t.navigation.calculator}</span>
              </Link>
              <Link
                to="/history"
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  isActive('/history')
                    ? 'bg-blue-500 text-white h-10'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 h-10'
                } transition-colors flex items-center px-3`}
              >
                <ClockIcon size={20} />
                <span className="hidden sm:inline">{t.navigation.history}</span>
              </Link>
            </nav>
            <button
              onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
              className="h-10 px-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              {language === 'en' ? 'VI' : 'EN'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-10 px-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        
        {children}
      </div>
      
      <footer className="mt-8 text-center">
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
