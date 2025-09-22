import type { PropsWithChildren } from 'react';

/**
 * 頁面容器，用於統一頁面垂直間距與寬度。
 */
const PageContainer = ({ children }: PropsWithChildren) => {
  return <div className="page-container">{children}</div>;
};

export default PageContainer;
