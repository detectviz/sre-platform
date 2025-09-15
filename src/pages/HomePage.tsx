import React from 'react';
import { Row, Col, Typography } from 'antd';
import { FireOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import TopNResourceList from '../features/Dashboard/TopNResourceList';
import AIInsightSummary from '../features/Dashboard/AIInsightSummary';

const { Title } = Typography;

// ECharts Component Placeholder
const EchartsForReact = ({ option, isDark }: { option: any, isDark: boolean }) => {
    return <div style={{width: '100%', height: '100%', border: '1px solid #333'}} />;
};

const HomePage = ({ themeMode, onNavigate }: { themeMode: string, onNavigate: (page: string, params?: any) => void }) => {

    const stackedBarOption = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: 'rgba(255,255,255,0.2)',
            textStyle: { color: '#fff', fontSize: 11 }
        },
        onClick: (params: any) => {
            if (onNavigate && params.name) {
                onNavigate('resource-list', { groupFilter: params.name });
            }
        },
        legend: {
            data: ['健康', '警告', '嚴重'],
            top: 0,
            textStyle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
            itemGap: 8,
            itemWidth: 12,
            itemHeight: 8
        },
        grid: { left: '2%', right: '2%', bottom: '15%', top: '18%', containLabel: true },
        xAxis: {
            type: 'category',
            data: ['生產Web集群', '生產資料庫', '測試環境', '開發環境', '災備系統', '監控平台', 'API網關', '快取服務'],
            axisLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 12, interval: 0, rotate: 0 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
        },
        series: [
            { name: '健康', type: 'bar', stack: '總量', data: [85, 18, 28, 22, 75, 32, 45, 38], color: '#52c41a', barWidth: '60%' },
            { name: '警告', type: 'bar', stack: '總量', data: [18, 12, 25, 8, 28, 22, 16, 14], color: '#faad14' },
            { name: '嚴重', type: 'bar', stack: '總量', data: [22, 8, 12, 6, 15, 10, 8, 12], color: '#ff4d4f' }
        ]
    };

    const serviceHealthHeatmapOption = {
        tooltip: {
            position: 'top',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: 'rgba(255,255,255,0.2)',
            textStyle: { color: '#fff', fontSize: 11 },
            formatter: (params: any) => {
                const services = ['使用者認證', '訂單系統', '支付閘道', '通知服務', '資料分析', '檔案儲存'];
                const signals = ['延遲 (Latency)', '流量 (Traffic)', '錯誤 (Errors)', '飽和度 (Saturation)'];
                const service = services[params.data[1]];
                const signal = signals[params.data[0]];
                const statusText = params.data[2] === 0 ? '健康' : params.data[2] === 1 ? '警告' : '嚴重';
                return `${service}<br/>${signal}: ${statusText}`;
            }
        },
        onClick: (params: any) => {
            if (onNavigate && params.data) {
                const services = ['使用者認證', '訂單系統', '支付閘道', '通知服務', '資料分析', '檔案儲存'];
                const signals = ['延遲', '流量', '錯誤', '飽和度'];
                const service = services[params.data[1]];
                const signal = signals[params.data[0]];
                onNavigate('service-dashboard', { service: service, signal: signal });
            }
        },
        grid: { height: '60%', top: '5%', left: '20%', bottom: '30%' },
        xAxis: { type: 'category', data: ['延遲', '流量', '錯誤', '飽和度'], splitArea: { show: true }, axisLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11 } },
        yAxis: { type: 'category', data: ['使用者認證', '訂單系統', '支付閘道', '通知服務', '資料分析', '檔案儲存'], splitArea: { show: true }, axisLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11 } },
        visualMap: {
            min: 0, max: 2, type: 'piecewise',
            pieces: [{ min: 0, max: 0, color: '#52c41a', label: '健康' }, { min: 1, max: 1, color: '#faad14', label: '警告' }, { min: 2, max: 2, color: '#ff4d4f', label: '嚴重' }],
            orient: 'horizontal', left: 'center', bottom: '12%', itemWidth: 20, itemHeight: 15, textGap: 8, itemGap: 15,
            textStyle: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 500 }
        },
        series: [{
            name: '服務健康度', type: 'heatmap',
            data: [[0, 0, 0], [1, 0, 0], [2, 0, 1], [3, 0, 0], [0, 1, 0], [1, 1, 0], [2, 1, 0], [3, 1, 1], [0, 2, 1], [1, 2, 0], [2, 2, 2], [3, 2, 0], [0, 3, 0], [1, 3, 0], [2, 3, 0], [3, 3, 0], [0, 4, 0], [1, 4, 1], [2, 4, 0], [3, 4, 0], [0, 5, 0], [1, 5, 0], [2, 5, 0], [3, 5, 1]],
            label: { show: false },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
        }]
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px - 48px)' }}>
            <div style={{ marginBottom: '16px' }}>
                <Row gutter={[16, 12]}>
                    <Col xs={24} sm={12} md={8} lg={8}>
                        <div className="stat-card padding-md" style={{ height: '120px', cursor: 'pointer' }} onClick={() => onNavigate('incident-list', { statusFilter: 'new' })}>
                            <div className="card-content">
                                <div>
                                    <div className="card-title" style={{ fontSize: '14px' }}>待處理告警</div>
                                    <div className="card-value" style={{ color: '#ff4d4f', fontSize: '40px' }}>5</div>
                                    <div className="card-description">其中 <span style={{ color: '#ff4d4f', fontWeight: '600' }}>2</span> 嚴重</div>
                                </div>
                                <FireOutlined className="card-icon" style={{ color: '#ff4d4f', fontSize: '36px' }} />
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8}>
                        <div className="stat-card padding-md" style={{ height: '120px', cursor: 'pointer' }} onClick={() => onNavigate('incident-list', { statusFilter: 'acknowledged' })}>
                            <div className="card-content">
                                <div>
                                    <div className="card-title" style={{ fontSize: '14px' }}>處理中</div>
                                    <div className="card-value" style={{ color: '#faad14', fontSize: '40px' }}>3</div>
                                    <div className="card-description" style={{ color: '#faad14' }}>↘ 15% 較昨日</div>
                                </div>
                                <ClockCircleOutlined className="card-icon" style={{ color: '#faad14', fontSize: '36px' }} />
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8}>
                        <div className="stat-card padding-md" style={{ height: '120px', cursor: 'pointer' }} onClick={() => onNavigate('incident-list', { statusFilter: 'resolved' })}>
                            <div className="card-content">
                                <div>
                                    <div className="card-title" style={{ fontSize: '14px' }}>今日已解決</div>
                                    <div className="card-value" style={{ color: '#52c41a', fontSize: '40px' }}>12</div>
                                    <div className="card-description" style={{ color: '#52c41a' }}>↗ 8% 較昨日</div>
                                </div>
                                <CheckCircleOutlined className="card-icon" style={{ color: '#52c41a', fontSize: '36px' }} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
            <AIInsightSummary onNavigate={onNavigate} />
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Row gutter={[16, 12]} style={{ flexGrow: 1 }}>
                    <Col xs={24} sm={24} md={8} lg={8} style={{ display: 'flex' }}>
                        <div className="chart-card" style={{ width: '100%', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => onNavigate('resource-list')}>
                            <Title level={5} className="chart-title">服務健康度總覽</Title>
                            <div style={{ flexGrow: 1 }}>
                                <EchartsForReact option={serviceHealthHeatmapOption} isDark={themeMode === 'dark'} />
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={24} md={16} lg={16} style={{ display: 'flex' }}>
                        <div className="chart-card" style={{ width: '100%', padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column' }} onClick={() => onNavigate('resource-list')}>
                            <Title level={5} className="chart-title">資源群組狀態總覽</Title>
                            <div style={{ flexGrow: 1 }}>
                                <EchartsForReact option={stackedBarOption} isDark={themeMode === 'dark'} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default HomePage;
