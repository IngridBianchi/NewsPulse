import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../lib/storage';
import { Article, categories } from '../lib/data';
import { Edit, Trash2, Eye, EyeOff, Upload, ChevronLeft, ChevronRight, Loader, RefreshCw, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import imgSpaceAI from '../../assets/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png';
import { createNews, deleteNews, fetchArticles, getGlobalNews, updateNews } from '../lib/api';

export function AdminPanel() {
  const navigate = useNavigate();
  const user = storage.getUser();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalRefreshLoading, setGlobalRefreshLoading] = useState(false);
  const [globalUpdateLog, setGlobalUpdateLog] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'Tecnología' as Article['category'],
    author: '',
    source: '',
    status: 'BORRADOR' as Article['status'],
  });

  const loadAdminArticles = async () => {
    try {
      const apiArticles = await fetchArticles(1, 100);
      setArticles(apiArticles);
      storage.setArticles(apiArticles);
    } catch (error) {
      console.error('Error cargando noticias de admin desde backend', error);
      const storedArticles = storage.getArticles();
      setArticles(storedArticles);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }

    loadAdminArticles();
  }, [user?.role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        category: formData.category,
        sourceName: formData.source || formData.author,
        status: formData.status,
        urlToImage: imgSpaceAI,
        publishedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateNews(editingId, payload);
      } else {
        await createNews(payload);
      }

      await loadAdminArticles();
      resetForm();
    } catch (error) {
      console.error('Error guardando noticia', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      summary: article.summary,
      content: article.content,
      category: article.category,
      author: article.author,
      source: article.source,
      status: article.status,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
      try {
        await deleteNews(id);
        await loadAdminArticles();
      } catch (error) {
        console.error('Error eliminando noticia', error);
      }
    }
  };

  const toggleStatus = async (id: string) => {
    const target = articles.find((article) => article.id === id);
    if (!target) return;

    const nextStatus: Article['status'] = target.status === 'PUBLICADO' ? 'BORRADOR' : 'PUBLICADO';

    try {
      await updateNews(id, {
        title: target.title,
        summary: target.summary,
        content: target.content,
        category: target.category,
        sourceName: target.source || target.author,
        status: nextStatus,
        urlToImage: target.image,
      });
      await loadAdminArticles();
    } catch (error) {
      console.error('Error actualizando estado de noticia', error);
    }
  };

  const handleRefreshGlobalNews = async () => {
    setGlobalRefreshLoading(true);
    const now = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    try {
      const globalNews = await getGlobalNews();
      const newCount = globalNews.length;
      const logEntry = `✅ ${now} - Se cargaron ${newCount} noticias globales`;
      setGlobalUpdateLog((prev) => [logEntry, ...prev.slice(0, 9)]);
      
      // merge con articulos existentes evitando duplicados
      const allIds = new Set(articles.map((a) => a.id));
      const newArticles = globalNews.filter((g) => !allIds.has(g.id));
      if (newArticles.length > 0) {
        const merged = [...newArticles, ...articles];
        setArticles(merged);
        storage.setArticles(merged);
      }
    } catch (error) {
      const logEntry = `❌ ${now} - Error al cargar noticias globales`;
      setGlobalUpdateLog((prev) => [logEntry, ...prev.slice(0, 9)]);
      console.error(error);
    } finally {
      setGlobalRefreshLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      category: 'Tecnología',
      author: '',
      source: '',
      status: 'BORRADOR',
    });
    setEditingId(null);
    setIsEditing(false);
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation buttons */}
        <div className="flex gap-3 mb-8">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">VOLVER</span>
          </a>
          <a
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
          >
            <span className="text-sm">MI PERFIL</span>
          </a>
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
          >
            <span className="text-sm">INICIO</span>
          </a>
        </div>

        <div className="flex flex-col gap-8">
          {/* Control Noticias Globales */}
          <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                NOTICIAS<br />GLOBALES
              </h2>
              <div className="w-3 h-3 rounded-full bg-cyan-400" />
            </div>

            <p className="text-sm text-white/60 mb-6">Actualiza desde la API externa</p>

            <button
              onClick={handleRefreshGlobalNews}
              disabled={globalRefreshLoading}
              className="w-full py-4 mb-6 bg-cyan-500/20 border border-cyan-500/50 rounded-lg font-bold hover:bg-cyan-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {globalRefreshLoading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span>ACTUALIZANDO...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>REFRESCAR NOTICIAS</span>
                </>
              )}
            </button>

            <div className="bg-[#0a1f1f]/80 border border-cyan-900/30 rounded-lg p-4">
              <h3 className="text-xs font-bold text-cyan-400 mb-3 tracking-wider">HISTORIAL DE ACTUALIZACIONES</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {globalUpdateLog.length === 0 ? (
                  <p className="text-xs text-white/40">Sin actualizaciones aún</p>
                ) : (
                  globalUpdateLog.map((log, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-white/70 font-mono"
                    >
                      {log}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Form Section */}
          <div className="bg-gradient-to-br from-[#0d2828]/60 to-[#0a1f1f]/80 border border-cyan-900/30 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                GESTIÓN DE<br />CONTENIDOS
              </h2>
              <div className="text-right">
                {/* <div className="text-xs text-cyan-400 mb-1">
                  {isEditing ? 'OR EDITAR NOTICIA' : 'CREAR NUEVA NOTICIA'}
                </div> */}
                <div className="w-3 h-3 rounded-full bg-cyan-400 ml-auto" />
              </div>
            </div>

            <p className="text-sm text-white/60 mb-6">CRUD de noticias</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs text-white/60 mb-2">
                  TÍTULO (Max. 100 caracteres)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                  className="w-full bg-transparent border-b border-cyan-900/30 pb-2 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2">
                  CATEGORÍA{' '}
                  <span className="text-white/40">
                    (MUNDO, TECNOLOGÍA, CULTURA, DEPORTES)
                  </span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Article['category'] })}
                  className="w-full bg-[#0d2828] border border-cyan-900/30 rounded px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2">
                  CONTENIDO COMPLETO (Soporte Markdown/HTML sulit)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full bg-[#0d2828] border border-cyan-900/30 rounded px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-2">AUTOR</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-transparent border-b border-cyan-900/30 pb-2 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-2">FUENTE</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-transparent border-b border-cyan-900/30 pb-2 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-2">RESUMEN</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  className="w-full bg-[#0d2828] border border-cyan-900/30 rounded px-4 py-3 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-3">
                  SUBIR IMAGEN/VÍDEO DE PORTADA
                </label>
                <div className="border-2 border-dashed border-cyan-900/30 rounded-lg p-8 text-center hover:border-cyan-500/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-cyan-400/50" />
                  <p className="text-sm text-white/40">Drag y video de portada</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg font-bold hover:bg-cyan-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isEditing ? 'ACTUALIZAR NOTICIA' : 'CREAR / ACTUALIZAR NOTICIA'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 border border-cyan-900/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
                  >
                    CANCELAR EDICIÓN
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Articles List Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">NOTICIAS RECIENTES</h2>
              <h3 className="text-xl font-bold">ACCIONES RÁPIDAS</h3>
            </div>

            <div className="space-y-4">
              {articles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 bg-gradient-to-br from-[#0d2828]/40 to-[#0a1f1f]/40 border border-cyan-900/30 rounded-lg"
                >
                  <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                    <img src={article.image || imgSpaceAI} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold mb-1 line-clamp-1">{article.title}</h3>
                    <p className="text-xs text-white/60 mb-2">
                      Fecha: {article.date} | Autor: {article.author}
                    </p>
                    <p className="text-xs">
                      Estado:{' '}
                      <span className={article.status === 'PUBLICADO' ? 'text-cyan-400' : 'text-yellow-400'}>
                        {article.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(article)}
                      className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <button
                      onClick={() => toggleStatus(article.id)}
                      className="w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center hover:bg-cyan-500/20 transition-colors"
                      title={article.status === 'PUBLICADO' ? 'Ocultar' : 'Publicar'}
                    >
                      {article.status === 'PUBLICADO' ? (
                        <EyeOff className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                  </div>

                  <div className="text-right text-xs">
                    <div className="text-cyan-400 font-bold mb-2">
                      EDITAR / ELIMINAR / OCULTAR
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button className="w-10 h-10 rounded-full border border-cyan-900/30 flex items-center justify-center hover:bg-cyan-500/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-cyan-900/30 flex items-center justify-center hover:bg-cyan-500/10 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading indicator at bottom */}
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <span className="text-cyan-400">Cargando más historias...</span>
        </div>

        {/* Footer badge */}
        <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-[#0a1f1f]/90 border border-cyan-500/30 rounded-full px-4 py-2 backdrop-blur-sm z-40 pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-cyan-400" />
          </div>
          <span className="text-sm">ADMIN: {user.username}</span>
        </div>
      </div>
    </div>
  );
}
