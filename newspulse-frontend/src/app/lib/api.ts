import { Article } from './data';

// Idealmente esta URL vendría de una variable de entorno: VITE_API_URL
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5000';

const STORAGE_KEYS = {
  USER: 'cinema_news_user',
  TOKEN: 'cinema_news_token',
};

function clearInvalidSession() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.dispatchEvent(new Event('userchange'));
}

function getSessionToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = localStorage.getItem(STORAGE_KEYS.USER);

  if (!token || !user) return null;

  // Basic JWT shape guard to prevent noisy invalid-token requests
  if (token.split('.').length !== 3) {
    clearInvalidSession();
    return null;
  }

  return token;
}

type BackendNews = {
  _id: string;
  id?: string;
  title: string;
  content: string;
  summary?: string;
  urlToImage?: string;
  publishedAt?: string;
  sourceName?: string;
  category?: string;
  status?: 'PUBLICADO' | 'BORRADOR';
};

type NewsListResponse = {
  success: boolean;
  data: BackendNews[];
  total: number;
  page: number;
  pages: number;
};

type NewsSearchResponse = {
  success: boolean;
  data: BackendNews[];
};

type NewsDetailResponse = {
  success: boolean;
  data: BackendNews;
};

function mapBackendNewsToArticle(item: BackendNews): Article {
  // Formateamos la fecha al formato del frontend (ej: "15 OCT 2026")
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    : '';

  return {
    id: item._id || item.id || '',
    title: item.title,
    summary: item.summary ?? '',
    content: item.content ?? '',
    image: item.urlToImage ?? '',
    // El backend ya envía categorías con el formato correcto
    category: (item.category ?? 'General') as Article['category'],
    date,
    author: item.sourceName ?? 'NEWS PULSE',
    source: item.sourceName ?? 'NEWS PULSE',
    status: item.status ?? 'PUBLICADO',
  };
}

export async function fetchArticles(page = 1, limit = 20, search = ''): Promise<Article[]> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);

  const response = await fetch(`${API_BASE_URL}/api/news?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Error al obtener noticias: ${response.status}`);
  }

  const json = (await response.json()) as NewsListResponse;

  if (!json.success) {
    throw new Error('La API devolvió un estado de error');
  }

  return json.data.map(mapBackendNewsToArticle);
}

export async function fetchNewsByCategory(category: string): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/api/news/category/${encodeURIComponent(category)}`);

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Error al obtener noticias por categoría: ${response.status}`);
  }

  const json = (await response.json()) as NewsSearchResponse;

  if (!json.success) {
    throw new Error('La API devolvió un estado de error en categoría');
  }

  return json.data.map(mapBackendNewsToArticle);
}

export async function searchNews(query: string): Promise<Article[]> {
  const params = new URLSearchParams();
  params.set('q', query);

  const response = await fetch(`${API_BASE_URL}/api/news/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Error al buscar noticias: ${response.status}`);
  }

  const json = (await response.json()) as NewsSearchResponse;

  if (!json.success) {
    throw new Error('La API devolvió un estado de error en búsqueda');
  }

  return json.data.map(mapBackendNewsToArticle);
}

export async function fetchArticleById(id: string): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/api/news/${id}`);

  if (response.status === 404) {
    throw new Error('Artículo no encontrado');
  }

  if (!response.ok) {
    throw new Error(`Error al obtener la noticia: ${response.status}`);
  }

  const json = (await response.json()) as NewsDetailResponse;

  if (!json.success) {
    throw new Error('La API devolvió un estado de error');
  }

  return mapBackendNewsToArticle(json.data);
}

type BackendUser = {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'lector';
  readHistory?: string[];
};

type LoginResponse = {
  success: boolean;
  data: {
    user: BackendUser;
    token: string;
  };
};

type RegisterResponse = {
  success: boolean;
  data: BackendUser;
};

function mapBackendUserToFrontend(user: BackendUser) {
  return {
    username: user.name,
    email: user.email,
    role: user.role,
    readHistory: user.readHistory ?? [],
    favoriteCategories: [], // backend todavía no lo calcula explícitamente
  };
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    // 401 -> credenciales inválidas
    const message = response.status === 401 ? 'Credenciales inválidas' : `Error de login: ${response.status}`;
    throw new Error(message);
  }

  const json = (await response.json()) as LoginResponse;
  if (!json.success) throw new Error('La API devolvió un estado de error');

  return {
    user: mapBackendUserToFrontend(json.data.user),
    token: json.data.token,
  };
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const message = response.status === 400 ? 'Email ya registrado' : `Error de registro: ${response.status}`;
    throw new Error(message);
  }

  const json = (await response.json()) as RegisterResponse;
  if (!json.success) throw new Error('La API devolvió un estado de error');

  return {
    user: mapBackendUserToFrontend(json.data),
  };
}

// registrar lectura en el servidor (se requiere token)
export async function addReadHistory(newsId: string) {
  const token = getSessionToken();
  if (!token) return;
  const response = await fetch(`${API_BASE_URL}/api/user/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newsId }),
  });

  if (response.status === 400 || response.status === 401) {
    clearInvalidSession();
  }
}

// obtener recomendaciones personalizadas del backend
export async function getRecommendations(): Promise<Article[]> {
  const token = getSessionToken();
  if (!token) return [];
  const response = await fetch(`${API_BASE_URL}/api/user/recommendations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 400 || response.status === 401) {
    clearInvalidSession();
    return [];
  }
  if (!response.ok) {
    throw new Error(`Error al obtener recomendaciones: ${response.status}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error('La API devolvió un estado de error');
  }
  return json.recommendations.map(mapBackendNewsToArticle);
}

// solicitar resumen de IA para una noticia específica
export async function getSummary(newsId: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/news/${newsId}/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener resumen: ${response.status}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error('La API devolvió un estado de error');
  }
  return json.data.summary || '';
}

// obtener noticias actuales desde API externa (newsApiService del backend)
export async function getGlobalNews(): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/api/news/global`);
  if (!response.ok) {
    throw new Error(`Error al obtener noticias globales: ${response.status}`);
  }
  const json = (await response.json()) as { success: boolean; data: BackendNews[] };
  if (!json.success) {
    throw new Error('La API devolvi\u00f3 un estado de error');
  }
  return json.data
    .map(mapBackendNewsToArticle)
    .filter((article) => Boolean(article.id));
}

type UpsertNewsPayload = {
  title: string;
  content: string;
  summary: string;
  category: Article['category'];
  sourceName: string;
  status?: Article['status'];
  urlToImage?: string;
  publishedAt?: string;
};

export async function createNews(payload: UpsertNewsPayload): Promise<Article> {
  const token = getSessionToken();
  if (!token) {
    throw new Error('Sesión inválida. Vuelve a iniciar sesión.');
  }

  const response = await fetch(`${API_BASE_URL}/api/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 400 || response.status === 401) {
    clearInvalidSession();
  }

  if (!response.ok) {
    throw new Error(`Error al crear noticia: ${response.status}`);
  }

  const json = (await response.json()) as NewsDetailResponse;
  if (!json.success) {
    throw new Error('La API devolvió un estado de error al crear noticia');
  }

  return mapBackendNewsToArticle(json.data);
}

export async function updateNews(id: string, payload: UpsertNewsPayload): Promise<Article> {
  const token = getSessionToken();
  if (!token) {
    throw new Error('Sesión inválida. Vuelve a iniciar sesión.');
  }

  const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 400 || response.status === 401) {
    clearInvalidSession();
  }

  if (!response.ok) {
    throw new Error(`Error al actualizar noticia: ${response.status}`);
  }

  const json = (await response.json()) as NewsDetailResponse;
  if (!json.success) {
    throw new Error('La API devolvió un estado de error al actualizar noticia');
  }

  return mapBackendNewsToArticle(json.data);
}

export async function deleteNews(id: string): Promise<void> {
  const token = getSessionToken();
  if (!token) {
    throw new Error('Sesión inválida. Vuelve a iniciar sesión.');
  }

  const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 400 || response.status === 401) {
    clearInvalidSession();
  }

  if (!response.ok) {
    throw new Error(`Error al eliminar noticia: ${response.status}`);
  }
}
