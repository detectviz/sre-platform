import { ArrowLeftOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Space, Typography } from 'antd';
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
  /** 是否顯示返回按鈕 */
  onBack?: () => void;
  /** 於標題右側顯示的小型標籤或狀態元件 */
  tags?: ReactNode;
};

export const PageHeader = ({
  title,
  subtitle,
  description,
  extra,
  breadcrumbItems,
  onBack,
  tags,
}: PageHeaderProps) => (
  <Space direction="vertical" size="large" style={{ width: '100%' }}>
    {breadcrumbItems && breadcrumbItems.length > 0 && (
      <Breadcrumb items={breadcrumbItems} />
    )}

    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <Space align="start" size="large">
        {onBack && (
          <Button
            type="text"
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            aria-label="返回"
          />
        )}
        <Space direction="vertical" size={8}>
          <Space align="center" size={12}>
            <Title level={2} className="heading-gradient" style={{ margin: 0 }}>
              {title}
            </Title>
            {tags}
          </Space>
          {subtitle && (
            <Paragraph type="secondary" style={{ margin: 0 }}>
              {subtitle}
            </Paragraph>
          )}
          {description && (
            <Paragraph style={{ margin: 0 }}>
              {description}
            </Paragraph>
          )}
        </Space>
      </Space>
      {extra && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{extra}</div>}
    </div>
  </Space>
);

export default PageHeader;
