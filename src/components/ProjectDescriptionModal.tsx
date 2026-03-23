import { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { analyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger.utils';

interface ProjectDescriptionModalProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

export function ProjectDescriptionModal({ projectId, projectTitle, onClose }: ProjectDescriptionModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Veuillez entrer votre prénom');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Veuillez entrer votre nom');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Veuillez décrire votre projet');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    analyticsService.logProjectDescriptionRequest(projectId, projectTitle);

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('project_description_requests')
        .insert({
          project_id: projectId,
          customer_first_name: formData.firstName,
          customer_last_name: formData.lastName,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          project_description: formData.description,
          status: 'pending'
        });

      if (submitError) throw submitError;

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      logger.error('Error submitting form', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-white mb-2">Demande envoyée !</h3>
            <p className="text-neutral-400 font-light">
              Nous vous contacterons sous peu pour discuter de votre projet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-light text-white">Décrivez votre projet</h2>
          <button
            onClick={() => {
              analyticsService.logButtonClick('Close project description modal');
              onClose();
            }}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-neutral-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <p className="text-neutral-300 font-light">
            Vous êtes intéressé par <span className="text-white font-normal">"{projectTitle}"</span>.
            Parlez-nous de votre projet et nous vous contacterons rapidement.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm font-light">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-light text-neutral-300 mb-2">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-light focus:outline-none focus:border-neutral-500 transition-colors"
                placeholder="Votre prénom"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-light text-neutral-300 mb-2">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-light focus:outline-none focus:border-neutral-500 transition-colors"
                placeholder="Votre nom"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-light text-neutral-300 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-light focus:outline-none focus:border-neutral-500 transition-colors"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-light text-neutral-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-light focus:outline-none focus:border-neutral-500 transition-colors"
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-light text-neutral-300 mb-2">
              Description de votre projet <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white font-light focus:outline-none focus:border-neutral-500 transition-colors resize-none"
              placeholder="Décrivez votre projet en détail : dimensions, matériaux souhaités, style, délais, etc."
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => {
                analyticsService.logButtonClick('Cancel project description');
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-light rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-white hover:bg-neutral-100 text-black font-light rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
