import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

// 共用的 404 頁面，提示使用者返回首頁
export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="找不到頁面"
      subTitle="您所查詢的頁面不存在或已被移除。"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回首頁
        </Button>
      }
    />
  );
};
