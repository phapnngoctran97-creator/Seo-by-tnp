export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  // SEO Tools
  META_GEN = 'META_GEN',
  KEYWORD_CHECK = 'KEYWORD_CHECK',
  SPEED_ADVISOR = 'SPEED_ADVISOR',
  SITEMAP_GEN = 'SITEMAP_GEN',
  QR_GEN = 'QR_GEN',
  
  // Text Tools
  WORD_COUNTER = 'WORD_COUNTER',
  IMG_COMPRESS = 'IMG_COMPRESS',
  PLAGIARISM_CHECK = 'PLAGIARISM_CHECK',

  // Graphic Tools
  AVATAR_MAKER = 'AVATAR_MAKER',
  BG_REMOVER = 'BG_REMOVER',
  IMG_RESIZER = 'IMG_RESIZER',
  BANNER_GEN = 'BANNER_GEN',
  IMG_FILTER = 'IMG_FILTER'
}

export interface KeywordData {
  word: string;
  count: number;
  density: number;
}

export interface GeneratedMeta {
  title: string;
  description: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  id: ToolType;
  label: string;
  icon: any; 
  description: string;
}