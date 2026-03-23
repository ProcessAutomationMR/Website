import { useState, useEffect } from 'react';
import { Project, Category, Subcategory } from '../types/quote.types';
import {
  fetchSubcategories,
  fetchProjects,
  fetchProjectImages,
  fetchWoodTypesAndFinishes,
  fetchAllProjects,
  fetchAllSubcategories
} from '../services/project.service';

export function useProjects(
  selectedCategory: Category | null,
  selectedSubcategory: Subcategory | null,
  hasStarted: boolean
) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<Record<string, string>>({});
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (!selectedCategory && !hasStarted) return;

    const loadProjects = async () => {
      setLoadingProjects(true);

      let projectsData: Project[];
      if (!selectedCategory) {
        projectsData = await fetchAllProjects(selectedSubcategory?.id);
      } else {
        projectsData = await fetchProjects(
          selectedCategory.id,
          selectedSubcategory?.id
        );
      }

      setProjects(projectsData);

      const imagesData = await fetchProjectImages(projectsData);
      setProjectImages(prev => ({ ...prev, ...imagesData }));

      setLoadingProjects(false);
    };

    loadProjects();
  }, [selectedCategory, selectedSubcategory, hasStarted]);

  return { projects, projectImages, loadingProjects, setProjectImages };
}

export function useSubcategories(selectedCategory: Category | null, hasStarted: boolean) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    if (!selectedCategory && !hasStarted) {
      setSubcategories([]);
      return;
    }

    const loadSubcategories = async () => {
      let data: Subcategory[];
      if (!selectedCategory) {
        data = await fetchAllSubcategories();
      } else {
        data = await fetchSubcategories(selectedCategory.id);
      }
      setSubcategories(data);
    };

    loadSubcategories();
  }, [selectedCategory, hasStarted]);

  return subcategories;
}

export function useWoodTypesAndFinishes() {
  const [woodTypes, setWoodTypes] = useState<string[]>([]);
  const [finishOptions, setFinishOptions] = useState<string[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const { woodTypes: wt, finishOptions: fo } = await fetchWoodTypesAndFinishes();
      setWoodTypes(wt);
      setFinishOptions(fo);
    };

    loadOptions();
  }, []);

  return { woodTypes, finishOptions };
}
