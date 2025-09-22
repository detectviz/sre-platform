import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, SectionCard } from '../components';

// 404 頁面，提供使用者返回首頁的操作
export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader title="找不到頁面" subtitle="請確認網址是否正確，或返回事件列表繼續操作。" level={2} />
      <SectionCard>
        <Result
          status="404"
          title="頁面不存在"
          subTitle="系統無法找到您請求的資源，可能是路徑有誤或內容已被移除。"
          extra={
            <Button type="primary" onClick={() => navigate('/events/list')}>
              返回事件列表
            </Button>
          }
        />
      </SectionCard>
    </PageContainer>
  );
};
