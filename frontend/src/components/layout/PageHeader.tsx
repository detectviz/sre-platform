import type { ReactNode } from 'react';
import { memo } from 'react';

interface PageHeaderProps {
  /** 頁面主標題文字 */
  title: string;
  /** 補充說明文字 */
  subtitle?: string;
  /** 額外操作按鈕區域 */
  actions?: ReactNode;
  /** 標題左側的圖示區塊 */
  icon?: ReactNode;
  /** 麵包屑節點 */
  breadcrumb?: ReactNode;
  /** 標題層級，預設為 h1 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** 自訂樣式類別 */
  className?: string;
}

/**
 * 頁面標題組件，統一各模組的標題視覺與操作區塊。
 */
const PageHeader = memo(({ title, subtitle, actions, icon, breadcrumb, level = 1, className = '' }: PageHeaderProps) => {
  const HeadingTag = `h${level}` as const;

  return (
    <div className={`page-header ${className}`.trim()}>
      {breadcrumb ? <div className="page-breadcrumb">{breadcrumb}</div> : null}
      <div className="page-header-content">
        <div className="page-title-section">
          {icon ? <div className="page-title-icon">{icon}</div> : null}
          <div className="page-title-text">
            <HeadingTag className="page-title">{title}</HeadingTag>
            {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="page-header-actions">{actions}</div> : null}
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
