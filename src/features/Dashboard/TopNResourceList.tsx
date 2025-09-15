import React, { useState } from 'react';
import { Card, Radio, Table, Progress } from 'antd';
// import { EchartsForReact } from '../../components/EchartsForReact'; // This will be created later

// ECharts Component Placeholder
const EchartsForReact = ({ option, isDark }: { option: any, isDark: boolean }) => {
    return <div style={{width: '100%', height: '100%', border: '1px solid #333'}} />;
};


const TopNResourceList = ({ themeMode }: { themeMode: string }) => {
    const [metric, setMetric] = useState('CPU');

    // This should be replaced with real data fetching
    const generateTrend = () => {
        const data = [];
        for (let i = 0; i < 7; i++) {
            data.push(Math.random() * 100);
        }
        return data;
    };

    const data = {
        CPU: Array.from({ length: 10 }, (_, i) => ({
            key: i,
            host: `web-prod-${i + 1}`,
            value: 95 - i * 2,
            trend: generateTrend()
        })),
        Mem: Array.from({ length: 10 }, (_, i) => ({
            key: i,
            host: `db-prod-${i + 1}`,
            value: 92 - i * 1.8,
            trend: generateTrend()
        })),
        Disk: Array.from({ length: 10 }, (_, i) => ({
            key: i,
            host: `log-server-${i + 1}`,
            value: 88 - i * 2.5,
            trend: generateTrend()
        })),
        Net: Array.from({ length: 10 }, (_, i) => ({
            key: i,
            host: `api-gateway-${i + 1}`,
            value: 800 - i * 25,
            trend: generateTrend()
        })),
    };

    const columns = [
        {
            title: '主機',
            dataIndex: 'host',
            key: 'host',
            width: '20%',
            render: (text:string) => (
                <div className="text-secondary" style={{ fontSize: '12px', cursor: 'pointer' }}>
                    {text}
                </div>
            )
        },
        {
            title: '資源趨勢 (24H)',
            dataIndex: 'trend',
            key: 'trend',
            width: '25%',
            render: (trend: number[], record: any) => (
                <div style={{ height: '30px' }}>
                    <EchartsForReact
                        option={{
                            backgroundColor: 'transparent',
                            grid: { top: 4, bottom: 4, left: 2, right: 2 },
                            xAxis: { type: 'category', show: false, data: (trend || []).map((_, i) => i) },
                            yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
                            series: [{
                                data: trend || [],
                                type: 'line',
                                smooth: false,
                                showSymbol: false,
                                lineStyle: { width: 2, color: '#6395f9' },
                                areaStyle: {
                                    color: {
                                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                        colorStops: [{ offset: 0, color: '#6395f94D' }, { offset: 1, color: '#6395f91A' }]
                                    }
                                }
                            }]
                        }}
                        isDark={themeMode === 'dark'}
                    />
                </div>
            )
        },
        {
            title: '使用率',
            dataIndex: 'value',
            key: 'value',
            width: '20%',
            render: (value: number) => (
                <Progress
                    percent={metric === 'Net' ? value / 10 : value}
                    showInfo={false}
                    strokeColor={value > 90 ? '#ff4d4f' : '#faad14'}
                    size="small"
                />
            )
        },
        {
            title: '數值',
            dataIndex: 'value',
            key: 'num',
            width: '10%',
            render: (value: number) => (
                <div className="text-secondary" style={{ fontSize: '12px' }}>
                    {value}{metric === 'Net' ? 'Mbps' : '%'}
                </div>
            )
        }
    ];

    const titleContent = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>Top N 資源使用列表</span>
            <Radio.Group
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                size="small"
            >
                <Radio.Button value="CPU">CPU</Radio.Button>
                <Radio.Button value="Mem">記憶體</Radio.Button>
                <Radio.Button value="Disk">磁碟</Radio.Button>
                <Radio.Button value="Net">網路</Radio.Button>
            </Radio.Group>
        </div>
    );

    return (
        <Card
            title={titleContent}
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
            bodyStyle={{ flex: 1, overflow: 'hidden', padding: '12px 12px 12px' }}
        >
            <div style={{ height: '100%', overflow: 'auto' }}>
                <Table
                    dataSource={data[metric]}
                    columns={columns}
                    pagination={false}
                    size="small"
                    rowKey="key"
                    className="topn-table"
                    scroll={{ y: 'calc(100% - 25px)' }}
                />
            </div>
        </Card>
    );
};

export default TopNResourceList;
