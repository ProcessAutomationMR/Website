export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Subcategory {
  id: string;
  subcategory: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category_id: string;
  image_url: string;
  style?: string;
  room_type?: string;
  materiaux_vente?: string[];
  finition_vente?: string[];
}

export interface DimensionItem {
  width: string;
  height: string;
  depth: string;
}

export interface SelectedProject {
  project: Project;
  dimensions: DimensionItem[];
  woodType: string;
  finish: string;
  poseSurSite: boolean;
  additionalNotes: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ProjectConfigForm {
  dimensions: DimensionItem[];
  woodType: string;
  finish: string;
  poseSurSite: boolean;
  additionalNotes: string;
}
