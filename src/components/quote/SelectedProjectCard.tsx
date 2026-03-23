import { Edit, Trash2 } from 'lucide-react';
import { SelectedProject } from '../../types/quote.types';
import { getStorageUrl } from '../../utils/storage.utils';

interface SelectedProjectCardProps {
  selectedProject: SelectedProject;
  projectImage?: string;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export function SelectedProjectCard({
  selectedProject: sp,
  projectImage,
  index,
  onEdit,
  onRemove
}: SelectedProjectCardProps) {
  return (
    <div className="bg-white shadow-md overflow-hidden h-full rounded-lg">
      <div className="grid md:grid-cols-[240px_1fr] gap-0 h-full min-h-[300px]">
        <div className="relative bg-neutral-100 h-full overflow-hidden">
          {projectImage && (
            <img
              src={getStorageUrl(projectImage)}
              alt={sp.project.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-xl font-light text-brown-950">
              {sp.project.title}
            </h3>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onEdit(index)}
                className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-lg"
                title="Modifier"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onRemove(index)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors rounded-lg"
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm flex-grow">
            <div>
              <span className="text-neutral-500">Type de bois:</span>{' '}
              <span className="text-brown-950 font-medium">{sp.woodType}</span>
              {sp.finish && (
                <>
                  {' • '}
                  <span className="text-neutral-500">Finition:</span>{' '}
                  <span className="text-brown-950 font-medium">{sp.finish}</span>
                </>
              )}
            </div>

            <div>
              <span className="text-neutral-500">
                Dimensions{sp.dimensions.length > 1 ? ` (${sp.dimensions.length} articles)` : ''}:
              </span>
              <div className="mt-1 space-y-1">
                {sp.dimensions.map((dim, idx) => (
                  <div key={idx} className="text-brown-950">
                    {sp.dimensions.length > 1 && (
                      <span className="font-medium">#{idx + 1} </span>
                    )}
                    {dim.width && dim.height ? (
                      <>
                        Largeur: {dim.width} cm • Hauteur: {dim.height} cm
                        {dim.depth && ` • Profondeur: ${dim.depth} cm`}
                      </>
                    ) : (
                      'À déterminer'
                    )}
                  </div>
                ))}
              </div>
            </div>

            {sp.poseSurSite ? (
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Pose sur site demandée</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">Pose sur site non demandée</span>
              </div>
            )}

            {sp.additionalNotes && (
              <div className="pt-2 border-t border-neutral-200">
                <span className="text-neutral-500">Notes:</span>{' '}
                <span className="text-neutral-700">{sp.additionalNotes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
