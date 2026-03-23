import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProjectDescriptionModal } from '../components/ProjectDescriptionModal';
import { analyticsService } from '../services/analytics.service';
import { incrementProjectRanking } from '../services/project.service';
import DOMPurify from 'dompurify';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function getStorageUrl(path: string) {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${supabaseUrl}/storage/v1/object/public/Photos/${encodedPath}`;
}

interface Project {
  id: string;
  title: string;
  titre_court?: string;
  description: string;
  category_id: string;
  location?: string;
  year?: number;
  image_url: string;
  materials: string[];
  style?: string;
  room_type?: string;
  materiaux_vente?: string[];
  finition_vente?: string[];
}

interface ImageWithOrientation {
  path: string;
  isVertical: boolean;
}

export function ProductDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [sortedGalleryImages, setSortedGalleryImages] = useState<ImageWithOrientation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [previousProject, setPreviousProject] = useState<{ id: string; titre_court: string } | null>(null);
  const [nextProject, setNextProject] = useState<{ id: string; titre_court: string } | null>(null);

  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const allImagesRef = useRef<string[]>([]);
  const slideshowActiveRef = useRef(false);

  const categoryIdToSlugMap: Record<string, string> = {
    'a8863264-327f-414d-86ed-586bca12fdc3': 'menuiserie',
    '51560d32-76d2-4215-94ac-e8da1f919f0b': 'agencement',
    '8d91be24-826b-4c9b-a2a3-46a90117d0ad': 'agencement-magasins',
    '9eb82e1c-d5af-4ab6-be98-f609aed51242': 'laquage'
  };

  const categoryIdToNameMap: Record<string, string> = {
    'a8863264-327f-414d-86ed-586bca12fdc3': 'Menuiserie',
    '51560d32-76d2-4215-94ac-e8da1f919f0b': 'Agencement',
    '8d91be24-826b-4c9b-a2a3-46a90117d0ad': 'Agencement de magasins'
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
      incrementProjectRanking(projectId);

      const viewedProjectsStr = sessionStorage.getItem('viewed_projects');
      const viewedProjects = viewedProjectsStr ? JSON.parse(viewedProjectsStr) : [];

      if (!viewedProjects.includes(projectId)) {
        viewedProjects.push(projectId);
        sessionStorage.setItem('viewed_projects', JSON.stringify(viewedProjects));

        const totalViews = viewedProjects.length;
        const shownThresholdsStr = sessionStorage.getItem('modal_shown_thresholds');
        const shownThresholds = shownThresholdsStr ? JSON.parse(shownThresholdsStr) : [];

        const thresholds = [20, 40, 60, 80];
        const currentThreshold = thresholds.find(t => t === totalViews);

        if (currentThreshold && !shownThresholds.includes(currentThreshold)) {
          setTimeout(() => setShowDescriptionModal(true), 1000);
          shownThresholds.push(currentThreshold);
          sessionStorage.setItem('modal_shown_thresholds', JSON.stringify(shownThresholds));
        }
      }
    }
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (!error && data) {
      setProject(data);
      await fetchFirstImage(data);
      await fetchAdjacentProjects(data.category_id);

      analyticsService.logPageView(`Product Detail: ${data.title}`);
      analyticsService.logProjectView(data.id, data.title);
    }
    setLoading(false);
  };

  const fetchAdjacentProjects = async (categoryId: string) => {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, titre_court')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: true });

    if (!error && projects) {
      const currentIndex = projects.findIndex(p => p.id === projectId);
      if (currentIndex !== -1) {
        if (currentIndex > 0) {
          setPreviousProject(projects[currentIndex - 1]);
        } else {
          setPreviousProject(null);
        }

        if (currentIndex < projects.length - 1) {
          setNextProject(projects[currentIndex + 1]);
        } else {
          setNextProject(null);
        }
      }
    }
  };

  const fetchFirstImage = async (projectData: Project) => {
    const { data: files, error } = await supabase.storage
      .from('Photos')
      .list(projectData.image_url);

    if (!error && files && files.length > 0) {
      const imageFiles = files
        .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file.name))
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return numA - numB;
        })
        .map(file => `${projectData.image_url}/${file.name}`);

      if (imageFiles.length > 0) {
        setMainImage(imageFiles[0]);
        setAllImages(imageFiles);
        allImagesRef.current = imageFiles;
        setSelectedImageIndex(0);
        await sortImagesByOrientation(imageFiles);
      }
    }
  };

  const sortImagesByOrientation = async (images: string[]) => {
    const imagesWithOrientation: ImageWithOrientation[] = await Promise.all(
      images.map(async (imagePath) => {
        return new Promise<ImageWithOrientation>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const isVertical = img.height > img.width;
            resolve({ path: imagePath, isVertical });
          };
          img.onerror = () => {
            resolve({ path: imagePath, isVertical: false });
          };
          img.src = getStorageUrl(imagePath);
        });
      })
    );

    const sorted = imagesWithOrientation.sort((a, b) => {
      if (a.isVertical && !b.isVertical) return -1;
      if (!a.isVertical && b.isVertical) return 1;
      return 0;
    });

    setSortedGalleryImages(sorted);
  };

  const selectThumbnail = (index: number) => {
    setSelectedImageIndex(index);
    setMainImage(allImages[index]);
  };

  const openCarousel = () => {
    startIndexRef.current = selectedImageIndex;
    setCurrentImageIndex(selectedImageIndex);
    setShowCarousel(true);
    if (project) {
      analyticsService.logButtonClick('Open image carousel', { project_id: project.id, project_title: project.title });
    }

    if (allImages.length === 1) {
      setTimeout(() => {
        setShowCarousel(false);
      }, 4000);
    }
  };

  const closeCarousel = () => {
    analyticsService.logButtonClick('Close carousel');
    slideshowActiveRef.current = false;
    if (slideshowIntervalRef.current) {
      clearTimeout(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
    setShowCarousel(false);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    analyticsService.logButtonClick('Next image in carousel');
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    analyticsService.logButtonClick('Previous image in carousel');
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const startIndexRef = useRef(0);

  useEffect(() => {
    if (!showCarousel) return;

    slideshowActiveRef.current = true;

    if (slideshowIntervalRef.current) {
      clearTimeout(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }

    let index = startIndexRef.current;

    const scheduleNext = () => {
      if (!slideshowActiveRef.current) return;
      if (index + 1 >= allImagesRef.current.length) return;
      slideshowIntervalRef.current = setTimeout(() => {
        if (!slideshowActiveRef.current) return;
        index += 1;
        setCurrentImageIndex(index);
        scheduleNext();
      }, 4000);
    };

    scheduleNext();

    return () => {
      slideshowActiveRef.current = false;
      if (slideshowIntervalRef.current) {
        clearTimeout(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }
    };
  }, [showCarousel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showCarousel) return;

      if (e.key === 'Escape') {
        closeCarousel();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    if (showCarousel) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showCarousel, allImages]);


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-white mb-4">Projet non trouvé</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-neutral-400 hover:text-white underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="container mx-auto px-6 pt-36 pb-16 relative z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-center drop-shadow-2xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              analyticsService.logButtonClick('Back button');
              const categorySlug = categoryIdToSlugMap[project.category_id];
              if (categorySlug) {
                const savedSubcategory = sessionStorage.getItem(`lastSubcategory_${categorySlug}`);
                const url = savedSubcategory
                  ? `/category/${categorySlug}?subcategory=${encodeURIComponent(savedSubcategory)}`
                  : `/category/${categorySlug}`;
                navigate(url);
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-light">Retour</span>
          </button>

          <nav className="absolute left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-1 text-sm font-light">
              <ol className="flex items-center gap-2 text-neutral-400">
                <li>
                  <a href="/" className="hover:text-white transition-colors">
                    Accueil
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a
                    href={`/category/${categoryIdToSlugMap[project.category_id]}`}
                    className="hover:text-white transition-colors capitalize"
                  >
                    {categoryIdToNameMap[project.category_id]}
                  </a>
                </li>
                <li>/</li>
              </ol>
              <div className="text-white text-center">
                {project.title}
              </div>
            </div>
          </nav>

          <div className="w-[88px]"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12 items-center">
          <div>
            {mainImage && (
              <div
                onClick={openCarousel}
                className="relative bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer group rounded-lg"
                style={{ maxHeight: '85vh' }}
              >
                <img
                  src={getStorageUrl(mainImage)}
                  alt={project.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  style={{ maxHeight: '85vh' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {project.description && (
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg">
                <div
                  className="text-neutral-300 font-light leading-relaxed prose prose-invert max-w-none prose-p:my-3 prose-strong:font-semibold prose-strong:text-white"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(project.description, {
                      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'a'],
                      ALLOWED_ATTR: ['href', 'target', 'rel'],
                      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)|^(?:\/|#)/i,
                      ADD_ATTR: ['rel'],
                      ADD_TAGS: [],
                      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'form', 'input', 'button'],
                      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
                    })
                  }}
                />
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => {
                      analyticsService.logButtonClick('Open project description modal from product page', { project_id: project.id, project_title: project.title });
                      setShowDescriptionModal(true);
                    }}
                    className="px-8 py-3 bg-white text-black font-light hover:bg-neutral-200 transition-colors rounded-lg"
                  >
                    Parlons de votre projet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {sortedGalleryImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedGalleryImages.map((imageData, index) => (
              <div
                key={index}
                onClick={() => {
                  analyticsService.logImageView(project.id, project.title, index);
                  const originalIndex = allImages.indexOf(imageData.path);
                  startIndexRef.current = originalIndex;
                  setCurrentImageIndex(originalIndex);
                  setShowCarousel(true);

                  if (allImages.length === 1) {
                    setTimeout(() => {
                      setShowCarousel(false);
                    }, 4000);
                  }
                }}
                className="relative bg-neutral-900 border border-neutral-800 overflow-hidden cursor-pointer group rounded-lg aspect-[1618/1000]"
              >
                <img
                  src={getStorageUrl(imageData.path)}
                  alt={`${project.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        )}

        {(previousProject || nextProject) && (
          <div className="mt-12 pt-6 border-t border-neutral-800">
            <div className="flex items-center justify-between px-6">
              {previousProject ? (
                <button
                  onClick={() => {
                    analyticsService.logNavigation(`Previous project: ${previousProject.titre_court}`, project?.title);
                    navigate(`/product/${previousProject.id}`);
                  }}
                  className="group flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider mb-1">Précédent</div>
                    <div className="font-light">{previousProject.titre_court}</div>
                  </div>
                </button>
              ) : (
                <div></div>
              )}

              {nextProject ? (
                <button
                  onClick={() => {
                    analyticsService.logNavigation(`Next project: ${nextProject.titre_court}`, project?.title);
                    navigate(`/product/${nextProject.id}`);
                  }}
                  className="group flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
                >
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wider mb-1">Suivant</div>
                    <div className="font-light">{nextProject.titre_court}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        )}

        {(project.location || project.year) && (
          <div className="mt-6 pt-6 text-sm text-neutral-400 font-light text-center">
            {project.location && project.year && (
              <span>Ouvrage réalisé pour un client à {project.location} en {project.year}</span>
            )}
            {project.location && !project.year && (
              <span>Ouvrage réalisé pour un client à {project.location}</span>
            )}
            {!project.location && project.year && (
              <span>Ouvrage réalisé en {project.year}</span>
            )}
          </div>
        )}
      </div>

      {showCarousel && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeCarousel}
            className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors rounded-full"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {allImages.length > 0 && (
                <>
                  <img
                    key={currentImageIndex}
                    src={getStorageUrl(allImages[currentImageIndex])}
                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      animation: 'fadeIn 0.5s ease-in-out'
                    }}
                  />

                  {allImages.length > 1 && (
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

      {showDescriptionModal && project && (
        <ProjectDescriptionModal
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setShowDescriptionModal(false)}
        />
      )}
    </div>
  );
}
