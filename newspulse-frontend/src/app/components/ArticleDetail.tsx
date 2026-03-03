import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Article } from '../lib/data';
import { storage } from '../lib/storage';
import { ArrowLeft, CheckCircle, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { fetchArticleById, addReadHistory, getSummary } from '../lib/api';

const FALLBACK_IMAGE =
  'https://via.placeholder.com/1200x600?text=NewsPulse';

export function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [isRead, setIsRead] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!id) return;
  
      try {
        // 1. Intentamos obtener la noticia desde el backend
        const apiArticle = await fetchArticleById(id);
        setArticle(apiArticle);
  
        const history = storage.getReadHistory();
        const already = history.includes(apiArticle.id);
        setIsRead(already);
        // if not yet in local history but we have user token, inform server
        if (!already) {
          addReadHistory(apiArticle.id).catch(() => {});
        }
      } catch (error) {
        console.error('Error cargando artículo desde el backend', error);
  
        // 2. Si falla, volvemos al comportamiento anterior usando localStorage
        const storedArticles = storage.getArticles();
        const fallback = storedArticles.find((a) => a.id === id) || null;
        setArticle(fallback);
  
        if (fallback) {
          const history = storage.getReadHistory();
          setIsRead(history.includes(fallback.id));
        }
      }
    };
  
    loadArticle();
  }, [id]);

  const handleMarkAsRead = async () => {
    if (article) {
      storage.addToReadHistory(article.id);
      setIsRead(true);
      // notify backend if user is logged in
      try {
        await addReadHistory(article.id);
      } catch (err) {
        console.warn('No se pudo enviar historial al servidor', err);
      }
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleAISummary = async () => {
    if (!showSummary) {
      // opening summary - fetch if not already loaded
      if (!generatedSummary && article && !summaryLoading) {
        setSummaryLoading(true);
        try {
          const summary = await getSummary(article.id);
          setGeneratedSummary(summary || article.summary);
        } catch (err) {
          console.error('Error generando resumen', err);
          setGeneratedSummary(article?.summary || 'No se pudo generar el resumen.');
        } finally {
          setSummaryLoading(false);
        }
      }
    }
    setShowSummary(!showSummary);
  };

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/60">Artículo no encontrado</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a1f1f]"
    >
      {/* Header controls */}
      <div className="sticky top-0 z-20 bg-[#0a1f1f]/95 backdrop-blur-sm border-b border-cyan-900/30">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver al Feed</span>
          </button>
          
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Article content */}
      <article className="max-w-4xl mx-auto px-8 py-12">
        {/* Hero image */}
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
          <img
            src={article.image || FALLBACK_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1f] via-transparent to-transparent" />
        </div>

        {/* Title and meta */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center gap-6 text-sm text-white/60 mb-6">
            <span>FECHA: {article.date}</span>
            <span>|</span>
            <span>FUENTE: {article.source}</span>
            <span>|</span>
            <span>AUTOR: {article.author}</span>
          </div>

          {/* AI Summary Button */}
          <div className="mb-8">
            <button
              onClick={handleAISummary}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 hover:from-cyan-500/30 hover:to-purple-500/30 transition-all group"
            >
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-medium text-cyan-300">
                {showSummary ? 'Ocultar resumen con IA' : 'Resumen con IA'}
              </span>
            </button>
            
            {/* AI Summary Content */}
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-6 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 backdrop-blur-sm"
              >
                <h2 className="text-xs font-bold text-cyan-400 mb-3 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  RESUMEN GENERADO POR IA
                </h2>
                {summaryLoading ? (
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="animate-spin">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p>Generando resumen...</p>
                  </div>
                ) : (
                  <p className="text-white/80 leading-relaxed">
                    {generatedSummary || article?.summary || 'No disponible'}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Content sections */}
        <div className="prose prose-invert max-w-none">
          <div className="text-white/80 leading-relaxed space-y-6 whitespace-pre-line">
            {article.content}
          </div>
        </div>

        {/* Mark as read button */}
        <div className="mt-12 flex items-center justify-center">
          <button
            onClick={handleMarkAsRead}
            disabled={isRead}
            className={`flex items-center gap-2 px-8 py-4 rounded-full border transition-all ${
              isRead
                ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
                : 'border-cyan-500/30 hover:bg-cyan-500/10 text-white'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {isRead ? 'Marcado como leído' : 'Marcar como leído'}
            </span>
          </button>
        </div>

        {/* Next story */}
        <div className="mt-12 flex justify-end">
          <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <span className="text-sm">Siguiente Historia</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </article>
    </motion.div>
  );
}