import { Check } from 'lucide-react';
import { Project, SelectedProject } from '../../types/quote.types';
import { getStorageUrl } from '../../utils/storage.utils';

interface ProjectGridProps {
  projects: Project[];
  projectImages: Record<string, string>;
  selectedProjects: SelectedProject[];
  loading: boolean;
  onProjectClick: (project: Project) => void;
}

export function ProjectGrid({
  projects,
  projectImages,
  selectedProjects,
  loading,
  onProjectClick
}: ProjectGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-brown-950 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20 bg-white shadow-sm">
        <p className="text-neutral-600 font-light text-lg">
          Aucun projet disponible dans cette catégorie
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
      {projects.map((project) => {
        const isSelected = selectedProjects.some(sp => sp.project.id === project.id);
        return (
          <div
            key={project.id}
            onClick={() => onProjectClick(project)}
            className={`group cursor-pointer bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 relative rounded-lg ${
              isSelected ? 'ring-4 ring-brown-950' : ''
            }`}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 z-10 w-10 h-10 bg-brown-950 rounded-full flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}
            {projectImages[project.id] && (
              <div className="relative aspect-[1000/1618] overflow-hidden bg-neutral-100 rounded-t-lg">
                <img
                  src={getStorageUrl(projectImages[project.id])}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            )}
            <div className="p-6 min-h-[180px]">
              <h3 className="text-lg font-light tracking-wide text-brown-950 mb-2">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-neutral-600 font-light text-sm line-clamp-4 min-h-[5rem]">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
