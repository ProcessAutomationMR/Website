import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { analyticsService } from '../services/analytics.service';
import { incrementProjectRanking } from '../services/project.service';
import { stripHtmlTags } from '../utils/html.utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'project';
  image_url?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

function getStorageUrl(path: string) {
  const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
  return `${supabaseUrl}/storage/v1/object/public/Photos/${encodedPath}`;
}

function highlightText(text: string, searchQuery: string): JSX.Element {
  if (!searchQuery.trim()) {
    return <>{text}</>;
  }

  const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  const matches: Array<{ start: number; end: number; term: string }> = [];

  searchTerms.forEach(term => {
    let index = text.toLowerCase().indexOf(term);
    while (index !== -1) {
      matches.push({ start: index, end: index + term.length, term });
      index = text.toLowerCase().indexOf(term, index + 1);
    }
  });

  matches.sort((a, b) => a.start - b.start);

  const mergedMatches: Array<{ start: number; end: number }> = [];
  matches.forEach(match => {
    if (mergedMatches.length === 0) {
      mergedMatches.push(match);
    } else {
      const last = mergedMatches[mergedMatches.length - 1];
      if (match.start <= last.end) {
        last.end = Math.max(last.end, match.end);
      } else {
        mergedMatches.push(match);
      }
    }
  });

  mergedMatches.forEach((match, i) => {
    if (match.start > lastIndex) {
      parts.push(<span key={`text-${i}`}>{text.slice(lastIndex, match.start)}</span>);
    }
    parts.push(
      <mark key={`mark-${i}`} className="bg-yellow-500/30 text-white">
        {text.slice(match.start, match.end)}
      </mark>
    );
    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchQuery('');
      setResults([]);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim());
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    analyticsService.logSearch(query);

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*');

    if (!error && projects) {
      const filteredProjects = projects.filter(project => {
        const searchableText = `
          ${project.title || ''}
          ${project.titre_court || ''}
          ${project.description || ''}
          ${project.location || ''}
          ${project.style || ''}
          ${project.room_type || ''}
          ${project.materials?.join(' ') || ''}
        `.toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });

      const searchResults: SearchResult[] = filteredProjects.map(project => ({
        id: project.id,
        title: project.titre_court || project.title,
        description: project.description,
        type: 'project',
        image_url: project.image_url
      }));

      setResults(searchResults);
      await fetchThumbnails(searchResults);
    }

    setLoading(false);
  };

  const fetchThumbnails = async (searchResults: SearchResult[]) => {
    const thumbnailMap: Record<string, string> = {};

    for (const result of searchResults) {
      if (result.image_url) {
        const { data: files, error } = await supabase
          .storage
          .from('Photos')
          .list(result.image_url, {
            limit: 1,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (!error && files && files.length > 0) {
          thumbnailMap[result.id] = `${result.image_url}/${files[0].name}`;
        }
      }
    }

    setThumbnails(thumbnailMap);
  };

  const handleResultClick = async (result: SearchResult) => {
    analyticsService.logButtonClick(`Search result clicked: ${result.title}`);
    await incrementProjectRanking(result.id);
    navigate(`/product/${result.id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-3xl mx-4 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl">
        <div className="flex items-center gap-4 p-6 border-b border-neutral-800">
          <Search className="w-6 h-6 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher des projets, styles, matériaux..."
            className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded transition-colors"
          >
            <X className="w-6 h-6 text-neutral-400" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-neutral-700 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : searchQuery.trim().length < 2 ? (
            <div className="text-center py-12 text-neutral-500">
              Tapez au moins 2 caractères pour rechercher
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              Aucun résultat trouvé pour "{searchQuery}"
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-neutral-800 rounded-lg transition-colors text-left group"
                >
                  {thumbnails[result.id] && (
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={getStorageUrl(thumbnails[result.id])}
                        alt={result.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-1 truncate">
                      {highlightText(result.title, searchQuery)}
                    </h3>
                    <p className="text-sm text-neutral-400 line-clamp-2">
                      {highlightText(stripHtmlTags(result.description), searchQuery)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
