import { Outlet, useNavigate, useLocation } from 'react-router';
import { Search, Landmark, TrendingUp, Palette, Trophy, Zap, Users, User, Shield, Sparkles, LogIn } from 'lucide-react';
import { storage } from '../lib/storage';
import { useState, useEffect } from 'react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(storage.getUser());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(storage.getUser());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userchange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userchange', handleStorageChange);
    };
  }, []);

  // Limpiar input cuando la búsqueda se cierra (cuando no hay parámetro search en URL)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (!params.has('search')) {
      setSearchQuery('');
    }
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(location.search);
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    navigate(`/?${params.toString()}`);
    setSearchQuery(''); // Limpiar input después de buscar
  };

  const sidebarItems = [
    { icon: Landmark, label: 'Política', value: 'Política' },
    { icon: TrendingUp, label: 'Economía', value: 'Economía' },
    { icon: Palette, label: 'Cultura', value: 'Cultura' },
    { icon: Trophy, label: 'Deportes', value: 'Deportes' },
    { icon: Zap, label: 'Tecnología', value: 'Tecnología' },
    { icon: Users, label: 'Sociedad', value: 'Sociedad' },
  ];

  return (
    <div className="min-h-screen bg-[#0a1f1f] text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f1f] via-[#0d2828] to-[#0a1f1f] opacity-90" />
      
      {/* Decorative stars */}
      <div className="absolute top-20 right-20 text-white/10">
        <Sparkles className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-900/30 bg-[#0a1f1f]/80 backdrop-blur-sm">
          <div className="max-w-[1800px] mx-auto px-8 py-6 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">
                <span className="text-white">News</span>
                <span className="text-cyan-400">Pulse</span>
              </h1>
              {user?.role === 'admin'}
            </button>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full bg-[#0d2828]/50 border border-cyan-900/30 rounded-full px-12 py-3 text-sm text-white/80 placeholder-cyan-400/30 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </form>

            <div className="flex items-center gap-4">
              {!user ? (
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 transition-all group"
                >
                  <LogIn className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-cyan-300">Login</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user.username}</span>
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Admin</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex max-w-[1800px] mx-auto">
          {/* Sidebar */}
          <aside className="w-64 min-h-[calc(100vh-88px)] border-r border-cyan-900/30 bg-[#0a1f1f]/40 p-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.search.includes(`category=${item.value}`);

              const handleCategory = () => {
                const params = new URLSearchParams(location.search);
                // remove search whenever category changes
                params.delete('search');

                // toggle off if already active
                if (params.get('category') === item.value) {
                  params.delete('category');
                } else {
                  params.set('category', item.value);
                }
                navigate(`/?${params.toString()}`);
                // also clear the input text if user had typed something
                setSearchQuery('');
              };

              return (
                <button
                  key={item.label}
                  onClick={handleCategory}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'border-cyan-900/30 text-white/60 hover:bg-cyan-500/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <svg className="ml-auto w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}