import type { CSSProperties, ReactNode } from 'react';
import { Card } from 'antd';

interface SectionCardProps {
  /** 卡片標題 */
  title?: ReactNode;
  /** 額外操作區塊 */
  extra?: ReactNode;
  /** 主要內容 */
  children: ReactNode;
  /** 自訂樣式類別 */
  className?: string;
  /** 卡片內容區域樣式 */
  bodyStyle?: CSSProperties;
}

/**
 * 玻璃擬態樣式的區塊卡片，包裹列表、表格或圖表內容。
 */
const SectionCard = ({ title, extra, children, className = '', bodyStyle }: SectionCardProps) => {
  return (
    <Card title={title} extra={extra} className={`section-card ${className}`.trim()} bodyStyle={bodyStyle} bordered={false}>
      {children}
    </Card>
  );
};

export default SectionCard;
