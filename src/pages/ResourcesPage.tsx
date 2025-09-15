import React from 'react';
import { Tabs, Typography } from 'antd';
import ResourceListPage from '../features/Resources/ResourceListPage';
import ResourceGroupsPage from '../features/Resources/ResourceGroupsPage';

const { Title, Paragraph } = Typography;

const ResourcesPage = ({ onNavigate, pageKey }: { onNavigate: (page: string) => void, pageKey: string }) => {
    const tabKey = ['resource-list', 'resource-groups'].includes(pageKey) ? pageKey : 'resource-list';

    return (
        <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Title level={2} className="page-title" style={{ marginBottom: '4px' }}>資源管理</Title>
                <Paragraph className="page-subtitle" type="secondary" style={{ margin: 0 }}>
                    探索、組織與管理您的所有基礎設施資源。
                </Paragraph>
            </div>
            <Tabs defaultActiveKey={tabKey} onChange={(key) => onNavigate(key)}>
                <Tabs.TabPane tab="資源列表" key="resource-list">
                    <ResourceListPage onNavigate={onNavigate} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="資源群組" key="resource-groups">
                    <ResourceGroupsPage />
                </Tabs.TabPane>
            </Tabs>
        </>
    );
};

export default ResourcesPage;
