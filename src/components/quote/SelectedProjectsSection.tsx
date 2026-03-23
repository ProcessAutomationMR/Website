import { Category, Subcategory, SelectedProject, Project } from '../../types/quote.types';
import { SelectedProjectCard } from './SelectedProjectCard';
import { CategorySubcategorySelector } from '../CategorySubcategorySelector';
import { ProjectGrid } from './ProjectGrid';
import { CustomerForm } from './CustomerForm';
import { SubmitButton } from './SubmitButton';
import { CustomerInfo } from '../../types/quote.types';

interface SelectedProjectsSectionProps {
  selectedProjects: SelectedProject[];
  projectImages: Record<string, string>;
  categories: Category[];
  selectedCategory: Category | null;
  subcategories: Subcategory[];
  selectedSubcategory: Subcategory | null;
  projects: Project[];
  loadingProjects: boolean;
  customerInfo: CustomerInfo;
  honeypot: string;
  isFormValid: boolean;
  isSubmitting: boolean;
  onEditProject: (index: number) => void;
  onRemoveProject: (index: number) => void;
  onCategorySelect: (category: Category | null) => void;
  onSubcategorySelect: (subcategory: Subcategory | null) => void;
  onProjectClick: (project: Project) => void;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onHoneypotChange: (value: string) => void;
  onSubmit: () => void;
}

export function SelectedProjectsSection({
  selectedProjects,
  projectImages,
  categories,
  selectedCategory,
  subcategories,
  selectedSubcategory,
  projects,
  loadingProjects,
  customerInfo,
  honeypot,
  isFormValid,
  isSubmitting,
  onEditProject,
  onRemoveProject,
  onCategorySelect,
  onSubcategorySelect,
  onProjectClick,
  onCustomerInfoChange,
  onHoneypotChange,
  onSubmit
}: SelectedProjectsSectionProps) {
  return (
    <>
      <div className="mb-16">
        <h2 className="text-2xl font-light text-brown-950 mb-8 tracking-wide">Projets sélectionnés</h2>
        <div className="space-y-6">
          {selectedProjects.map((sp, index) => (
            <SelectedProjectCard
              key={`${sp.project.id}-${index}`}
              selectedProject={sp}
              projectImage={projectImages[sp.project.id]}
              index={index}
              onEdit={onEditProject}
              onRemove={onRemoveProject}
            />
          ))}
        </div>
      </div>

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
        <ProjectGrid
          projects={projects}
          projectImages={projectImages}
          selectedProjects={selectedProjects}
          loading={loadingProjects}
          onProjectClick={onProjectClick}
        />
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-light text-brown-950 mb-8 tracking-wide">Vos coordonnées</h2>
        <CustomerForm
          customerInfo={customerInfo}
          onChange={onCustomerInfoChange}
          honeypot={honeypot}
          onHoneypotChange={onHoneypotChange}
        />
      </div>

      <SubmitButton isValid={isFormValid} isSubmitting={isSubmitting} onClick={onSubmit} />
    </>
  );
}
