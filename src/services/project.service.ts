import { supabase } from '../lib/supabase';
import { Project, Category, Subcategory } from '../types/quote.types';
import { logger } from '../utils/logger.utils';

export async function fetchAllSubcategories(): Promise<Subcategory[]> {
  const { data, error } = await supabase
    .from('subcategory')
    .select('*')
    .order('subcategory', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export async function fetchSubcategories(categoryId: string): Promise<Subcategory[]> {
  if (!categoryId || typeof categoryId !== 'string') {
    return [];
  }

  const { data: allSubcategories, error: subcategoryError } = await supabase
    .from('subcategory')
    .select('*')
    .eq('category_id', categoryId)
    .order('subcategory', { ascending: true });

  if (subcategoryError || !allSubcategories) {
    return [];
  }

  const { data: projectSubcategories, error: projectError } = await supabase
    .from('projects')
    .select('subcategory_id')
    .eq('category_id', categoryId)
    .not('subcategory_id', 'is', null);

  if (projectError || !projectSubcategories) {
    return allSubcategories;
  }

  const usedSubcategoryIds = new Set(projectSubcategories.map(p => p.subcategory_id));
  const availableSubcategories = allSubcategories.filter(sub => usedSubcategoryIds.has(sub.id));

  return availableSubcategories;
}

export async function fetchAllProjects(subcategoryId?: string): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*');

  if (subcategoryId && typeof subcategoryId === 'string') {
    query = query.eq('subcategory_id', subcategoryId);
  }

  query = query.order('ranking', { ascending: false });

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

export async function fetchProjects(
  categoryId: string,
  subcategoryId?: string
): Promise<Project[]> {
  if (!categoryId || typeof categoryId !== 'string') {
    return [];
  }

  let query = supabase
    .from('projects')
    .select('*')
    .eq('category_id', categoryId);

  if (subcategoryId && typeof subcategoryId === 'string') {
    query = query.eq('subcategory_id', subcategoryId);
  }

  query = query.order('ranking', { ascending: false });

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

export async function fetchProjectImages(
  projects: Project[]
): Promise<Record<string, string>> {
  const imageMap: Record<string, string> = {};

  for (const project of projects) {
    const { data: files } = await supabase.storage
      .from('Photos')
      .list(project.image_url);

    if (files && files.length > 0) {
      const imageFiles = files
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return numA - numB;
        });

      if (imageFiles.length > 0) {
        imageMap[project.id] = `${project.image_url}/${imageFiles[0].name}`;
      }
    }
  }

  return imageMap;
}

export async function fetchWoodTypesAndFinishes(): Promise<{
  woodTypes: string[];
  finishOptions: string[];
}> {
  const { data: projects } = await supabase.from('projects').select('materiaux_vente, finition_vente');

  if (!projects) {
    return { woodTypes: [], finishOptions: [] };
  }

  const woodTypesSet = new Set<string>();
  const finishOptionsSet = new Set<string>();

  projects.forEach(project => {
    if (project.materiaux_vente && Array.isArray(project.materiaux_vente)) {
      project.materiaux_vente.forEach((m: string) => woodTypesSet.add(m));
    }
    if (project.finition_vente && Array.isArray(project.finition_vente)) {
      project.finition_vente.forEach((f: string) => finishOptionsSet.add(f));
    }
  });

  return {
    woodTypes: Array.from(woodTypesSet),
    finishOptions: Array.from(finishOptionsSet)
  };
}

export async function incrementProjectRanking(projectId: string): Promise<void> {
  if (!projectId || typeof projectId !== 'string') {
    logger.error('Invalid project ID');
    return;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(projectId)) {
    logger.error('Invalid UUID format');
    return;
  }

  const { error } = await supabase.rpc('increment_project_ranking', {
    project_id: projectId
  });

  if (error) {
    logger.error('Error incrementing project ranking', error);
  }
}
