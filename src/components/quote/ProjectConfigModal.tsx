import { X, Plus, Trash2 } from 'lucide-react';
import { Project, ProjectConfigForm } from '../../types/quote.types';
import { CustomSelect } from '../CustomSelect';
import { getStorageUrl } from '../../utils/storage.utils';

interface ProjectConfigModalProps {
  project: Project;
  configForm: ProjectConfigForm;
  woodTypes: string[];
  finishOptions: string[];
  isEditing: boolean;
  projectImage?: string;
  onConfigChange: (config: ProjectConfigForm) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectConfigModal({
  project,
  configForm,
  woodTypes,
  finishOptions,
  isEditing,
  projectImage,
  onConfigChange,
  onSave,
  onCancel
}: ProjectConfigModalProps) {
  const addDimension = () => {
    onConfigChange({
      ...configForm,
      dimensions: [...configForm.dimensions, { width: '', height: '', depth: '' }]
    });
  };

  const removeDimension = (index: number) => {
    if (configForm.dimensions.length > 1) {
      onConfigChange({
        ...configForm,
        dimensions: configForm.dimensions.filter((_, i) => i !== index)
      });
    }
  };

  const updateDimension = (index: number, field: 'width' | 'height' | 'depth', value: string) => {
    const newDimensions = [...configForm.dimensions];
    newDimensions[index] = { ...newDimensions[index], [field]: value };
    onConfigChange({ ...configForm, dimensions: newDimensions });
  };

  const isFormValid = () => {
    if (!configForm.woodType) return false;
    return configForm.dimensions.every(dim => dim.width && dim.height && dim.depth);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex">
        {projectImage && (
          <div className="hidden md:block w-2/5 bg-neutral-900 relative">
            <img
              src={getStorageUrl(projectImage)}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-neutral-900 text-white p-6 flex items-center justify-between">
            <h3 className="text-2xl font-light tracking-wide">
              {isEditing ? 'Modifier le projet' : 'Configuration du projet'}
            </h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-xl font-light text-brown-950 mb-2">{project.title}</h4>
                {project.description && (
                  <p className="text-neutral-600 font-light">{project.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Dimensions souhaitées (cm) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  {configForm.dimensions.map((dim, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-600 mb-1">Largeur <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            placeholder="100"
                            value={dim.width}
                            onChange={(e) => updateDimension(index, 'width', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-600 mb-1">Hauteur <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            placeholder="200"
                            value={dim.height}
                            onChange={(e) => updateDimension(index, 'height', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-600 mb-1">Profondeur <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            placeholder="50"
                            value={dim.depth}
                            onChange={(e) => updateDimension(index, 'depth', e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none"
                          />
                        </div>
                      </div>
                      {configForm.dimensions.length > 1 && (
                        <button
                          onClick={() => removeDimension(index)}
                          className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addDimension}
                    className="flex items-center gap-2 text-brown-950 hover:text-brown-800 font-medium text-sm bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    <Plus size={18} />
                    Ajouter un article
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="woodType" className="block text-sm font-medium text-neutral-700 mb-2">
                    Type de bois <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id="woodType"
                    name="woodType"
                    value={configForm.woodType}
                    onChange={(value) => onConfigChange({ ...configForm, woodType: value })}
                    options={[
                      { value: '', label: 'Sélectionnez un type de bois' },
                      ...woodTypes.map(wood => ({ value: wood, label: wood }))
                    ]}
                    placeholder="Sélectionnez un type de bois"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="finish" className="block text-sm font-medium text-neutral-700 mb-2">
                    Finition
                  </label>
                  <CustomSelect
                    id="finish"
                    name="finish"
                    value={configForm.finish}
                    onChange={(value) => onConfigChange({ ...configForm, finish: value })}
                    options={[
                      { value: '', label: 'Sélectionnez une finition' },
                      ...finishOptions.map(finish => ({ value: finish, label: finish }))
                    ]}
                    placeholder="Sélectionnez une finition"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.poseSurSite}
                    onChange={(e) => onConfigChange({ ...configForm, poseSurSite: e.target.checked })}
                    className="w-5 h-5 text-brown-950 border-neutral-300 rounded focus:ring-brown-950"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Pose sur site
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Informations complémentaires
                </label>
                <textarea
                  value={configForm.additionalNotes}
                  onChange={(e) => onConfigChange({ ...configForm, additionalNotes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 focus:border-brown-950 focus:ring-1 focus:ring-brown-950 outline-none resize-none"
                  placeholder="Décrivez vos besoins spécifiques, contraintes, ou toute autre information utile..."
                />
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 border-t border-neutral-200 p-6 flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-neutral-700 hover:bg-neutral-200 transition-colors rounded"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              disabled={!isFormValid()}
              className={`px-8 py-3 rounded font-medium transition-all ${
                isFormValid()
                  ? 'bg-brown-950 text-white hover:bg-brown-900'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter au devis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
