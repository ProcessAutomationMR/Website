import { Award, Flag, MapPin } from 'lucide-react';

export function FeaturesBanner() {
  return (
    <div className="bg-neutral-100 py-16 my-16 border-y border-neutral-200">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <Award className="w-16 h-16 text-brown-950" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-2 border-brown-950 rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">
                Origine France
              </div>
              <h3 className="text-lg font-medium text-brown-950 uppercase tracking-wide">
                Garantie
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <Flag className="w-16 h-16 text-brown-950" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-brown-950 uppercase tracking-wide">
                Savoir Faire
              </h3>
              <p className="text-sm font-medium text-neutral-600">
                100% Français
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-brown-950" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-brown-950 uppercase tracking-wide">
                Production
              </h3>
              <p className="text-sm font-medium text-neutral-600">
                100% Française
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
