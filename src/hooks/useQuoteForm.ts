import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectConfigForm, CustomerInfo, SelectedProject } from '../types/quote.types';
import { analyticsService } from '../services/analytics.service';
import { parseNumber, normalizePhone } from '../utils/validation.utils';
import { getCSRFToken, clearCSRFToken } from '../utils/csrf.utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useQuoteForm(
  selectedProjects: SelectedProject[],
  addSelectedProject: (project: SelectedProject) => void,
  updateSelectedProject: (index: number, project: SelectedProject) => void,
  removeSelectedProject: (index: number) => void,
  setProjectImages: (update: (prev: Record<string, string>) => Record<string, string>) => void
) {
  const navigate = useNavigate();
  const [configuringProject, setConfiguringProject] = useState<Project | null>(null);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [configForm, setConfigForm] = useState<ProjectConfigForm>({
    dimensions: [{ width: '', height: '', depth: '' }],
    woodType: '',
    finish: '',
    poseSurSite: false,
    additionalNotes: ''
  });

  const [csrfToken] = useState(() => getCSRFToken());

  const [customerForm, setCustomerForm] = useState<CustomerInfo>(() => {
    const saved = sessionStorage.getItem('userContactInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || '',
          email: parsed.email || '',
          phone: parsed.phone || ''
        };
      } catch {
        return { firstName: '', lastName: '', email: '', phone: '' };
      }
    }
    return { firstName: '', lastName: '', email: '', phone: '' };
  });

  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      if (selectedProjects.length > 0) {
        sessionStorage.setItem('userContactInfo', JSON.stringify(customerForm));
      }
    };
  }, [selectedProjects, customerForm]);

  const handleProjectClick = (project: Project) => {
    if (selectedProjects.some(sp => sp.project.id === project.id)) {
      analyticsService.logButtonClick('Deselect project from quote', { project_title: project.title });
      const index = selectedProjects.findIndex(sp => sp.project.id === project.id);
      removeSelectedProject(index);
    } else {
      analyticsService.logButtonClick('Select project for quote', { project_title: project.title });
      setConfiguringProject(project);
      setEditingProjectIndex(null);
      setConfigForm({
        dimensions: [{ width: '', height: '', depth: '' }],
        woodType: '',
        finish: '',
        poseSurSite: false,
        additionalNotes: ''
      });
    }
  };

  const handleSaveConfiguration = () => {
    if (!configuringProject) return;

    analyticsService.logButtonClick('Save project configuration', { project_title: configuringProject.title });

    const newSelectedProject: SelectedProject = {
      project: configuringProject,
      dimensions: configForm.dimensions,
      woodType: configForm.woodType,
      finish: configForm.finish,
      poseSurSite: configForm.poseSurSite,
      additionalNotes: configForm.additionalNotes
    };

    if (editingProjectIndex !== null) {
      updateSelectedProject(editingProjectIndex, newSelectedProject);
    } else {
      addSelectedProject(newSelectedProject);
    }

    setConfiguringProject(null);
    setEditingProjectIndex(null);
  };

  const editSelectedProject = (index: number) => {
    const sp = selectedProjects[index];
    analyticsService.logButtonClick('Edit selected project', { project_title: sp.project.title });
    setConfiguringProject(sp.project);
    setEditingProjectIndex(index);
    setConfigForm({
      dimensions: sp.dimensions,
      woodType: sp.woodType,
      finish: sp.finish,
      poseSurSite: sp.poseSurSite,
      additionalNotes: sp.additionalNotes
    });
  };

  const isFormValid = () => {
    return (
      customerForm.firstName.trim() !== '' &&
      customerForm.lastName.trim() !== '' &&
      customerForm.email.trim() !== '' &&
      selectedProjects.length > 0
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    if (honeypot) return;

    analyticsService.logQuoteRequest(
      selectedProjects.map(sp => sp.project.id)
    );

    setSubmitting(true);

    const normalizedPhone = customerForm.phone ? normalizePhone(customerForm.phone) : null;

    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/submit-quote`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          contact: {
            first_name: customerForm.firstName,
            last_name: customerForm.lastName,
            email: customerForm.email,
            phone: normalizedPhone || null,
          },
          projects: selectedProjects.map(sp => ({
            project_id: sp.project.id,
            wood_type: sp.woodType || null,
            finish: sp.finish || null,
            pose_sur_site: sp.poseSurSite,
            additional_notes: sp.additionalNotes || null,
            dimensions: {
              items: sp.dimensions.map(d => ({
                width: parseNumber(d.width) ?? null,
                height: parseNumber(d.height) ?? null,
                depth: parseNumber(d.depth) ?? null,
              }))
            }
          }))
        }),
      });

      if (response.status === 429) {
        setSubmitting(false);
        alert('Trop de demandes. Veuillez patienter quelques minutes avant de réessayer.');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSubmitting(false);
      setSubmitted(true);
      localStorage.removeItem('quoteSelectedProjects');
      sessionStorage.removeItem('userContactInfo');
      clearCSRFToken();

      window.dispatchEvent(new CustomEvent('selectedProjectsUpdated', { detail: [] }));

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch {
      setSubmitting(false);
      alert("Erreur lors de l'envoi de la demande. Veuillez réessayer.");
    }
  };

  const cancelConfiguration = () => {
    analyticsService.logButtonClick('Cancel project configuration');
    setConfiguringProject(null);
    setEditingProjectIndex(null);
  };

  return {
    configuringProject,
    editingProjectIndex,
    configForm,
    customerForm,
    honeypot,
    setHoneypot,
    submitting,
    submitted,
    setConfigForm,
    setCustomerForm,
    handleProjectClick,
    handleSaveConfiguration,
    editSelectedProject,
    isFormValid,
    handleSubmit,
    cancelConfiguration
  };
}
