import { useEffect } from 'react';
import { analyticsService } from '../services/analytics.service';

export function PolitiqueConfidentialitePage() {
  useEffect(() => {
    analyticsService.logPageView('Politique de confidentialité');
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container mx-auto px-6 pt-36 pb-16 relative z-10">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-center">
            Politique de confidentialité
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 md:p-12">
          <div className="prose prose-invert max-w-none text-neutral-300 font-light leading-relaxed">

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Préambule</h2>
              <p className="mb-4">
                La présente charte relative à l’utilisation des données personnelles concerne le site internet accessible notamment via l’adresse suivante : <a href="https://www.gbm-menuiserie.ovh/" className="text-white underline hover:text-neutral-300 transition-colors">https://www.gbmmenuiserie.fr/</a>, édité par la société GBM MENUISERIE. Elle a pour but de vous préciser :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>La façon dont, le cas échéant, nous sommes susceptibles de collecter et de traiter vos données personnelles ;</li>
                <li>Les droits dont vous bénéficiez au regard de vos données ;</li>
                <li>L’identité du responsable en charge du traitement de vos données ;</li>
                <li>La communication éventuelle de vos données à des tiers ;</li>
                <li>Notre politique de gestion des « cookies ».</li>
              </ul>
              <p className="mb-4">
                La présente politique de confidentialité vient compléter les Mentions légales disponibles sur notre Site.
              </p>
              <p className="mb-4">
                Nous nous engageons à traiter l’ensemble des données recueillies dans le respect :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Du Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l’égard du traitement des données à caractère personnel et à la libre circulation de ces données ;</li>
                <li>De la loi n°78-17 du 6 janvier 1978 dite « Informatique et Libertés », modifiée par la loi n° 2018-493 du 20 juin 2018 relative à la protection des données personnelles.</li>
              </ul>
              <p>
                Toute personne dont les données personnelles sont traitées par la société GBM Menuiserie reconnaît et accepte que ce traitement soit effectué conformément à la présente politique.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 1 : Le Responsable de traitement des données</h2>
              <p className="mb-4">
                Les informations d’identification et de contact du Responsable du traitement sont les suivantes :
              </p>
              <p className="mb-4">
                La société <strong className="text-white">GBM MENUISERIE</strong>, SARL (société à responsabilité limitée), immatriculée au RCS de Bergerac sous le numéro B 828 217 703, dont le siège social est situé 10 VOIE DE LA PEYRE 24240 Sigoulès, et dont le représentant légal est GRASSIOT Benjamin agissant en qualité de responsable.
              </p>
              <p className="mb-2">
                Toute demande relative aux données personnelles doit être envoyée par courrier à l’adresse suivante :
              </p>
              <p className="mb-2">
                10 VOIE DE LA PEYRE 24240 Sigoulès
              </p>
              <p>
                Ou par email à l’adresse <a href="mailto:gbmmenuiserie@outlook.fr" className="text-white underline hover:text-neutral-300 transition-colors">gbmmenuiserie@outlook.fr</a>
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 2 : Les données à caractère personnel collectées et traitées</h2>
              <p className="mb-4">
                Dans le cadre de l’utilisation de notre Site <a href="https://www.gbm-menuiserie.ovh/" className="text-white underline hover:text-neutral-300 transition-colors">https://www.gbmmenuiserie.fr/</a>, nous recueillons des données à caractère personnel concernant les utilisateurs.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">2.1 Les données générales collectées via le site internet</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Lors de votre connexion : votre adresse IP ainsi que des informations de navigation, sous réserve de votre accord et des réglages de votre terminal ;</li>
                <li>Lors de vos échanges avec nous via le formulaire de contact : vos nom(s) et prénom(s), la dénomination de votre société, votre adresse (rue, code postal, ville), votre numéro de téléphone ainsi que votre adresse email. Ces informations sont nécessaires afin de répondre aux messages transmis via le formulaire de contact ou la description de votre projet.</li>
                <li>Lorsque vous parcourez notre Site et que vous avez autorisé la collecte de données via les cookies.</li>
                <li>Lors de la consultation et de l’utilisation des fonctionnalités mises à disposition sur notre Site ;</li>
                <li>Lorsque vous participez à nos actions promotionnelles et campagnes de marketing direct, par exemple en prenant part à un jeu concours ;</li>
              </ul>
              <p className="mb-4">
                Lorsque la réglementation applicable l’impose, nous nous engageons à recueillir le consentement explicite, spécifique et préalable des utilisateurs du Site et/ou à leur offrir la possibilité de s’opposer à l’usage de leurs données pour certaines finalités. À ce titre, tout utilisateur peut retirer son consentement à tout moment.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">2.2 Collecte automatique</h3>
              <p>
                S’agissant de vos interactions avec notre Site, certaines informations sont collectées automatiquement depuis votre appareil ou votre navigateur. Les précisions relatives à ces pratiques figurent à l’article 8 « Cookies » ci-dessous. Ces données comprennent notamment l’adresse IP et les cookies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 3 : Les finalités des traitements</h2>
              <p className="mb-4">
                Nous collectons et/ou traitons vos données personnelles dans le respect des lois françaises et européennes relatives à la protection des données, lorsque cela est nécessaire :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Pour identifier les personnes utilisant notre Site ;</li>
                <li>Pour établir des statistiques d’usage et améliorer le fonctionnement du site ;</li>
                <li>Pour réaliser des opérations de maintenance et de recherche d’anomalies ;</li>
                <li>Pour répondre aux messages envoyés via le formulaire de contact ;</li>
                <li>Pour respecter la législation applicable ou toute autre obligation légale ;</li>
                <li>Pour assurer la sécurité des systèmes, détecter et prévenir la fraude, ou protéger nos intérêts légitimes, sans porter atteinte à vos intérêts ni à vos libertés et droits fondamentaux nécessitant une protection renforcée de vos données personnelles.</li>
              </ul>
              <p className="mb-4">
                Vous pouvez à tout moment retirer votre consentement ou vous opposer à tout traitement de vos données personnelles collectées.
              </p>
              <p className="mb-4">
                La collecte et le traitement des données répondent ainsi aux objectifs suivants :
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">Accéder à notre Site</h3>
              <p className="mb-4">
                Les données personnelles que vous transmettez sont utilisées à des fins comptables et d’audit interne. Elles permettent également d’identifier d’éventuels dysfonctionnements techniques et d’assurer l’administration du Site. Les informations relatives à votre utilisation du Site servent à analyser les comportements et préférences des utilisateurs et à produire des statistiques afin d’améliorer nos services et de développer de nouvelles fonctionnalités.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">Prospection et/ou envoi d’informations aux Utilisateurs</h3>
              <p className="mb-4">
                Ce traitement a pour objet l’envoi par email aux utilisateurs de notifications relatives à notre activité ainsi qu’à celle de nos partenaires.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">Proposer un contenu et une navigation personnalisés</h3>
              <p className="mb-4">
                Afin de rendre les Produits de notre Site plus adaptés aux centres d’intérêt des utilisateurs, sous réserve d’avoir obtenu le consentement explicite et préalable de l’utilisateur ;
              </p>
              <p>
                Afin de respecter nos obligations légales, prévenir ou détecter les fraudes, abus, usages illicites, et exécuter des décisions de justice ainsi que des demandes émanant des autorités.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 4 : Consentement</h2>
              <p className="mb-4">
                Dans le cadre d’une demande de contact, vous êtes susceptible de compléter des formulaires et de transmettre des données personnelles.
              </p>
              <p>
                Lorsque la réglementation applicable l’exige, nous nous engageons à recueillir votre consentement explicite, spécifique et préalable, et/ou à vous permettre de vous opposer à l’utilisation de vos données personnelles pour certaines finalités, et/ou à accéder et/ou rectifier les informations vous concernant.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 5 : Transmission des données à caractère personnel à des tiers</h2>
              <p className="mb-4">
                Les données personnelles collectées pourront être consultées :
              </p>
              <p className="mb-4">
                - Par les personnels habilités de la société HORIZON en charge de la gestion et de la maintenance du site ;
              </p>
              <p className="mb-4">
                Elles peuvent toutefois être transmises à des tiers en application de dispositions légales ou réglementaires, de décisions de justice, ou si cela s’avérait nécessaire afin de protéger ou défendre nos droits.
              </p>
              <p>
                Nous ne communiquons aucune donnée personnelle à des partenaires à des fins commerciales, ni à toute autre finalité ne correspondant pas aux besoins des objectifs mentionnés à l’article 3. Si nous envisagions de faire évoluer notre politique de transfert de données pour réaliser des transferts vers des partenaires, notamment commerciaux, cela ne pourrait intervenir qu’après avoir obtenu votre consentement explicite et préalable.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 6 : Hébergement et transfert des données à caractère personnel</h2>
              <p className="mb-4">
                Les données personnelles collectées et traitées sont hébergées par tout prestataire assurant l’hébergement de nos serveurs en France ou dans tout autre État membre de l’Union européenne.
              </p>
              <p>
                L’utilisateur est informé que nous pouvons, le cas échéant, transférer vos données personnelles vers un pays tiers ou une organisation internationale bénéficiant d’une décision d’adéquation de la Commission européenne. En cas de transfert vers un pays ou une organisation ne disposant pas d’une telle décision d’adéquation, le transfert ne pourra avoir lieu qu’à condition que des garanties appropriées soient mises en place et que les utilisateurs concernés disposent de droits opposables ainsi que de voies de recours effectives, conformément à la réglementation en vigueur.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 7 : Conservation des données</h2>
              <p className="mb-4">
                Les données personnelles sont conservées pendant la durée strictement nécessaire à la réalisation des finalités pour lesquelles elles sont traitées, conformément aux recommandations de la CNIL, et en s’inspirant de la norme simplifiée n° NS-048 relative aux traitements automatisés de données personnelles liés à la gestion de clients et de prospects.
              </p>
              <p className="mb-6">
                Elles peuvent ensuite être archivées, avec un accès limité, pour une durée supplémentaire, pour des motifs restreints et autorisés par la loi (paiement, garantie, litiges ...).
              </p>

              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-neutral-700">
                  <thead>
                    <tr className="bg-neutral-800">
                      <th className="border border-neutral-700 px-4 py-2 text-left text-white">Finalité du traitement</th>
                      <th className="border border-neutral-700 px-4 py-2 text-left text-white">Licéité - base juridique</th>
                      <th className="border border-neutral-700 px-4 py-2 text-left text-white">Durée de conservation en base active</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-neutral-700 px-4 py-2">Les logs de connexion</td>
                      <td className="border border-neutral-700 px-4 py-2">Consentement au titre de la présente charte</td>
                      <td className="border border-neutral-700 px-4 py-2">12 mois</td>
                    </tr>
                    <tr className="bg-neutral-800/50">
                      <td className="border border-neutral-700 px-4 py-2">Messages envoyés via le formulaire de contact</td>
                      <td className="border border-neutral-700 px-4 py-2">Consentement au titre de la présente charte</td>
                      <td className="border border-neutral-700 px-4 py-2">3 ans à compter du dernier échange</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 8 : Cookies</h2>
              <p className="mb-4">
                Lors de la consultation de notre Site, des cookies peuvent être enregistrés sur votre ordinateur, smartphone ou tablette.
              </p>
              <p className="mb-4">
                Un cookie est un petit fichier texte enregistré dans le navigateur de votre terminal (ordinateur, mobile, tablette) lors de la visite d’un site ou de l’affichage d’une publicité. Il sert à recueillir des informations liées à votre navigation ou à vous proposer des services adaptés à votre appareil. Les cookies sont administrés par votre navigateur Internet.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">8.1 Cookies utilisés et objectifs</h3>
              <p className="mb-4">Notre Site met en œuvre :</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>des cookies de fonctionnement (obligatoires) assurant le bon fonctionnement du Site et permettant son optimisation. Sans eux, notre Site ne peut pas fonctionner correctement.</li>
                <li>des cookies analytics permettant d’obtenir des statistiques anonymes de fréquentation afin d’améliorer l’ergonomie, la navigation et les contenus. Si ces cookies sont désactivés, nous ne pourrons pas analyser le trafic du Site.</li>
              </ul>
              <p>
                Ces cookies permettent à nos services de fonctionner de manière optimale. Ils sont indispensables pour naviguer et accéder au Site, et restent donc activés en permanence. Les cookies collectés ne sont ni cédés à des tiers ni exploités à d’autres fins que celles indiquées ci-dessus.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">8.2 Paramétrage des cookies</h3>
              <p className="mb-4">
                Plusieurs solutions existent pour gérer les cookies.
              </p>
              <p className="mb-4">
                Vous pouvez à tout moment ajuster vos préférences via une interface dédiée ou via votre navigateur, et ainsi vous opposer à l’enregistrement de cookies en configurant celui-ci. Chaque navigateur ayant un paramétrage propre, les modalités sont décrites dans son menu d’aide, qui vous indiquera comment modifier vos choix en matière de cookies.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">8.3 Consentement</h3>
              <p className="mb-4">
                En poursuivant votre navigation sur notre Site, vous consentez à l’utilisation des cookies mentionnés ci-dessus.
              </p>
              <p className="mb-4">
                Lors de votre première visite, nous vous avons informé de la présence de ces cookies ainsi que de la possibilité de vous y opposer en consultant la présente Charte d’utilisation des données personnelles.
              </p>
              <p className="mb-4">Nous attirons votre attention sur le fait que le refus des cookies :</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>peut provoquer des dysfonctionnements du Site</li>
                <li>peut rendre impossible l’analyse du trafic du Site</li>
              </ul>
              <p>
                Afin d’adapter au mieux l’usage des cookies à vos attentes, nous vous invitons à configurer votre navigateur en tenant compte de la finalité de chaque cookie.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">8.4 Droits d’accès, de suppression, d’opposition</h3>
              <p>
                Comme pour toute autre donnée personnelle, vous disposez des mêmes droits détaillés à l’article 10 ci-dessous.
              </p>

              <h3 className="text-xl font-light text-white mb-4 mt-6">8.5 Durée de conservation</h3>
              <p className="mb-4">Les cookies collectés sont conservés par nos soins pour une durée de :</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>13 mois pour les cookies de fonctionnement</li>
                <li>13 mois pour les cookies Analytics</li>
              </ul>
              <p>
                Cette durée n’est pas automatiquement prolongée lors de vos visites ultérieures. Au-delà, les données sont soit supprimées, soit anonymisées lorsqu’elles ne le sont pas déjà.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 9 : Sécurité des données</h2>
              <p>
                Afin de garantir la sécurité des données personnelles, notamment pour éviter qu’elles soient altérées, perdues, endommagées ou consultées par des tiers non autorisés, nous mettons en œuvre toutes les mesures appropriées compte tenu de la nature des données et des risques liés au traitement.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 10 : Droits des utilisateurs</h2>
              <p className="mb-4">
                Conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l’égard du traitement des données à caractère personnel et à la libre circulation de ces données, ainsi qu’à la loi n° 78-17 du 6 janvier 1978 relative à l’informatique, aux fichiers et aux libertés, vous disposez des droits suivants, exerçables à tout moment en contactant la société GBM MENUISERIE à l’adresse email suivante <a href="mailto:gbmmenuiserie@outlook.fr" className="text-white underline hover:text-neutral-300 transition-colors">gbmmenuiserie@outlook.fr</a>, via le formulaire de contact, ou par courrier à :
              </p>
              <p className="mb-6">10 ZAE ROC DE LA PEYRE 24240 Sigoulès</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Droit d’accès à vos données personnelles ;</li>
                <li>Droit de rectification et d’obtenir la correction des données inexactes ou incomplètes ;</li>
                <li>Droit de solliciter la suppression de vos données personnelles, sauf obligation ou motif légal/légitime de conservation ;</li>
                <li>Droit de vous opposer au traitement et d’en demander la limitation, sauf intérêt légitime de notre part ;</li>
                <li>Droit à la portabilité de vos données personnelles lorsque cela est applicable ;</li>
                <li>Droit de définir des directives concernant vos données personnelles après votre décès ;</li>
              </ul>
              <p className="mb-4">
                Toute demande doit indiquer précisément le droit que vous souhaitez exercer, être accompagnée d’une copie de votre carte nationale d’identité (ou passeport) en cours de validité, et mentionner les coordonnées (adresse, téléphone, email) auxquelles nous pourrons vous joindre. Ces informations ne seront conservées que pendant le temps strictement nécessaire au traitement de votre demande.
              </p>
              <p className="mb-4">
                Il est précisé que l’exercice de votre droit à l’effacement, et/ou de votre droit d’opposition, et/ou de votre droit à la limitation du traitement, et/ou de votre droit de retirer votre consentement à tout moment, peut avoir pour conséquence l’impossibilité pour l’utilisateur d’accéder au site ou de l’utiliser.
              </p>
              <p>
                Par ailleurs, vous êtes informé de votre droit de déposer une réclamation auprès de la Commission Nationale de l’Informatique et des Libertés (CNIL), soit par courrier au 3 Place de Fontenoy - TSA 80715 - 75334 Paris 07, soit en déposant une plainte en ligne sur le site <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-neutral-300 transition-colors">www.cnil.fr</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 11 : Informations sur le caractère contractuel de la fourniture des données à caractère personnel</h2>
              <p>
                La fourniture de données personnelles revêt un caractère contractuel (dans le cadre de la relation que l’utilisateur souhaite établir avec la société HORIZON).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 12 : Prise de décision automatisée</h2>
              <p>
                Il est précisé qu’aucune décision automatisée, au sens de la réglementation en vigueur, n’est prise sur la base des données personnelles collectées.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 13 : Éventuel traitement ultérieur des données à caractère personnel</h2>
              <p>
                Dans l’hypothèse où un traitement ultérieur des données personnelles serait réalisé pour des finalités différentes de celles ayant motivé la collecte, et telles qu’identifiées ci-avant, le Responsable du traitement informera préalablement la personne concernée de cette nouvelle finalité ainsi que de toute autre information légalement requise.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 14 : Age de la personne pouvant fournir ses données à caractère personnel</h2>
              <p>
                La collecte de données personnelles ne peut concerner que des personnes âgées d’au moins 18 ans. Les utilisateurs doivent être majeurs pour accéder au Site et, le cas échéant, pour effectuer une Commande. En conséquence, en réalisant une Commande via notre Site et/ou en nous communiquant des données personnelles, vous déclarez et garantissez à la société GBM MENUISERIE être âgé d’au moins 18 ans. Cette stipulation n’affecte pas l’engagement pris par l’utilisateur vis-à-vis de la société GBM MENUISERIE, par lequel il déclare et garantit disposer de la capacité juridique et légale d’utiliser notre Site.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 15 : Liens vers les autres sites</h2>
              <p>
                Notre Site peut intégrer des liens pointant vers d’autres sites sur lesquels nous n’exerçons aucun contrôle. Nous ne saurions être tenus responsables des politiques ou pratiques de protection des données mises en œuvre par les sites tiers que vous choisissez de consulter depuis notre Site. Nous vous recommandons donc de lire leurs politiques de confidentialité afin de comprendre leurs modalités de collecte, d’utilisation et de partage des données.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-light text-white mb-6">Article 16 : Modifications</h2>
              <p>
                Nous nous réservons la possibilité de modifier ou d’actualiser à tout moment la présente Charte d’utilisation des données personnelles. Toute mise à jour sera publiée dans cette rubrique. Nous vous invitons à consulter régulièrement la Charte afin de vérifier si des changements ont été apportés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-white mb-6">En savoir plus</h2>
              <p>
                Vous trouverez davantage d’informations sur la protection des données personnelles sur le site de la Commission Nationale Informatique et Libertés (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-white underline hover:text-neutral-300 transition-colors">www.cnil.fr</a>)
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
