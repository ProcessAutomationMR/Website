import { useState, useEffect } from 'react';
import { SelectedProject } from '../types/quote.types';

export function useSelectedProjects() {
  const [selectedProjects, setSelectedProjects] = useState<SelectedProject[]>(() => {
    const saved = localStorage.getItem('quoteSelectedProjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('quoteSelectedProjects', JSON.stringify(selectedProjects));
  }, [selectedProjects]);

  useEffect(() => {
    const handleSelectedProjectsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSelectedProjects(customEvent.detail);
    };

    window.addEventListener('selectedProjectsUpdated', handleSelectedProjectsUpdated);
    return () => window.removeEventListener('selectedProjectsUpdated', handleSelectedProjectsUpdated);
  }, []);

  const addSelectedProject = (project: SelectedProject) => {
    setSelectedProjects(prev => [...prev, project]);
  };

  const removeSelectedProject = (index: number) => {
    setSelectedProjects(prev => prev.filter((_, i) => i !== index));
  };

  const updateSelectedProject = (index: number, project: SelectedProject) => {
    setSelectedProjects(prev => prev.map((p, i) => (i === index ? project : p)));
  };

  return {
    selectedProjects,
    addSelectedProject,
    removeSelectedProject,
    updateSelectedProject,
  };
}
