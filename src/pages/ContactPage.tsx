import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Phone } from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { getCSRFToken, clearCSRFToken } from '../utils/csrf.utils';
import { normalizePhone } from '../utils/validation.utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function ContactPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [csrfToken] = useState(() => getCSRFToken());
  const [honeypot, setHoneypot] = useState('');

  useEffect(() => {
    analyticsService.logPageView('Contact Page');
  }, []);

  const [formData, setFormData] = useState(() => {
    const savedUserInfo = sessionStorage.getItem('userContactInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        return {
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          subject: '',
          message: ''
        };
      } catch {
        return { firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' };
      }
    }
    return { firstName: '', lastName: '', email: '', phone: '', subject: '', message: '' };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;

    analyticsService.logContactForm(formData.subject || 'General inquiry');

    setSubmitting(true);

    const fullMessage = formData.subject
      ? `Sujet: ${formData.subject}\n\n${formData.message}`
      : formData.message;

    const normalizedPhone = formData.phone ? normalizePhone(formData.phone) : null;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-contact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: normalizedPhone || undefined,
          subject: formData.subject || undefined,
          message: formData.message,
        }),
      });

      setSubmitting(false);

      if (response.status === 429) {
        alert('Trop de demandes. Veuillez patienter quelques minutes avant de réessayer.');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      clearCSRFToken();
      sessionStorage.removeItem('userContactInfo');

      window.scrollTo({ top: 0, behavior: 'smooth' });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 6000);
    } catch {
      setSubmitting(false);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== ''
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-light text-brown-950 mb-4">Message envoyé avec succès</h2>
          <p className="text-neutral-600 font-light mb-8">
            Nous avons bien reçu votre message. Nous vous contacterons dans les plus brefs délais.
          </p>
          <p className="text-sm text-neutral-500 font-light">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              analyticsService.logButtonClick('Back button');
              navigate(-1);
            }}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-light">Retour</span>
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light tracking-wide text-white mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-neutral-300 font-light">
              Nous sommes à votre écoute pour répondre à toutes vos questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-neutral-900 p-8 shadow-sm border border-neutral-800">
              <h2 className="text-2xl font-light text-white mb-6">Nos coordonnées</h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin size={24} className="text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-white mb-1">Adresse</h3>
                    <p className="text-neutral-300 font-light">10 voie de la Peyre 24240 Sigoulès</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone size={24} className="text-white flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium text-white mb-1">Téléphone</h3>
                    <p className="text-neutral-300 font-light">06 31 05 04 85</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-700">
                <h3 className="font-medium text-white mb-4">Horaires d'ouverture</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300 font-light">Lundi - Vendredi</span>
                    <span className="text-white">8h-12h 13h-18h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300 font-light">Samedi - Dimanche</span>
                    <span className="text-white">Fermé</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 shadow-sm border border-neutral-800">
              <h2 className="text-2xl font-light text-white mb-6">Envoyez-nous un message</h2>

              <form onSubmit={handleSubmit} className="space-y-6" style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-light text-white mb-2">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white focus:border-white focus:outline-none transition-colors font-light"
                      placeholder="Jean"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-light text-white mb-2">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white focus:border-white focus:outline-none transition-colors font-light"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-light text-white mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white focus:border-white focus:outline-none transition-colors font-light"
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-light text-white mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white focus:border-white focus:outline-none transition-colors font-light"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-light text-white mb-2">
                    Sujet
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white focus:border-white focus:outline-none transition-colors font-light"
                    placeholder="Demande d'information"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-light text-white mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white focus:border-white focus:outline-none transition-colors font-light resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid() || submitting}
                  className="w-full bg-white text-black py-4 px-8 hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all duration-300 font-light tracking-wide text-lg"
                >
                  {submitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>

                <p className="text-sm text-neutral-400 font-light text-center">
                  Nous vous répondrons dans les meilleurs délais.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
