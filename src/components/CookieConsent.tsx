import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      timestamp: new Date().toISOString()
    }));
    sessionStorage.removeItem('analytics_session_id');
    setIsVisible(false);
    window.location.reload();
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl max-w-2xl w-full animate-slide-up">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-800 rounded-lg">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-light text-white">Gestion des cookies</h2>
            </div>
            <button
              onClick={handleDecline}
              className="text-neutral-400 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-neutral-300 font-light leading-relaxed mb-6">
            <p className="mb-4">
              Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic de notre site et personnaliser le contenu.
            </p>

            {showDetails && (
              <div className="space-y-4 mb-4 p-4 bg-neutral-800/50 rounded-lg">
                <div>
                  <h3 className="text-white font-medium mb-2">Cookies nécessaires (obligatoires)</h3>
                  <p className="text-sm text-neutral-400">
                    Ces cookies sont essentiels au bon fonctionnement du site. Ils permettent la navigation et l'accès aux fonctionnalités de base.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Cookies analytics (optionnels)</h3>
                  <p className="text-sm text-neutral-400">
                    Ces cookies nous permettent de comprendre comment les visiteurs utilisent notre site en collectant des informations de manière anonyme.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-white underline hover:text-neutral-300 transition-colors mb-4"
            >
              {showDetails ? 'Masquer les détails' : 'En savoir plus'}
            </button>

            <p className="text-sm">
              Pour plus d'informations, consultez notre{' '}
              <Link
                to="/politique-confidentialite"
                className="text-white underline hover:text-neutral-300 transition-colors"
                onClick={() => setIsVisible(false)}
              >
                Politique de confidentialité
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
            >
              Tout accepter
            </button>
            <button
              onClick={handleAcceptNecessary}
              className="flex-1 bg-neutral-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-neutral-700 transition-colors border border-neutral-700"
            >
              Nécessaires uniquement
            </button>
            <button
              onClick={handleDecline}
              className="sm:w-auto px-6 py-3 text-neutral-400 hover:text-white transition-colors"
            >
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
