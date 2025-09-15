import React from 'react';
import { Tabs, Typography } from 'antd';
import IncidentListPage from '../features/Incidents/IncidentListPage';
import AlertingRulesPage from '../features/Incidents/AlertingRulesPage';
import SilencesPage from '../features/Incidents/SilencesPage';

const { Title, Paragraph } = Typography;

const IncidentsPage = ({ onNavigate, pageKey }: { onNavigate: (page: string) => void, pageKey: string }) => {
    const tabKey = ['incident-list', 'alerting-rules', 'silences'].includes(pageKey) ? pageKey : 'incident-list';

    return (
        <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Title level={2} className="page-title" style={{ marginBottom: '4px' }}>事件管理</Title>
                <Paragraph className="page-subtitle" type="secondary" style={{ margin: 0 }}>
                    集中管理事件、定義規則並設定靜音，建立完整的事件管理流程。
                </Paragraph>
            </div>
            <Tabs defaultActiveKey={tabKey} onChange={(key) => onNavigate(key)}>
                <Tabs.TabPane tab="事件列表" key="incident-list">
                    <IncidentListPage onNavigate={onNavigate} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="事件規則" key="alerting-rules">
                    <AlertingRulesPage />
                </Tabs.TabPane>
                <Tabs.TabPane tab="靜音規則" key="silences">
                    <SilencesPage />
                </Tabs.TabPane>
            </Tabs>
        </>
    );
};

export default IncidentsPage;
