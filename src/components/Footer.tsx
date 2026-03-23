import { MapPin, Phone, Star, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/analytics.service';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function getStorageUrl(path: string) {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${supabaseUrl}/storage/v1/object/public/Photos/${encodedPath}`;
}

export function Footer() {
  const categories = [
    { name: 'Menuiserie', slug: 'menuiserie' },
    { name: 'Agencement', slug: 'agencement' },
    { name: 'Agencement de magasins', slug: 'agencement-magasins' },
    { name: 'Laquage', slug: 'laquage' }
  ];

  return (
    <footer className="bg-black text-white border-t border-neutral-800">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
              Spécialiste de la menuiserie et de l'agencement sur mesure, nous créons des espaces uniques qui allient esthétique et fonctionnalité. Notre savoir-faire artisanal au service de vos projets résidentiels et commerciaux dans le Sud-Ouest.
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-neutral-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-neutral-400">10 voie de la Peyre, 24240 Sigoulès </span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-neutral-400 mt-1 flex-shrink-0" />
                <span className="text-sm text-neutral-400">06 31 05 04 85</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Expertises</h3>
            <div className="text-sm text-neutral-400 space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/projects?category=${category.slug}`}
                  onClick={() => analyticsService.logNavigation(`Footer: ${category.name}`, 'Footer')}
                  className="block hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Zones d'intervention</h3>
            <div className="text-sm text-neutral-400 space-y-2">
              <Link
                to="/menuisier-sarlat"
                onClick={() => analyticsService.logNavigation('Footer: Sarlat', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Sarlat
              </Link>
              <Link
                to="/menuisier-bordeaux"
                onClick={() => analyticsService.logNavigation('Footer: Bordeaux', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Bordeaux
              </Link>
              <Link
                to="/menuisier-arcachon"
                onClick={() => analyticsService.logNavigation('Footer: Arcachon', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Arcachon
              </Link>
              <Link
                to="/menuisier-cap-ferret"
                onClick={() => analyticsService.logNavigation('Footer: Cap Ferret', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Cap Ferret
              </Link>
              <Link
                to="/menuisier-bergerac"
                onClick={() => analyticsService.logNavigation('Footer: Bergerac', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Bergerac
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Informations légales</h3>
            <div className="text-sm text-neutral-400 space-y-2">
              <Link
                to="/mentions-legales"
                onClick={() => analyticsService.logNavigation('Footer: Mentions légales', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                to="/politique-confidentialite"
                onClick={() => analyticsService.logNavigation('Footer: Politique de confidentialité', 'Footer')}
                className="block hover:text-white transition-colors"
              >
                Politique de confidentialité
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('cookieConsent');
                  window.location.reload();
                }}
                className="block hover:text-white transition-colors text-left"
              >
                Gérer les cookies
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center space-x-2 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
                <span className="text-white text-sm ml-2">5/5 sur Google</span>
              </div>
              <div className="text-sm text-neutral-400">Garantie décennale</div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="http://facebook.com/people/SARL-GBM-Menuiserie/100064392150025/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analyticsService.logNavigation('Footer: Facebook', 'Footer')}
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-neutral-500">
            GBM Menuiserie - © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </footer>
  );
}
