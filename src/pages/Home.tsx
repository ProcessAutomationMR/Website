import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { GeneralProjectModal } from '../components/GeneralProjectModal';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function getStorageUrl(path: string) {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${supabaseUrl}/storage/v1/object/public/Photos/${encodedPath}`;
}

export function Home() {
  const [showProjectModal, setShowProjectModal] = useState(false);

  useEffect(() => {
    analyticsService.logPageView('Homepage');
  }, []);

  return (
    <>
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={getStorageUrl('Homepage/hero-video.mp4')} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 25%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.95) 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <img
            src={getStorageUrl('Homepage/Logo.png')}
            alt="Logo"
            className="h-32 md:h-40 w-auto object-contain mb-8 animate-subtle-glow"
          />

          <h1 className="text-2xl md:text-3xl font-medium text-white mb-6 tracking-wide">
            Menuisier fabriquant sur mesure
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl leading-relaxed px-4">
            LE PATRIMOINE EST LE LÈGUE DE NOS ANCÊTRES,<br />
            NOTRE MÉTIER EST DE LUI REDONNER SA SPLENDEUR
          </p>

          <Link
            to="/contact"
            onClick={() => analyticsService.logCTAClick('Contactez-nous', 'Hero section')}
            className="inline-block bg-white text-neutral-900 px-10 py-4 text-lg font-medium hover:bg-neutral-100 transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </section>

      <div className="bg-neutral-900 border-y border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 md:gap-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center text-yellow-500 h-[40px]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <span className="font-medium text-white text-sm">5/5 sur<br />Google</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex items-center justify-center h-[40px]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <line x1="20" y1="4" x2="20" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="20" y1="4" x2="28" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="20" cy="4" r="2" stroke="white" strokeWidth="1.2" fill="none" />
                  <circle cx="20" cy="26" r="1.5" fill="white" />
                  <circle cx="28" cy="28" r="2.5" stroke="white" strokeWidth="1.2" fill="none" />
                  <line x1="28" y1="30.5" x2="28" y2="33" stroke="white" strokeWidth="1" />
                  <rect x="4" y="32" width="32" height="4" stroke="white" strokeWidth="1.2" fill="none" rx="0.5" />
                  <line x1="8" y1="32" x2="8" y2="36" stroke="white" strokeWidth="1" />
                  <line x1="12" y1="32" x2="12" y2="36" stroke="white" strokeWidth="1" />
                  <line x1="16" y1="32" x2="16" y2="34.5" stroke="white" strokeWidth="1" />
                  <line x1="20" y1="32" x2="20" y2="36" stroke="white" strokeWidth="1" />
                  <line x1="24" y1="32" x2="24" y2="34.5" stroke="white" strokeWidth="1" />
                  <line x1="28" y1="32" x2="28" y2="36" stroke="white" strokeWidth="1" />
                  <line x1="32" y1="32" x2="32" y2="34.5" stroke="white" strokeWidth="1" />
                </svg>
              </div>
              <span className="font-medium text-white text-sm">Sur Mesure</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <svg width="64" height="40" viewBox="0 0 64 40" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0066CC" stopOpacity="1" />
                    <stop offset="100%" stopColor="#003D7A" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="whiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="100%" stopColor="#F0F0F0" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF4444" stopOpacity="1" />
                    <stop offset="100%" stopColor="#CC0000" stopOpacity="1" />
                  </linearGradient>
                  <filter id="innerShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.5"/>
                    <feOffset dx="0" dy="0.5" result="offsetblur"/>
                    <feFlood floodColor="#000000" floodOpacity="0.15"/>
                    <feComposite in2="offsetblur" operator="in"/>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <rect x="0" y="0" width="64" height="40" fill="#1a1a1a" rx="1"/>
                <rect x="1" y="1" width="21.33" height="38" fill="url(#blueGrad)" filter="url(#innerShadow)"/>
                <rect x="22.33" y="1" width="21.34" height="38" fill="url(#whiteGrad)" filter="url(#innerShadow)"/>
                <rect x="43.67" y="1" width="19.33" height="38" fill="url(#redGrad)" filter="url(#innerShadow)"/>
                <rect x="0" y="0" width="64" height="40" fill="none" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1" rx="1"/>
                <rect x="0" y="0" width="64" height="40" fill="url(#shine)" opacity="0.1" rx="1"/>
                <defs>
                  <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-medium text-white text-sm">Made in<br />France</span>
            </div>
          </div>
        </div>
      </div>

      <section className="pt-48 pb-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-white mb-6">
              Artisan Menuisier traditionnel à Sigoulès
            </h2>
            <p className="text-xl text-neutral-300 max-w-4xl mx-auto leading-relaxed">
              Avec 20 ans d'expérience, l'équipe GBM MENUISERIE consacre son atelier à la création de menuiseries et agencements sur mesure <strong>haut de gamme.
              Portes, fenêtres, cuisines, dressings, laquage</strong> — nous travaillons le bois dans le respect de l'art et de la tradition.
              Nous concrétisons vos projets de <strong className="text-white">Bordeaux</strong> à <strong className="text-white">Sarlat</strong>,
              avec une vision créative où seule l'imagination est la limite.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-48 pb-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-white mb-4">Nos expertises</h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Un savoir-faire artisanal au service de vos projets les plus exigeants
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                to: "/category/menuiserie",
                label: "Menuiserie category",
                image: "Homepage/Menuiserie.jpg",
                title: "Menuiserie",
                description: "Portes, fenêtres et volets en bois massif haut de gamme",
              },
              {
                to: "/category/agencement",
                label: "Agencement category",
                image: "Homepage/Agencement.jpg",
                title: "Agencement",
                description: "Cuisines, dressings, bibliothèques et agencements professionnels sur mesure",
              },
              {
                to: "/category/agencement-magasins",
                label: "Agencement de magasins category",
                image: "Homepage/Agencement de magasin.jpg",
                title: "Agencement de magasins",
                description: "Bars, restaurants, commerces et bureaux — agencements professionnels sur mesure",
              },
              {
                to: "/category/Laquage",
                label: "Laquage category",
                image: "Homepage/Laquage.jpg",
                title: "Laquage",
                description: "Finitions laquées sur mesure pour tous vos projets",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => analyticsService.logNavigation(item.label, 'Homepage expertises section')}
                className="group relative overflow-hidden rounded-lg"
                style={{ minHeight: '360px' }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${getStorageUrl(item.image)})` }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                </div>
                <div className="relative h-full flex flex-col justify-end p-8" style={{ minHeight: '360px' }}>
                  <h3 className="text-3xl text-white mb-3">{item.title}</h3>
                  <p className="text-white/90 mb-4 text-sm">{item.description}</p>
                  <span className="inline-flex items-center space-x-2 text-white font-medium">
                    <span>Découvrir</span>
                    <ArrowRight size={20} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/projects"
              onClick={() => analyticsService.logCTAClick('Voir toutes nos créations', 'Homepage expertises section')}
              className="inline-block bg-neutral-800 text-white px-10 py-4 font-medium hover:bg-neutral-700 transition-colors border border-neutral-700"
            >
              Voir toutes nos créations
            </Link>
          </div>
        </div>
      </section>

      <section className="pt-20 pb-20 bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl text-white mb-8 text-center">
            <strong>Menuiserie artisanale sur mesure</strong> :<br />Fenêtres, Volets et Portes en bois
          </h2>
          <p className="text-lg text-neutral-300 leading-relaxed text-center">
            Au cœur de notre atelier, la <strong>menuiserie artisanale</strong> est bien plus qu'un savoir-faire : c'est une passion guidée par la rigueur, la précision et l'amour du travail bien fait. Nous concevons et fabriquons sur mesure vos <strong>fenêtres en bois, volets, portes d'entrée</strong> et <strong>portes intérieures</strong>, en privilégiant une fabrication traditionnelle et des matériaux de qualité, notamment du bois local. Chaque réalisation est pensée pour être <strong>esthétique, robuste et durable</strong>, avec ce charme authentique et cette élégance intemporelle qui valorisent votre habitat, en neuf comme en rénovation, dans les environs de <strong>Bordeaux, Bergerac</strong> et jusqu'à <strong>Sarlat</strong>.
          </p>
        </div>
      </section>

      <section className="relative pt-48 pb-48 overflow-hidden min-h-[600px]">
        <div
          className="absolute top-48 left-0 right-0 bottom-48 bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getStorageUrl('Homepage/passion.jpg')})`,
          }}
        />
        <div className="absolute top-48 left-0 right-0 bottom-48 bg-black/60" />
        <div
          className="absolute top-48 left-0 right-0 bottom-48"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%)'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center h-full flex items-center justify-center" style={{ minHeight: 'calc(600px - 12rem)' }}>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed px-4">
            LE BOIS EST MA PASSION, ET AVEC VOUS, JE FAIS DE MA PASSION MON METIER.
          </p>
        </div>
      </section>

      <section className="pt-20 pb-20 bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl text-white mb-8 text-center">
            <strong>Agencement d'intérieur et Professionnel</strong> :<br />Dressing, Cuisine et Magasins sur mesure
          </h2>
          <p className="text-lg text-neutral-300 leading-relaxed text-center">
            Parce qu'un intérieur réussi se joue dans les détails, nous vous accompagnons aussi dans tous vos projets<strong>d'agencement sur mesure : dressing, cuisine</strong>, placards, bibliothèques, bars, aménagements de portes et rangements, de la <strong>fabrication à la pose</strong>. Pour les professionnels, nous réalisons également <strong>l'agencement de magasins</strong> et espaces de vente, avec une approche fonctionnelle, élégante et adaptée à votre image. En collaboration avec des <strong>architectes, décorateurs ou maîtres d'œuvre</strong> si besoin, Benjamin GRASSIOT met au service de votre projet une vision créative nourrie d'expériences variées, pour transformer vos idées en <strong>réalisations uniques</strong>, parfaitement intégrées à votre espace.
          </p>
        </div>
      </section>

      <section className="pt-20 pb-20 bg-neutral-900 text-white border-t border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">Prêt à concrétiser votre projet ?</h2>
          <p className="text-xl text-white/80 mb-10">
            Une création unique commence toujours par une rencontre.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => {
                analyticsService.logCTAClick('Parlons de votre projet', 'Bottom CTA section');
                setShowProjectModal(true);
              }}
              className="inline-block bg-white text-neutral-900 px-8 py-4 font-medium hover:bg-neutral-100 transition-colors"
            >
              Parlons de votre projet
            </button>
          </div>
        </div>
      </section>

      {showProjectModal && (
        <GeneralProjectModal onClose={() => setShowProjectModal(false)} />
      )}
    </>
  );
}
