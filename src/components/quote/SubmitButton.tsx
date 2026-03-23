import { Send, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubmitButtonProps {
  isValid: boolean;
  isSubmitting: boolean;
  onClick: () => void;
}

export function SubmitButton({ isValid, isSubmitting, onClick }: SubmitButtonProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center gap-4">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-3 px-10 py-4 text-lg font-light tracking-wide transition-all duration-300 bg-white text-brown-950 border-2 border-brown-950 hover:bg-brown-50 shadow-lg hover:shadow-2xl hover:scale-105"
      >
        <Plus className="w-5 h-5" />
        Ajouter un ouvrage
      </button>
      <button
        onClick={onClick}
        disabled={!isValid || isSubmitting}
        className={`flex items-center gap-3 px-10 py-4 text-lg font-light tracking-wide transition-all duration-300 ${
          isValid && !isSubmitting
            ? 'bg-brown-950 text-white hover:bg-brown-900 shadow-lg hover:shadow-2xl hover:scale-105'
            : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Envoyer la demande
          </>
        )}
      </button>
    </div>
  );
}
