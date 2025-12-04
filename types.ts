export enum ToolType {
  DASHBOARD = 'DASHBOARD',
  META_GEN = 'META_GEN',
  KEYWORD_CHECK = 'KEYWORD_CHECK',
  SPEED_ADVISOR = 'SPEED_ADVISOR',
  SITEMAP_GEN = 'SITEMAP_GEN',
  QR_GEN = 'QR_GEN'
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

export interface NavItem {
  id: ToolType;
  label: string;
  icon: any; // Using any for Lucide icon components to avoid complex generic types in this setup
  description: string;
}