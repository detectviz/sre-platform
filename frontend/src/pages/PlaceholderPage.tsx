import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const PlaceholderPage = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Title level={2}>頁面施工中</Title>
      <Paragraph type="secondary">
        此頁面的內容已被清空，將在未來的開發中重新建構。
      </Paragraph>
    </div>
  );
};

export default PlaceholderPage;
