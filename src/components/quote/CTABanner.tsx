import { Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CTABanner() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-brown-950 via-brown-900 to-brown-950 text-white py-16 my-16">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-light mb-6 tracking-wide">
          Prêt à concrétiser votre projet ?
        </h2>
        <p className="text-lg text-neutral-300 font-light mb-8 max-w-3xl mx-auto">
          Contactez-nous pour un devis personnalisé et un accompagnement sur mesure
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/quote-request')}
            className="bg-white text-brown-950 px-8 py-3 font-medium tracking-wide hover:bg-neutral-100 transition-colors"
          >
            Demander un devis
          </button>
          <button
            onClick={() => window.location.href = 'tel:+33123456789'}
            className="border-2 border-white text-white px-8 py-3 font-medium tracking-wide hover:bg-white hover:text-brown-950 transition-colors flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Appeler [Téléphone]
          </button>
        </div>
      </div>
    </div>
  );
}
