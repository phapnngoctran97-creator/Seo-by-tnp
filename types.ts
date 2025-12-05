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
  PDF_TOOLS = 'PDF_TOOLS',
  PLAGIARISM_CHECK = 'PLAGIARISM_CHECK'
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