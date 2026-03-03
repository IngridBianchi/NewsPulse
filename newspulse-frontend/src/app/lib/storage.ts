import { Article, User } from './data';

const STORAGE_KEYS = {
  USER: 'cinema_news_user',
  TOKEN: 'cinema_news_token',
  ARTICLES: 'cinema_news_articles',
  READ_HISTORY: 'cinema_news_read_history',
  FAVORITE_CATEGORIES: 'cinema_news_favorite_categories',
};

export const storage = {
  getUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  
  setUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      // también sincronizamos historial de lectura remoto con el local
      if (user.readHistory && user.readHistory.length) {
        localStorage.setItem(STORAGE_KEYS.READ_HISTORY, JSON.stringify(user.readHistory));
      }
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },

  clearAuth() {
    this.setUser(null);
    this.setToken(null);
  },
  
  getArticles(): Article[] {
    const data = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    return data ? JSON.parse(data) : [];
  },
  
  setArticles(articles: Article[]) {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(articles));
  },
  
  getReadHistory(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.READ_HISTORY);
    return data ? JSON.parse(data) : [];
  },
  
  addToReadHistory(articleId: string) {
    const history = this.getReadHistory();
    if (!history.includes(articleId)) {
      history.unshift(articleId);
      localStorage.setItem(STORAGE_KEYS.READ_HISTORY, JSON.stringify(history.slice(0, 20)));
    }
  },
  
  getFavoriteCategories(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITE_CATEGORIES);
    return data ? JSON.parse(data) : [];
  },
  
  toggleFavoriteCategory(category: string) {
    const favorites = this.getFavoriteCategories();
    const index = favorites.indexOf(category);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITE_CATEGORIES, JSON.stringify(favorites));
    return favorites;
  },
};
