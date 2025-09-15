import React from 'react';
import { Tabs, Typography } from 'antd';
import ScriptsPage from '../features/Automation/ScriptsPage';
import SchedulesPage from '../features/Automation/SchedulesPage';
import ExecutionsPage from '../features/Automation/ExecutionsPage';

const { Title, Paragraph } = Typography;

const AutomationCenterPage = ({ onNavigate, pageKey, scripts, setScripts, addExecution, executions, setExecutions }: any) => {
    const tabKey = ['scripts', 'schedules', 'executions'].includes(pageKey) ? pageKey : 'scripts';

    return (
        <>
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <Title level={2} className="page-title" style={{ marginBottom: '4px' }}>自動化中心</Title>
                <Paragraph className="page-subtitle" type="secondary" style={{ margin: 0 }}>
                    管理自動化腳本、排程任務與執行歷史，提升運維效率。
                </Paragraph>
            </div>
            <Tabs defaultActiveKey={tabKey} onChange={(key) => onNavigate(key)}>
                <Tabs.TabPane tab="腳本庫" key="scripts">
                    <ScriptsPage scripts={scripts} setScripts={setScripts} addExecution={addExecution} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="排程管理" key="schedules">
                    <SchedulesPage scripts={scripts} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="執行日誌" key="executions">
                    <ExecutionsPage executions={executions} setExecutions={setExecutions} />
                </Tabs.TabPane>
            </Tabs>
        </>
    );
};

export default AutomationCenterPage;
