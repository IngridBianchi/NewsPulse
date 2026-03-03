import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { storage } from '../lib/storage';
import { Eye, EyeOff, Globe, Zap, Palette, Trophy, Check, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import imgSpaceAI from '../../assets/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png';
import { login, register, getRecommendations } from '../lib/api';
import { Article } from '../lib/data';

export function Profile() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(storage.getUser());
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Article[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // when user or read history changes calculate favourites and fetch recs
  useEffect(() => {
    if (user) {
      // compute favourites from read articles counts
      const history = storage.getReadHistory();
      const all = storage.getArticles();
      const read = all.filter((a) => history.includes(a.id));
      const counts: Record<string, number> = {};
      read.forEach((a) => {
        counts[a.category] = (counts[a.category] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map((e) => e[0]);
      setFavoriteCategories(sorted.slice(0, 4));

      // request recommendations from backend
      getRecommendations().then(setRecommendations).catch(console.warn);
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    setAuthError(null);
    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { user: loggedUser, token } = await login(email, password);
        storage.setUser(loggedUser);
        storage.setToken(token);
        setUser(loggedUser);
        window.dispatchEvent(new Event('userchange'));
      } else {
        // Registro: backend espera { name, email, password }
        await register(username, email, password);
        // Auto-login para que quede consistente (usuario + token)
        const { user: loggedUser, token } = await login(email, password);
        storage.setUser(loggedUser);
        storage.setToken(token);
        setUser(loggedUser);
        window.dispatchEvent(new Event('userchange'));
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuth();
    setUser(null);
    setEmail('');
    setPassword('');
    setUsername('');
    window.dispatchEvent(new Event('userchange'));
  };

  // no manual toggle anymore – favourites are driven by read history
  const toggleCategory = (category: string) => {
    // placeholder if old code references it, does nothing
  };

  const readHistory = storage.getReadHistory();
  const allArticles = storage.getArticles();
  const readArticles = allArticles.filter((a) => readHistory.includes(a.id));

  const categoryIcons = {
    MUNDO: Globe,
    TECNOLOGÍA: Zap,
    CULTURA: Palette,
    DEPORTES: Trophy,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
          {/* Login/Register Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[#0d2828]/60 to-[#0a1f1f]/80 border border-cyan-900/30 rounded-lg p-8"
          >
            <h2 className="text-3xl font-bold mb-8">
              ACCESO Y<br />REGISTRO
            </h2>

            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm mb-2 text-white/60">USUARIO</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent border-b border-cyan-900/30 pb-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-white/60">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-cyan-900/30 pb-3 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-white/60">CONTRASEÑA</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-cyan-900/30 pb-3 pr-10 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-3 text-cyan-400/50 hover:text-cyan-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg font-bold hover:bg-cyan-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'PROCESANDO...' : isLogin ? 'ENTRAR' : 'REGISTRARSE'}
              </button>

              {authError && (
                <div className="text-sm text-cyan-200/90 border border-cyan-500/20 bg-cyan-500/10 rounded-lg p-3">
                  {authError}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="w-full py-4 border border-cyan-900/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
              >
                {isLogin ? 'REGISTRARSE' : 'ENTRAR'}
              </button>

              <button
                type="button"
                className="text-sm text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">TU PERFIL</h1>
            <div className="flex items-center gap-3 text-cyan-400">
              <UserIcon className="w-5 h-5" />
              <span className="text-xl">{user.username}</span>
            </div>
            <p className="text-sm text-white/60 mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-cyan-900/30 rounded-lg hover:bg-cyan-500/10 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Reading History */}
          <div>
            <h2 className="text-xl font-bold mb-4">HISTORIAL DE LECTURA</h2>
            <div className="space-y-3">
              {readArticles.slice(0, 4).map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 bg-gradient-to-br from-[#0d2828]/40 to-[#0a1f1f]/40 border border-cyan-900/30 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-all"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <img src={article.image || imgSpaceAI} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-white/60">leído</p>
                  </div>
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Favorite Categories (derived from history) */}
          <div>
            <h2 className="text-xl font-bold mb-4">CATEGORÍAS FAVORITAS</h2>
            <div className="space-y-3">
              {favoriteCategories.map((category) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || Globe;
                return (
                  <div
                    key={category}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border bg-cyan-500/20 border-cyan-500/50"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-500/30">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-left font-medium">{category}</span>
                  </div>
                );
              })}
              {favoriteCategories.length === 0 && (
                <p className="text-sm text-white/60">Aún no has leído suficientes artículos.</p>
              )}
            </div>
          </div>
          {/* Recommendations */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">RECOMENDACIONES PARA TI</h2>
            <div className="space-y-3">
              {recommendations.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 p-4 bg-gradient-to-br from-[#0d2828]/40 to-[#0a1f1f]/40 border border-cyan-900/30 rounded-lg cursor-pointer hover:border-cyan-500/50 transition-all"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                    <img src={article.image || imgSpaceAI} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-white/60">{article.category}</p>
                  </div>
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                </motion.div>
              ))}
              {recommendations.length === 0 && (
                <p className="text-sm text-white/60">No hay recomendaciones por el momento.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
