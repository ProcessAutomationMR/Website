import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';
import { SearchModal } from './SearchModal';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const categories = [
    { name: 'Menuiserie', path: '/category/menuiserie' },
    { name: 'Agencement', path: '/category/agencement' },
    { name: 'Agencement de magasins', path: '/category/agencement-magasins' },
    { name: 'Laquage', path: '/category/laquage' }
  ];

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`bg-black border-b border-neutral-800 fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="relative h-20 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-full lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-8">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center space-x-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              aria-label="Menu"
            >
              <Menu size={20} />
              <span>Menu</span>
            </button>

            <Link
              to="/"
              onClick={() => analyticsService.logHeaderLogoClick()}
              className="flex items-center justify-center flex-shrink-0"
            >
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/Photos/Homepage/Logo.png`}
                alt="Logo"
                className="h-12 w-auto object-contain brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>

            <nav className="flex items-center space-x-6 justify-end">
              <Link to="/contact" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Contact
              </Link>
              <button
                onClick={() => {
                  analyticsService.logButtonClick('Open search modal');
                  setIsSearchOpen(true);
                }}
                className="text-neutral-300 hover:text-white transition-colors"
                aria-label="Rechercher"
              >
                <Search size={20} />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-black border-r border-neutral-800 z-[101] transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <h2 className="text-lg font-medium text-white">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-neutral-300 hover:text-white transition-colors"
              aria-label="Fermer le menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6">
            <div className="px-6 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 text-base font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Accueil
              </Link>

              <Link
                to="/projects"
                onClick={() => setIsMenuOpen(false)}
                className={`block py-3 text-base font-medium transition-colors ${
                  location.pathname === '/projects'
                    ? 'text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                Nos Créations
              </Link>

              <div className="pt-4 pb-2">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Nos Créations par Catégories
                </h3>
              </div>

              {categories.map((category) => {
                const isActive = location.pathname === category.path;
                return (
                  <Link
                    key={category.path}
                    to={category.path}
                    onClick={() => {
                      analyticsService.logNavigation(`${category.name} category`, 'Header menu');
                      setIsMenuOpen(false);
                    }}
                    className={`block py-3 text-base font-medium transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
