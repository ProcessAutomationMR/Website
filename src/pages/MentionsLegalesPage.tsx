import { useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';

export function MentionsLegalesPage() {
  useEffect(() => {
    analyticsService.logPageView('Mentions légales');
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container mx-auto px-6 pt-36 pb-16 relative z-10">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-center">
            Mentions légales
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 md:p-12">
          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Editeur</h2>
              <div className="text-neutral-300 font-light leading-relaxed space-y-2">
                <p><strong className="text-white">GBM MENUISERIE</strong> - 10 VOIE DE LA PEYRE 24240 Sigoulès</p>
                <p>SARL société à responsabilité limitée au capital social de 50 000,00 €</p>
                <p>SIREN 828217703</p>
                <p>Téléphone : 06 31 05 04 85 – Mail : gbmmenuiserie@outlook.fr</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Directeur de la publication</h2>
              <div className="text-neutral-300 font-light leading-relaxed">
                <p>GRASSIOT Benjamin en sa qualité de responsable de la société GBM MENUISERIE</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Hébergement</h2>
              <div className="text-neutral-300 font-light leading-relaxed space-y-2">
                <p><strong className="text-white">OVH</strong> - 2 rue Kellermann - BP 80157 - 59053 Roubaix Cedex 1</p>
                <p>Téléphone : 08 20 32 03 63 – Mail : support@ovh.com</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Conception et création</h2>
              <div className="text-neutral-300 font-light leading-relaxed space-y-2">
                <p><strong className="text-white">GBM Menuiserie</strong> 10 voie de la Peyre 24240 Sigoulès</p>
                 <p>Téléphone : 06 31 05 04 85 – Mail : gbmmenuiserie@outlook.fr</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6">Mise à jour</h2>
              <div className="text-neutral-300 font-light leading-relaxed">
                <p>
                  Les dispositions sont actualisées chaque fois que nécessaire, notamment pour tenir compte des évolutions législatives et réglementaires.
                </p>
                <p className="mt-4">
                  Vous êtes donc invités à prendre régulièrement connaissance de la version en vigueur.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
