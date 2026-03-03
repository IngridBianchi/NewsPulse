import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { storage } from '../lib/storage';
import { Article } from '../lib/data';
import { fetchArticles, fetchNewsByCategory, getGlobalNews, searchNews } from '../lib/api';
import { Zap, X } from 'lucide-react';
import { motion } from 'motion/react';


const FALLBACK_IMAGE =
  'https://via.placeholder.com/800x600?text=NewsPulse'; // o la URL que quieras

export function Feed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [lastTrendingUpdate, setLastTrendingUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const ARTICLES_PER_PAGE = 6;

  // Cargar noticias globales al montar
  useEffect(() => {
    const loadTrendings = async () => {
      try {
        setTrendingLoading(true);
        const global = await getGlobalNews();
        const safeGlobal = global.filter((article) => Boolean(article.id));

        // Cachear globales para que detalle tenga fallback local si falla backend
        if (safeGlobal.length > 0) {
          const local = storage.getArticles();
          const ids = new Set(local.map((item) => item.id));
          const merged = [...safeGlobal.filter((item) => !ids.has(item.id)), ...local];
          storage.setArticles(merged);
        }

        setTrendingArticles(safeGlobal.slice(0, 6));
        setLastTrendingUpdate(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      } catch (error) {
        console.error('Error cargando noticias globales', error);
      } finally {
        setTrendingLoading(false);
      }
    };
    
    loadTrendings();
  }, []);

  // Cargar artículos desde el backend (filtrando por búsqueda si existe)
  useEffect(() => {
    const loadFromApi = async () => {
      try {
        setIsLoading(true);
        const apiArticles = search
          ? await searchNews(search)
          : category
          ? await fetchNewsByCategory(category)
          : await fetchArticles(1, 50);
        setArticles(apiArticles);
        storage.setArticles(apiArticles); // opcional: cache local para otros componentes
      } catch (error) {
        console.error('Error cargando noticias desde el backend', error);
        // Si falla, intentamos usar lo que haya en localStorage
        const stored = storage.getArticles();
        if (stored.length > 0) {
          setArticles(stored);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadFromApi();
  }, [search, category]);

  useEffect(() => {
    // Reset cuando cambien categoría o búsqueda
    setPage(1);
    setDisplayedArticles([]);
  }, [category, search]);

  useEffect(() => {
    // Load initial articles
    loadMoreArticles();
  }, [category, articles, page]);

  useEffect(() => {
    // Setup intersection observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading]);

  const loadMoreArticles = () => {
    const filtered = articles.filter((a) => a.status === 'PUBLICADO');

    const startIndex = (page - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const newArticles = filtered.slice(startIndex, endIndex);

    if (newArticles.length > 0) {
      setIsLoading(true);
      setTimeout(() => {
        setDisplayedArticles((prev) => {
          // Avoid duplicates
          const existing = new Set(prev.map((a) => a.id));
          const unique = newArticles.filter((a) => !existing.has(a.id));
          return [...prev, ...unique];
        });
        setIsLoading(false);
      }, 800);
    }
  };

  // Grid layout con tamaños variados
  const getGridClass = (index: number) => {
    const patterns = [
      'md:col-span-2 md:row-span-2', // Grande
      'md:col-span-1 md:row-span-1', // Normal
      'md:col-span-1 md:row-span-1', // Normal
      'md:col-span-1 md:row-span-2', // Vertical
      'md:col-span-2 md:row-span-1', // Horizontal
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="p-8 relative">
      {/* SEARCH RESULTS - mostrar solo si hay búsqueda activa */}
      {search && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              RESULTADOS DE BÚSQUEDA
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/60">"{search}" ({displayedArticles.length} resultados)</span>
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all"
                title="Cerrar búsqueda"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-white/60">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                <Zap className="w-5 h-5" />
              </motion.div>
              <span className="ml-2">Buscando...</span>
            </div>
          ) : displayedArticles.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <p>No hay resultados para "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {displayedArticles.slice(0, 6).map((article, idx) => (
                <motion.article
                  key={`search-${article.id}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(`/article/${article.id}`)}
                  className="group relative overflow-hidden rounded-lg border border-cyan-500/30 bg-gradient-to-br from-[#0d2828]/60 to-[#0a1f1f]/60 cursor-pointer hover:border-cyan-500/50 transition-all h-[180px]"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={article.image || FALLBACK_IMAGE}
                      alt={article.title}
                      className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1f] to-transparent" />
                  </div>
                  <div className="relative h-full p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 tracking-wider">{article.category}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold mb-2 leading-tight group-hover:text-cyan-300 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-white/40">{article.date}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          <div className="border-t border-cyan-900/30" />
        </motion.div>
      )}

      {/* TRENDING / LO MÁS RECIENTE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="w-6 h-6 text-cyan-400" />
            TRENDING / LO MÁS RECIENTE
          </h2>
          {lastTrendingUpdate && (
            <span className="text-xs text-white/50">Actualizado: {lastTrendingUpdate}</span>
          )}
        </div>
        
        {trendingLoading ? (
          <div className="flex items-center justify-center py-8 text-white/60">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="w-5 h-5" />
            </motion.div>
            <span className="ml-2">Cargando noticias globales...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {trendingArticles.map((article, idx) => (
              <motion.article
                key={`trending-${article.id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/article/${article.id}`)}
                className="group relative overflow-hidden rounded-lg border border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 cursor-pointer hover:border-cyan-400/80 transition-all h-[220px]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={article.image || FALLBACK_IMAGE}
                    alt={article.title}
                    className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1f] to-transparent" />
                </div>
                <div className="relative h-full p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300 tracking-wider">{article.category}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-2 leading-tight group-hover:text-cyan-300 transition-colors line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="text-xs text-white/40">{article.date}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
        <div className="border-t border-cyan-900/30" />
      </motion.div>

      {/* FEED REGULAR */}
      {isLoading && (
        <motion.div
          className="fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scaleY: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        {displayedArticles.map((article, index) => (
          <motion.article
            key={`${article.id}-${index}`}
            initial={{ opacity: 0, y: 60, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ 
              delay: (index % ARTICLES_PER_PAGE) * 0.15,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={`${getGridClass(index)} group relative overflow-hidden rounded-lg border border-cyan-900/30 bg-gradient-to-br from-[#0d2828]/80 to-[#0a1f1f]/80 cursor-pointer hover:border-cyan-500/50 transition-all`}
            onClick={() => navigate(`/article/${article.id}`)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Background image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={article.image || FALLBACK_IMAGE}
                alt={article.title}
                className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1f] via-[#0a1f1f]/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full p-6 flex flex-col justify-end">
              <div className="mb-3">
                <span className="text-xs font-bold text-cyan-400 tracking-wider">
                  {article.category}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-cyan-300 transition-colors">
                {article.title}
              </h3>
              
              <p className="text-sm text-white/60 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {article.summary}
              </p>

              <div className="mt-4 text-xs text-white/40">
                leer más
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Invisible observer element for infinite scroll */}
      <div ref={observerRef} className="h-20 mt-8" />

      {/* Loading indicator text */}
      {isLoading && (
        <motion.div 
          className="flex items-center justify-center gap-3 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-cyan-400/60 text-sm">Cargando más historias...</span>
        </motion.div>
      )}
    </div>
  );
}