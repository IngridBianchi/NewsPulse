export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: 'Política' | 'Economía' | 'Cultura' | 'Deportes' | 'Tecnología' | 'Sociedad' | 'General';
  date: string;
  author: string;
  source: string;
  status: 'PUBLICADO' | 'BORRADOR';
}

export interface User {
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'lector';
  readHistory: string[];
  favoriteCategories: string[];
}

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'La Revolución de la Inteligencia Artificial en el Espacio: Un Nuevo Horizonte',
    summary: 'La integración de sistemas de IA avanzados en la exploración espacial está permitiendo misiones más autónomas, seguras y eficientes. Desde la navegación hasta la toma de decisiones críticas, la IA está redefiniendo los límites.',
    content: `La integración de sistemas de IA avanzados en la exploración espacial está permitiendo misiones más autónomas, seguras y eficientes. Desde la navegación hasta la toma de decisiones críticas, la IA está redefiniendo los límites.

## AUTONOMÍA EN TIEMPO REAL

La integración de sistemas de IA avanzada en la exploración espacial está permitiendo misiones más autónomas, seguras y eficientes. Desde la navegación hasta la toma de decisiones críticas, la IA está redefiniendo los límites. Actualmente, la IA está permitiendo en tinertes autónoma en la musicalización de espacios contante ser alineándinos cronológicos como algoritmos de aprendizaje automático y visión artificial que la cruzía aumento conocido elstoria. Formando de nuestro uttilamente la mente e iprimiización de recursos de duturtentes autónomos están optimizando a la esfera dior sús más atclusímosnas segures, autónomas autónomas y pensó límites.

## OPTIMIZACIÓN DE RECURSOS

La integración de sistemas de IA avanzada en la exploración espacial está permitiendo misiones más autónomas, entre por nuiser singétártica. En les autoróis de consumios descónoce escrina con taxicalidades clasificas. A fumifica del treinición de metarandos demarraro, creaunios y se ulcintrazán la autiliza bendiando. A manualmienante u corponeña en planto potenciar información plantar mando men mentamente de decisiones más hora de nuestro orienta na decisionofíno crítica y desitrolloto de recinasado.`,
    image: 'figma:asset/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png',
    category: 'Tecnología',
    date: '15 OCT 2026',
    author: 'Dr. Ares Thorne',
    source: 'COSMOS REPORT',
    status: 'PUBLICADO'
  },
  {
    id: '2',
    title: 'Nuevas de Laboririta Nuevas Ciudades',
    summary: 'La innovación urbana está transformando nuestras ciudades en espacios inteligentes y sostenibles.',
    content: 'Contenido completo del artículo sobre ciudades inteligentes...',
    image: 'figma:asset/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png',
    category: 'Tecnología',
    date: '15 OCT 2026',
    author: 'Ares Thorne',
    source: 'TECH DAILY',
    status: 'PUBLICADO'
  },
  {
    id: '3',
    title: 'El Renacimiento del Cine Indie',
    summary: 'Una nueva generación de cineastas independientes está revolucionando la industria.',
    content: 'Contenido completo del artículo sobre cine indie...',
    image: 'figma:asset/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png',
    category: 'Cultura',
    date: '15 OCT 2026',
    author: 'Ares Thorne',
    source: 'CINEMA MONTHLY',
    status: 'PUBLICADO'
  },
  {
    id: '4',
    title: 'Voces de la Primera Línea: El Impacto del Cambio Climático',
    summary: 'Testimonios directos de comunidades afectadas por el cambio climático global.',
    content: 'Contenido completo del artículo sobre cambio climático...',
    image: 'figma:asset/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png',
    category: 'General',
    date: '15 OCT 2026',
    author: 'Ares Thorne',
    source: 'GLOBAL VOICES',
    status: 'BORRADOR'
  },
  {
    id: '5',
    title: 'Nuevas Ciudades Inteligentes',
    summary: 'El futuro de la urbanización con tecnología de punta.',
    content: 'Contenido completo del artículo...',
    image: 'figma:asset/9b86a6e7ecd5e3212580a36a41797cb7015d0850.png',
    category: 'Tecnología',
    date: '15 OCT 2026',
    author: 'Ares Thorne',
    source: 'FUTURE CITIES',
    status: 'PUBLICADO'
  },
];

export const categories = [
  'Política',
  'Economía',
  'Cultura',
  'Deportes',
  'Tecnología',
  'Sociedad',
  'General',
] as const;
