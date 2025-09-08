import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

/**
 * 一個通用的佔位符元件
 * @param title - 要顯示的頁面標題
 */
const Placeholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <Title level={2}>{title}</Title>
      <Paragraph>
        此頁面 (<b>{title}</b>) 正在開發中。
      </Paragraph>
      <Paragraph>
        這是一個臨時的佔位符，很快將被實際的功能頁面所取代。
      </Paragraph>
    </div>
  );
};

export default Placeholder;
