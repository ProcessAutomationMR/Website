import { Category, Subcategory, SelectedProject, Project } from '../../types/quote.types';
import { CategorySubcategorySelector } from '../CategorySubcategorySelector';
import { ProjectGrid } from './ProjectGrid';

interface NoProjectsSectionProps {
  categories: Category[];
  selectedCategory: Category | null;
  subcategories: Subcategory[];
  selectedSubcategory: Subcategory | null;
  projects: Project[];
  projectImages: Record<string, string>;
  selectedProjects: SelectedProject[];
  loadingProjects: boolean;
  onCategorySelect: (category: Category | null) => void;
  onSubcategorySelect: (subcategory: Subcategory | null) => void;
  onProjectClick: (project: Project) => void;
}

export function NoProjectsSection({
  categories,
  selectedCategory,
  subcategories,
  selectedSubcategory,
  projects,
  projectImages,
  selectedProjects,
  loadingProjects,
  onCategorySelect,
  onSubcategorySelect,
  onProjectClick
}: NoProjectsSectionProps) {
  return (
    <>
      <h2 className="text-2xl font-light text-brown-950 mb-8 tracking-wide">Ajouter un ouvrage sur mesure</h2>

      <div className="-mx-6 mb-12">
        <CategorySubcategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          subcategories={subcategories}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
        />
      </div>

      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-brown-950 tracking-wide">Projets</h2>
        </div>
        <ProjectGrid
          projects={projects}
          projectImages={projectImages}
          selectedProjects={selectedProjects}
          loading={loadingProjects}
          onProjectClick={onProjectClick}
        />
      </div>
    </>
  );
}
