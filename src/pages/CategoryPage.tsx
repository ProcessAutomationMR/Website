import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  description: string;
  category_id: string;
  location?: string;
  year?: number;
  image_url: string;
  materials: string[];
  style?: string;
  room_type?: string;
  subcategory_id?: string;
  titre_court?: string;
}

interface Subcategory {
  id: string;
  subcategory: string;
  category_id: string;
}

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasViewedAllImages, setHasViewedAllImages] = useState(false);

  const filterPanelRef = useRef<HTMLDivElement>(null);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const categoryMap: Record<string, string> = {
    'menuiserie': 'Menuiserie',
    'agencement': 'Agencement',
    'agencement-magasins': 'Agencement de magasins',
    'laquage': 'Laquage'
  };

  const categoryIdMap: Record<string, string> = {
    'menuiserie': 'a8863264-327f-414d-86ed-586bca12fdc3',
    'agencement': '51560d32-76d2-4215-94ac-e8da1f919f0b',
    'agencement-magasins': '8d91be24-826b-4c9b-a2a3-46a90117d0ad',
    'laquage': '9eb82e1c-d5af-4ab6-be98-f609aed51242'
  };

  const actualCategory = categoryMap[category || ''] || category;
  const categoryId = categoryIdMap[category || ''];

  useEffect(() => {
    const fromUrl = searchParams.get('subcategory');
    if (fromUrl) {
      setSelectedSubcategoryId(fromUrl);
      setSearchParams({}, { replace: true });
    } else {
      setSelectedSubcategoryId('');
    }
    fetchProjects();
    fetchSubcategories();
  }, [actualCategory, categoryId]);

  useEffect(() => {
    applyFilters();
  }, [projects, selectedStyle, selectedRoomType, selectedMaterial, selectedSubcategoryId]);

  useEffect(() => {
    const availableSubcategoryIds = new Set(projects.map(p => p.subcategory_id).filter(Boolean));
    const filtered = subcategories.filter(sub => availableSubcategoryIds.has(sub.id));
    setAvailableSubcategories(filtered);
  }, [projects, subcategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node) && showFilters) {
        setShowFilters(false);
        setOpenDropdown(null);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  useEffect(() => {
    if (!showFilters) {
      setOpenDropdown(null);
    }
  }, [showFilters]);

  const fetchProjects = async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('category_id', categoryId)
      .order('ranking', { ascending: false });

    if (!error && data) {
      setProjects(data);
      await fetchThumbnails(data);
      analyticsService.logPageView(`Category: ${actualCategory}`);
      analyticsService.logCategoryView(actualCategory);
    }
    setLoading(false);
  };

  const fetchThumbnails = async (projectList: Project[]) => {
    const thumbnailMap: Record<string, string> = {};

    for (const project of projectList) {
      const { data: files, error } = await supabase
        .storage
        .from('Photos')
        .list(project.image_url, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (!error && files && files.length > 0) {
        const firstImage = files[0];
        thumbnailMap[project.id] = `${project.image_url}/${firstImage.name}`;
      }
    }

    setThumbnails(thumbnailMap);
  };

  const fetchSubcategories = async () => {
    if (!categoryId) return;

    const { data, error } = await supabase
      .from('subcategory')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true })
      .order('subcategory', { ascending: true });

    if (!error && data) {
      setSubcategories(data);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (selectedSubcategoryId) {
      filtered = filtered.filter(p => p.subcategory_id === selectedSubcategoryId);
    }
    if (selectedStyle) {
      filtered = filtered.filter(p => p.style === selectedStyle);
    }
    if (selectedRoomType) {
      filtered = filtered.filter(p => p.room_type === selectedRoomType);
    }
    if (selectedMaterial) {
      filtered = filtered.filter(p => p.materials.includes(selectedMaterial));
    }

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    analyticsService.logButtonClick('Clear filters');
    setSelectedStyle('');
    setSelectedMaterial('');
  };

  const fetchProjectImages = async (project: Project) => {
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

  const openProjectDetail = async (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    setHasViewedAllImages(false);
    const images = await fetchProjectImages(project);
    setProjectImages(images);
    analyticsService.logProjectView(project.id, project.title);
    await incrementProjectRanking(project.id);
  };

  const closeProjectDetail = () => {
    if (selectedProject) {
      sessionStorage.setItem(`lastSubcategory_${category}`, selectedSubcategoryId);
      navigate(`/product/${selectedProject.id}`);
    }
  };

  const nextImage = () => {
    analyticsService.logButtonClick('Next image in carousel');
    if (currentImageIndex === projectImages.length - 1) {
      if (selectedProject) {
        sessionStorage.setItem(`lastSubcategory_${category}`, selectedSubcategoryId);
        navigate(`/product/${selectedProject.id}`);
      }
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    analyticsService.logButtonClick('Previous image in carousel');
    setCurrentImageIndex((prev) => (prev - 1 + projectImages.length) % projectImages.length);
  };

  useEffect(() => {
    if (selectedProject && projectImages.length > 1 && !hasViewedAllImages) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const nextIndex = (prev + 1) % projectImages.length;
          if (nextIndex === 0 && prev === projectImages.length - 1) {
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
  }, [selectedProject, projectImages, hasViewedAllImages]);

  useEffect(() => {
    if (hasViewedAllImages && selectedProject) {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
      }

      setTimeout(() => {
        sessionStorage.setItem(`lastSubcategory_${category}`, selectedSubcategoryId);
        navigate(`/product/${selectedProject.id}`);
      }, 500);
    }
  }, [hasViewedAllImages, selectedProject, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;

      if (e.key === 'Escape') {
        closeProjectDetail();
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
  }, [selectedProject, projectImages]);

  const styles = [...new Set(projects.map(p => p.style).filter(Boolean))];
  const materials = [...new Set(projects.flatMap(p => p.materials))];

  const hasActiveFilters = selectedStyle || selectedMaterial;

  const getCategoryDescription = () => {
    if (category === 'menuiserie') {
      return (
        <div className="mt-8 max-w-4xl space-y-6 text-neutral-300 font-light leading-relaxed">
          <p className="text-lg">
            Chez GBM MENUISERIE, la menuiserie traditionnelle est un art à part entière, que nous exerçons dans notre atelier à Sigoulès, près de Bergerac. Notre savoir-faire repose sur une connaissance approfondie du bois et une attention particulière portée à chaque détail.
          </p>
          <p>
            Bien que nous valorisions énormément la tradition, nous mettons également la technologie et la modernité à votre service. Nos créations allient techniques artisanales et design contemporain pour apporter élégance et caractère à vos espaces.
          </p>
          <p>
            Notre palette de compétences est large : création de pièces d'exception, rénovation de menuiseries, parquets et mobiliers bois, construction de charpente traditionnelle. Que vous soyez autour de Bordeaux, Sarlat ou Bergerac, nous nous adaptons à vos besoins pour des réalisations sur mesure en bois massif de très haute qualité.
          </p>
        </div>
      );
    }

    if (category === 'agencement') {
      return (
        <div className="mt-8 max-w-4xl space-y-6 text-neutral-300 font-light leading-relaxed">
          <p className="text-lg">
            Un bon agencement d'intérieur permet d'optimiser votre espace et de créer des espaces de vie fonctionnels et harmonieux. La menuiserie joue un rôle essentiel dans l'agencement de vos espaces intérieurs.
          </p>
          <p>
            Besoin de plus de rangements ? Envie de mettre en place des cloisons pour délimiter vos espaces de vie ? Nous vous proposerons des solutions adaptées pour optimiser l'espace au sein de votre maison ou de vos locaux professionnels. Nous intervenons près de Bordeaux, Bergerac, Sarlat-la-Canéda et alentours pour la création de dressings, bibliothèques, placards et autres meubles sur mesure.
          </p>
          <p>
            Notre approche consiste à choisir avec vous les matériaux (bois massif, bois latté et coloris), à dessiner les différents éléments puis à réaliser et poser vos menuiseries sur-mesure. Chaque projet d'agencement est unique et parfaitement adapté à vos besoins et à votre espace.
          </p>
        </div>
      );
    }

    if (category === 'agencement-magasins') {
      return (
        <div className="mt-8 max-w-4xl space-y-6 text-neutral-300 font-light leading-relaxed">
          <p className="text-lg">
            Vous êtes propriétaire d'un magasin ou d'un restaurant dans les environs de Bordeaux, Bergerac ou Sarlat ? GBM MENUISERIE se charge de dynamiser et valoriser vos espaces de vente grâce à des solutions d'agencement sur mesure.
          </p>
          <p>
            Nous réalisons l'ensemble des opérations liées à la fabrication et à la pose d'ouvrages d'agencement destinés à un usage commercial. Du mobilier professionnel aux aménagements complets, nous intervenons pour créer des espaces attractifs et fonctionnels qui mettent en valeur vos produits et optimisent votre surface de vente.
          </p>
          <p>
            Nos réalisations en panneaux mélaminé ou MDF sont conçues pour répondre aux exigences des professionnels : robustesse, esthétique et adaptation parfaite à vos besoins spécifiques. Contactez-nous pour concrétiser votre projet d'agencement commercial dans les environs de Bordeaux, Bergerac ou Sarlat.
          </p>
        </div>
      );
    }

    if (category === 'laquage') {
      return (
        <div className="mt-8 max-w-4xl space-y-6 text-neutral-300 font-light leading-relaxed">
          <p className="text-lg">
            Le laquage professionnel à Bergerac, Bordeaux et Sarlat-la-Canéda : une finition haut de gamme pour vos menuiseries et meubles sur mesure. GBM MENUISERIE propose des prestations de laquage de qualité supérieure pour sublimer vos projets d'agencement intérieur et de menuiserie.
          </p>
          <p>
            Notre atelier de laquage en Dordogne offre une large palette de finitions pour tous types de supports : portes, placards, cuisines, dressings, mobilier contemporain et menuiseries d'agencement. Le laquage apporte une protection durable et un aspect esthétique incomparable, avec un rendu lisse et uniforme qui valorise chaque réalisation.
          </p>
          <p>
            Spécialistes du laquage bois et panneaux, nous intervenons pour les particuliers et professionnels dans toute la région Nouvelle-Aquitaine. Choix de coloris illimité, finitions mates, satinées ou brillantes : notre savoir-faire technique garantit un résultat parfait et pérenne. Confiez-nous vos projets de laquage menuiserie à Bergerac et ses environs pour un rendu professionnel d'exception.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white pt-44 pb-24 border-b border-neutral-800">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-light mb-4 tracking-wide">{actualCategory}</h1>
          <p className="text-xl text-neutral-300 font-light max-w-2xl">
            Découvrez nos créations d'exception, témoignages de notre savoir-faire artisanal
          </p>
          {getCategoryDescription()}
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b border-neutral-800 bg-black">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-8 justify-center">
                <button
                  onClick={() => {
                    analyticsService.logButtonClick('Subcategory filter: All');
                    setSelectedSubcategoryId('');
                  }}
                  className={`relative px-2 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                    !selectedSubcategoryId
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Toutes
                  {!selectedSubcategoryId && (
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                  )}
                </button>
                {availableSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      analyticsService.logButtonClick(`Subcategory filter: ${sub.subcategory}`);
                      setSelectedSubcategoryId(sub.id);
                    }}
                    className={`relative px-2 py-3 text-sm font-medium tracking-wide transition-all duration-300 ${
                      selectedSubcategoryId === sub.id
                        ? 'text-white'
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {sub.subcategory}
                    {selectedSubcategoryId === sub.id && (
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-3/5 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" />
      )}

      <div
        ref={filterPanelRef}
        className={`fixed top-0 right-0 h-full w-96 bg-neutral-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-neutral-800 ${
          showFilters ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <h3 className="text-2xl font-light tracking-wide text-white">Filtres</h3>
            <button
              onClick={() => {
                analyticsService.logButtonClick('Close filters panel');
                setShowFilters(false);
              }}
              className="p-2 hover:bg-neutral-800 transition-colors rounded text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {styles.length > 0 && (
                <div className="relative">
                  <label className="block text-sm font-light tracking-wide text-neutral-300 mb-3 uppercase">
                    Style
                  </label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'style' ? null : 'style')}
                    className="w-full px-4 py-3 border border-neutral-700 bg-neutral-800 hover:border-neutral-600 focus:border-neutral-500 transition-colors font-light text-left flex items-center justify-between"
                  >
                    <span className={selectedStyle ? 'text-white' : 'text-neutral-400'}>
                      {selectedStyle || 'Tous les styles'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${openDropdown === 'style' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'style' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 shadow-lg z-10 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          analyticsService.logButtonClick('Style filter: All');
                          setSelectedStyle('');
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors font-light border-b border-neutral-700 text-neutral-300"
                      >
                        Tous les styles
                      </button>
                      {styles.map(style => (
                        <button
                          key={style}
                          onClick={() => {
                            analyticsService.logButtonClick(`Style filter: ${style}`);
                            setSelectedStyle(style);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors font-light border-b border-neutral-700 last:border-b-0 text-neutral-300"
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {materials.length > 0 && (
                <div className="relative">
                  <label className="block text-sm font-light tracking-wide text-neutral-300 mb-3 uppercase">
                    Matériau
                  </label>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'material' ? null : 'material')}
                    className="w-full px-4 py-3 border border-neutral-700 bg-neutral-800 hover:border-neutral-600 focus:border-neutral-500 transition-colors font-light text-left flex items-center justify-between"
                  >
                    <span className={selectedMaterial ? 'text-white' : 'text-neutral-400'}>
                      {selectedMaterial || 'Tous les matériaux'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${openDropdown === 'material' ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === 'material' && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 shadow-lg z-10 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          analyticsService.logButtonClick('Material filter: All');
                          setSelectedMaterial('');
                          setOpenDropdown(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors font-light border-b border-neutral-700 text-neutral-300"
                      >
                        Tous les matériaux
                      </button>
                      {materials.map(material => (
                        <button
                          key={material}
                          onClick={() => {
                            analyticsService.logButtonClick(`Material filter: ${material}`);
                            setSelectedMaterial(material);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-neutral-700 transition-colors font-light border-b border-neutral-700 last:border-b-0 text-neutral-300"
                        >
                          {material}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <div className="p-6 border-t border-neutral-800">
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 transition-colors font-light tracking-wide border border-neutral-700"
              >
                <X className="w-5 h-5" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-neutral-800 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl text-neutral-400 font-light">Aucun projet ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              return (
                <div
                  key={project.id}
                  onClick={() => openProjectDetail(project)}
                  className="group bg-black rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                    <img
                      src={thumbnails[project.id] ? getStorageUrl(thumbnails[project.id]) : ''}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  {project.titre_court && (
                    <div className="px-6 py-4">
                      <h3 className="text-lg font-light tracking-widest uppercase text-[#D4AF37] text-center">
                        {project.titre_court}
                      </h3>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => {
              analyticsService.logButtonClick('Close project carousel');
              closeProjectDetail();
            }}
            className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors rounded-full"
          >
            <X className="w-8 h-8 text-white" />
          </button>

          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {projectImages.length > 0 && (
                <>
                  <img
                    key={currentImageIndex}
                    src={getStorageUrl(projectImages[currentImageIndex])}
                    alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain animate-fade-in"
                    style={{
                      animation: 'fadeIn 0.5s ease-in-out'
                    }}
                  />

                  {projectImages.length > 1 && (
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
