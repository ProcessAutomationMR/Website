import { Home, DoorOpen, Armchair, Palette } from 'lucide-react';
import { Category } from '../../types/quote.types';

interface EmptyStateProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'menuiserie': <DoorOpen className="w-16 h-16 text-brown-950" />,
  'agencement': <Armchair className="w-16 h-16 text-brown-950" />,
  'agencement-magasins': <Home className="w-16 h-16 text-brown-950" />,
  'laquage': <Palette className="w-16 h-16 text-brown-950" />
};

export function EmptyState({ categories, onCategorySelect }: EmptyStateProps) {
  return (
    <>
      <div className="mb-16">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <Home className="w-8 h-8 text-brown-950" />
            <div>
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
                Étape 1/2 : Menuiserie
              </h3>
              <div className="mt-2 w-full bg-neutral-200 h-1 rounded-full">
                <div className="bg-green-600 h-1 rounded-full w-1/2"></div>
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-500 italic mb-8">
            Plus que 1 étape avant de pouvoir configurer !
          </p>
        </div>

        <h2 className="text-4xl font-light text-brown-950 mb-6 tracking-wide">
          Quel type d'ouvrage souhaitez-vous configurer ?
        </h2>
        <p className="text-lg text-neutral-600 mb-12">
          Pas de panique ! Après avoir configuré votre première ouverture, vous pourrez ajouter d'autres produits à votre projet.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className="border-2 border-neutral-300 hover:border-brown-950 transition-all duration-300 p-8 text-center group"
            >
              <div className="flex justify-center mb-6">
                {CATEGORY_ICONS[category.slug]}
              </div>
              <h3 className="text-xl font-medium text-brown-950 uppercase tracking-wide mb-2 group-hover:text-brown-800">
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
