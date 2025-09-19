import { ArrowLeftOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Typography } from 'antd';
import type { ItemType } from 'antd/es/breadcrumb/Breadcrumb';
import type { ReactNode } from 'react';

const { Title, Paragraph } = Typography;

export type PageHeaderProps = {
  /** 主標題文字，必填 */
  title: string;
  /** 次標題／短敘述 */
  subtitle?: string;
  /** 進一步說明，可放多行文字或 React 節點 */
  description?: ReactNode;
  /** 額外右側操作列，例如按鈕群組 */
  extra?: ReactNode;
  /** 麵包屑列表 */
  breadcrumbItems?: ItemType[];
  /** 返回按鈕的點擊事件，提供此 props 將會顯示返回按鈕 */
  onBack?: () => void;
  /** 於標題右側顯示的小型標籤或狀態元件 */
  tags?: ReactNode;
  /** 左側的圖示 */
  icon?: ReactNode;
  /** 組件的 className */
  className?: string;
};

/**
 * 頁面標題組件，用於頁面頂部，提供標題、麵包屑、操作按鈕等功能。
 * 樣式已與 global.css 中的設計系統對齊。
 */
export const PageHeader = ({
  title,
  subtitle,
  description,
  extra,
  breadcrumbItems,
  onBack,
  tags,
  icon,
  className = '',
}: PageHeaderProps) => {
  // If onBack is provided, create a default back-arrow icon.
  // If a custom icon is also provided, it will be used instead.
  const finalIcon = icon ?? (onBack ? <ArrowLeftOutlined /> : null);

  return (
    <div className={`page-header ${className}`}>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div className="page-breadcrumb">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}
      <div className="page-header-content">
        <div className="page-header-main">
          <div className="page-title-section">
            {finalIcon && (
              <div
                className="page-title-icon"
                onClick={onBack}
                style={{ cursor: onBack ? 'pointer' : 'default' }}
              >
                {finalIcon}
              </div>
            )}
            <div className="page-title-text">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Title level={2} className="page-title">
                  {title}
                </Title>
                {tags}
              </div>
              {subtitle && (
                <Paragraph className="page-subtitle">
                  {subtitle}
                </Paragraph>
              )}
               {description && (
                <Paragraph type="secondary" style={{ marginTop: '8px' }}>
                  {description}
                </Paragraph>
              )}
            </div>
          </div>
        </div>
        {extra && (
          <div className="page-header-actions">
            {extra}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
