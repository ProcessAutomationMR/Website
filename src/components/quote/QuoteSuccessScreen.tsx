export function QuoteSuccessScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl max-w-2xl w-full p-12 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-light text-brown-950 tracking-wide">
          Demande envoyée avec succès!
        </h2>
        <p className="text-lg text-neutral-600 font-light leading-relaxed">
          Nous avons bien reçu votre demande de devis. Notre équipe vous contactera dans les plus brefs délais.
        </p>
        <p className="text-sm text-neutral-500">
          Vous allez être redirigé vers la page d'accueil...
        </p>
      </div>
    </div>
  );
}
