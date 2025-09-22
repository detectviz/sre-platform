export type DashboardCategory = 'infrastructure' | 'business' | 'operations' | 'automation' | 'custom';

export type DashboardStatus = 'published' | 'draft' | 'archived';

export type DashboardDefinition = {
  id: string;
  name: string;
  description?: string;
  category: DashboardCategory;
  owner?: string;
  tags?: string[];
  viewers?: number;
  favoriteCount?: number;
  panelCount?: number;
  status?: DashboardStatus;
  updatedAt?: string;
  isDefault?: boolean;
  isFeatured?: boolean;
  dataSources?: string[];
  thumbnailUrl?: string;
  /** 對應到平台內部頁面鍵值，便於導覽 */
  targetPageKey?: string;
};

export type DashboardStats = {
  totalDashboards: number;
  publishedDashboards: number;
  customDashboards: number;
  averagePanelCount: number;
  automationCoverage: number;
  lastUpdatedAt?: string;
};
