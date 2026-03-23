import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, CheckCircle, Paintbrush, Home, Building2 } from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { useEffect } from 'react';

export function BergeracPage() {
  useEffect(() => {
    analyticsService.logNavigation('Menuisier Bergerac', 'SEO Page');
  }, []);

  const services = [
    { icon: Home, title: 'Menuiserie traditionnelle', description: 'Création de menuiseries sur mesure en bois massif' },
    { icon: Building2, title: 'Agencement', description: 'Agencement commercial et résidentiel sur mesure' },
    { icon: Paintbrush, title: 'Laquage', description: 'Finitions haut de gamme pour vos menuiseries' },
  ];

  const servicesList = [
    'Fabrication et pose de portes intérieures sur mesure',
    'Création de terrasses en bois et plages de piscine',
    'Fabrication de parquet (Versailles, point de Hongrie)',
    'Agencement de commerce et espaces professionnels',
    'Menuiseries haut de gamme et contemporaines',
    'Laquage et finitions pour tous types de supports',
    'Rénovation de menuiseries anciennes',
    'Habillage d\'escalier sur mesure',
    'Création de volets et fenêtres sur mesure',
  ];

  const nearbyLocations = [
    { name: 'Sigoulès', distance: 'Atelier principal' },
    { name: 'Bergerac Centre', distance: '25 km' },
    { name: 'Périgueux', distance: '55 km' },
    { name: 'Marmande', distance: '40 km' },
    { name: 'Ste-Foy-la-Grande', distance: '15 km' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white pt-44 pb-24 border-b border-neutral-800">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-neutral-400" size={24} />
              <span className="text-neutral-400 text-lg">Bergerac et agglomération</span>
            </div>
            <h1 className="text-5xl font-light mb-6 tracking-wide">
              Menuisier à Bergerac
            </h1>
            <p className="text-xl text-neutral-300 font-light leading-relaxed">
              Artisan menuisier expert en menuiserie traditionnelle et contemporaine, GBM MENUISERIE intervient à Bergerac et dans toute la Dordogne pour vos projets de menuiserie sur mesure, agencement et laquage.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg hover:border-neutral-700 transition-colors"
              >
                <Icon className="text-neutral-400 mb-4" size={40} />
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl font-light text-white mb-6">
              Votre menuisier expert à Bergerac
            </h2>
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <p>
                Vous recherchez un <strong>menuisier professionnel à Bergerac</strong> pour vos travaux de menuiserie traditionnelle ou contemporaine ? GBM MENUISERIE, artisan menuisier établi à Sigoulès à quelques kilomètres de Bergerac, intervient dans toute la région bergeracoise pour réaliser vos projets sur mesure.
              </p>
              <p>
                Spécialisés dans la <strong>menuiserie haut de gamme</strong>, l'<strong>agencement sur mesure</strong> et le <strong>laquage professionnel</strong>, nous mettons notre savoir-faire au service de vos projets résidentiels et commerciaux à Bergerac. Que vous souhaitiez créer des menuiseries d'exception, aménager vos espaces ou obtenir des finitions parfaites, notre équipe vous accompagne de la conception à la réalisation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-light text-white mb-6">
              La maîtrise du bois au cœur de notre métier
            </h2>
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <p>
                En véritables passionnés du travail du bois, nous réalisons à Bergerac et ses environs tous vos projets de <strong>menuiserie sur mesure</strong> : portes intérieures, fenêtres, placards, dressings, bibliothèques, et bien plus encore. Notre maîtrise des techniques traditionnelles et modernes nous permet de créer des pièces uniques, adaptées à vos besoins et à votre esthétique.
              </p>
              <p>
                Nous intervenons également pour la création de <strong>terrasses en bois</strong>, de <strong>plages de piscine</strong>, et la pose de <strong>parquets d'exception</strong> (Versailles, point de Hongrie, planchers anciens). Nos prestations de <strong>laquage professionnel</strong> apportent des finitions parfaites à tous vos ouvrages en bois. Chaque réalisation bénéficie d'une attention particulière portée au détail et à la qualité des finitions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-light text-white mb-6">
              Nos prestations de menuiserie à Bergerac
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {servicesList.map((service, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="text-neutral-400 flex-shrink-0 mt-1" size={20} />
                  <span className="text-neutral-300">{service}</span>
                </div>
              ))}
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Notre entreprise de menuiserie intervient pour les particuliers et professionnels à Bergerac et dans toute la Dordogne. Nous nous adaptons à vos contraintes et à vos envies pour créer des <strong>menuiseries esthétiques et fonctionnelles</strong> qui valorisent vos espaces.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-light text-white mb-6">
              Menuiserie d'agencement pour professionnels à Bergerac
            </h2>
            <div className="space-y-4 text-neutral-300 leading-relaxed">
              <p>
                Propriétaires de commerces ou de restaurants à Bergerac ? Nous réalisons votre <strong>agencement commercial sur mesure</strong> pour dynamiser et valoriser vos espaces de vente. De la conception à la pose, nous créons des aménagements professionnels adaptés aux exigences du commerce bergeracois.
              </p>
              <p>
                Notre expertise en <strong>menuiserie d'agencement</strong> nous permet de concevoir des mobiliers professionnels robustes, esthétiques et parfaitement intégrés à votre activité, que ce soit dans le centre historique de Bergerac ou dans l'agglomération.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-light text-white mb-6">
              Zone d'intervention à Bergerac et alentours
            </h2>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-white font-medium">{location.name}</span>
                    <span className="text-neutral-400 text-sm">{location.distance}</span>
                  </div>
                ))}
              </div>
              <p className="text-neutral-400 text-sm mt-6 leading-relaxed">
                Basés à Sigoulès, nous intervenons dans toute la région de Bergerac, incluant la Dordogne, le Périgord Pourpre, et les communes de l'agglomération bergeracoise.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-800 rounded-lg p-10">
            <h2 className="text-3xl font-light text-white mb-6">
              Demandez votre devis gratuit
            </h2>
            <p className="text-neutral-300 leading-relaxed mb-8">
              Pour tout projet de <strong>menuiserie à Bergerac</strong>, contactez GBM MENUISERIE. Nous étudions votre demande et vous proposons un devis personnalisé adapté à vos besoins et à votre budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                onClick={() => analyticsService.logNavigation('Bergerac Page: Contact CTA', 'SEO Page')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-medium rounded hover:bg-neutral-200 transition-colors"
              >
                Demander un devis
              </Link>
              <a
                href="tel:0631050485"
                onClick={() => analyticsService.logNavigation('Bergerac Page: Phone CTA', 'SEO Page')}
                className="inline-flex items-center justify-center px-8 py-4 border border-neutral-700 text-white font-medium rounded hover:bg-neutral-800 transition-colors"
              >
                <Phone size={20} className="mr-2" />
                06 31 05 04 85
              </a>
            </div>
          </section>

          <section>
            <div className="flex items-center space-x-2 text-yellow-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="currentColor" />
              ))}
              <span className="text-white text-lg ml-2">5/5 sur Google</span>
            </div>
            <p className="text-neutral-400 text-sm">
              Garantie décennale • Artisan qualifié
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
