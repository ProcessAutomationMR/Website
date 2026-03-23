import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CategorySubcategorySelector } from '../components/CategorySubcategorySelector';
import { analyticsService } from '../services/analytics.service';
import { incrementProjectRanking } from '../services/project.service';
import { stripHtmlTags } from '../utils/html.utils';
import { logger } from '../utils/logger.utils';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function getStorageUrl(path: string) {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${supabaseUrl}/storage/v1/object/public/Photos/${encodedPath}`;
}

function truncateTitle(title: string): string {
  if (title.length > 50 && title.includes('-')) {
    return title.split('-')[0].trim();
  }
  return title;
}

interface Project {
  id: string;
  title: string;
  titre_court?: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  subcategory?: string;
  image_url: string;
  style?: string;
  room_type?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  subcategory: string;
  category_id: string;
}

interface SubcategoryGroup {
  id: string;
  name: string;
  projects: Project[];
}

const categories: Category[] = [
  { id: 'a8863264-327f-414d-86ed-586bca12fdc3', name: 'Menuiserie', slug: 'menuiserie' },
  { id: '51560d32-76d2-4215-94ac-e8da1f919f0b', name: 'Agencement', slug: 'agencement' },
  { id: '8d91be24-826b-4c9b-a2a3-46a90117d0ad', name: 'Agencement de magasins', slug: 'agencement-magasins' },
  { id: '9eb82e1c-d5af-4ab6-be98-f609aed51242', name: 'Laquage', slug: 'laquage' }
];

export function AllProjectsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [subcategoryGroups, setSubcategoryGroups] = useState<SubcategoryGroup[]>([]);
  const [projectImages, setProjectImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasViewedAllImages, setHasViewedAllImages] = useState(false);

  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategoryId(category.id);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchSubcategories();
    } else {
      setSubcategories([]);
      setSelectedSubcategory(null);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchProjects();
  }, [selectedCategoryId, selectedSubcategory]);

  const fetchSubcategories = async () => {
    if (!selectedCategoryId) return;

    const { data: allSubcategories, error: subcategoryError } = await supabase
      .from('subcategory')
      .select('*')
      .eq('category_id', selectedCategoryId)
      .order('sort_order', { ascending: true })
      .order('subcategory', { ascending: true });

    if (subcategoryError || !allSubcategories) return;

    const { data: projectSubcategories, error: projectError } = await supabase
      .from('projects')
      .select('subcategory_id')
      .eq('category_id', selectedCategoryId)
      .not('subcategory_id', 'is', null);

    if (projectError || !projectSubcategories) return;

    const usedSubcategoryIds = new Set(projectSubcategories.map(p => p.subcategory_id));
    const availableSubcategories = allSubcategories.filter(sub => usedSubcategoryIds.has(sub.id));

    setSubcategories(availableSubcategories);
  };

  const fetchProjects = async () => {
    setLoading(true);

    let query = supabase.from('projects').select('*');

    if (selectedCategoryId) {
      query = query.eq('category_id', selectedCategoryId);
    }

    if (selectedSubcategory) {
      query = query.eq('subcategory_id', selectedSubcategory.id);
    }

    query = query.order('ranking', { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setProjects(data);
      organizeBySubcategories(data);
      fetchProjectImages(data);

      const categoryName = categories.find(c => c.id === selectedCategoryId)?.name;
      if (selectedSubcategory) {
        analyticsService.logPageView(`All Projects - ${categoryName} / ${selectedSubcategory.subcategory}`);
        analyticsService.logCategoryView(categoryName || 'All projects', selectedSubcategory.subcategory);
      } else if (categoryName) {
        analyticsService.logPageView(`All Projects - ${categoryName}`);
        analyticsService.logCategoryView(categoryName);
      } else {
        analyticsService.logPageView('All Projects');
      }
    }

    setLoading(false);
  };

  const organizeBySubcategories = (projects: Project[]) => {
    const subcategoryMap = new Map<string, SubcategoryGroup>();

    projects.forEach(project => {
      const subcategoryId = project.subcategory_id || 'no-subcategory';
      const subcategoryName = project.subcategory || 'Autres projets';

      if (!subcategoryMap.has(subcategoryId)) {
        subcategoryMap.set(subcategoryId, {
          id: subcategoryId,
          name: subcategoryName,
          projects: []
        });
      }

      subcategoryMap.get(subcategoryId)!.projects.push(project);
    });

    setSubcategoryGroups(Array.from(subcategoryMap.values()));
  };

  const fetchProjectImages = async (projects: Project[]) => {
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
          setProjectImages(prev => ({ ...prev, [project.id]: `${project.image_url}/${imageFiles[0].name}` }));
        }
      }
    }
  };

  const fetchSlideshowImages = async (project: Project) => {
    const folderPath = project.image_url;
    const { data: files, error } = await supabase.storage
      .from('Photos')
      .list(folderPath);

    if (error || !files) {
      logger.error('Error fetching project images', error);
      return [];
    }

    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
      .sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
        return numA - numB;
      })
      .map(file => `${folderPath}/${file.name}`);

    return imageFiles;
  };

  const handleProjectClick = async (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setHasViewedAllImages(false);
    const images = await fetchSlideshowImages(project);
    setSlideshowImages(images);
    analyticsService.logProjectView(project.id, project.title);
    await incrementProjectRanking(project.id);
  };

  const closeSlideshow = () => {
    if (selectedProject) {
      navigate(`/product/${selectedProject.id}`);
    }
  };

  const nextImage = () => {
    if (currentImageIndex === slideshowImages.length - 1) {
      if (selectedProject) {
        navigate(`/product/${selectedProject.id}`);
      }
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  useEffect(() => {
    if (selectedProject && slideshowImages.length > 1 && !hasViewedAllImages) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % slideshowImages.length;
          if (nextIndex === 0 && prev === slideshowImages.length - 1) {
            setHasViewedAllImages(true);
          }
          return nextIndex;
        });
      }, 3000);

      return () => {
        if (slideshowIntervalRef.current) {
          clearInterval(slideshowIntervalRef.current);
        }
      };
    }
  }, [selectedProject, slideshowImages, hasViewedAllImages]);

  useEffect(() => {
    if (hasViewedAllImages && selectedProject) {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }

      setTimeout(() => {
        navigate(`/product/${selectedProject.id}`);
        setSelectedProject(null);
      }, 500);
    }
  }, [hasViewedAllImages, selectedProject, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;

      if (e.key === 'Escape') {
        closeSlideshow();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (selectedProject) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject, slideshowImages]);

  const selectedCategory = selectedCategoryId
    ? categories.find(c => c.id === selectedCategoryId)
    : null;

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white pt-44 pb-24 border-b border-neutral-800">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-light mb-4 tracking-wide">Nos Créations</h1>
          <p className="text-xl text-neutral-300 font-light max-w-2xl">
            Découvrez nos créations d'exception, témoignages de notre savoir-faire artisanal
          </p>
        </div>
      </div>

      <CategorySubcategorySelector
        categories={categories}
        selectedCategory={selectedCategory}
        subcategories={subcategories}
        selectedSubcategory={selectedSubcategory}
        onCategorySelect={(category) => {
          setSelectedCategoryId(category?.id || null);
          setSelectedSubcategory(null);
        }}
        onSubcategorySelect={setSelectedSubcategory}
      />

      <div className="container mx-auto px-6 py-12">

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : selectedSubcategory === null ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="group bg-black rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
              >
                {projectImages[project.id] && (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                    <img
                      src={getStorageUrl(projectImages[project.id])}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                )}
                <div className="px-6 py-4">
                  <h3 className="text-lg font-light tracking-widest uppercase text-[#D4AF37] text-center">
                    {project.titre_court || project.title}
                  </h3>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full text-center py-24">
                <p className="text-xl text-neutral-400 font-light">
                  Aucun projet trouvé dans cette catégorie
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {subcategoryGroups.map((group) => (
              <div key={group.id}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {group.projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className="group bg-black rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                    >
                      {projectImages[project.id] && (
                        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                          <img
                            src={getStorageUrl(projectImages[project.id])}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="px-6 py-4">
                        <h3 className="text-lg font-light tracking-widest uppercase text-[#D4AF37] text-center">
                          {project.titre_court || project.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {subcategoryGroups.length === 0 && (
              <div className="text-center py-24">
                <p className="text-xl text-neutral-400 font-light">
                  Aucun projet trouvé dans cette catégorie
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeSlideshow}
            className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors rounded-full"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {slideshowImages.length > 0 && (
                <>
                  <img
                    key={currentImageIndex}
                    src={getStorageUrl(slideshowImages[currentImageIndex])}
                    alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain animate-fade-in"
                    style={{
                      animation: 'fadeIn 0.5s ease-in-out'
                    }}
                  />

                  {slideshowImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all rounded-full group"
                      >
                        <ChevronLeft className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all rounded-full group"
                      >
                        <ChevronRight className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
