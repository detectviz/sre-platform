import React, { useState } from 'react';
import { Typography, Tooltip, Avatar, message } from 'antd';
import { RobotOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const AIInsightSummary = ({ onNavigate }: { onNavigate: (page: string, params: any) => void }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [insightContent, setInsightContent] = useState('整體系統穩定，但觀察到 Production Web Servers 的 CPU 使用率在高峰時段有 15% 的增長，接近警戒線。資料庫 延遲平穩，無明顯異常。建議關注 web-prod-03 主機的日誌，該主機出現了數次響應緩慢的情況。');

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const analysisVariants = [
                '系統運行良好，所有核心服務表現正常。檢測到 資料庫 連接池使用率略有上升，但仍在安全範圍內。',
                '發現潛在的性能瓶頸：web-prod-03 主機的磁盤I/O持續偏高。建議增加對 Production Web Servers 集群的監控頻率。',
                '系統整體健康，但注意到網絡延遲略有波動。建議在繁忙時段增加 web-prod-03 的資源配置。'
            ];
            const randomAnalysis = analysisVariants[Math.floor(Math.random() * analysisVariants.length)];
            setInsightContent(randomAnalysis);
            message.success('AI 分析已更新');
        } catch (error) {
            message.error('重新生成分析失敗');
        } finally {
            setIsRefreshing(false);
        }
    };

    const renderEntityLinkedText = (text: string) => {
        const entityPatterns = [
            { pattern: /Production Web Servers/g, type: 'resource-group', param: 'Production Web Servers' },
            { pattern: /web-prod-03/g, type: 'resource', param: 'web-prod-03' },
            { pattern: /資料庫/g, type: 'service', param: '資料庫' }
        ];

        let result: (string | JSX.Element)[] = [text];

        entityPatterns.forEach(({ pattern, type, param }) => {
            let newResult: (string | JSX.Element)[] = [];
            result.forEach((segment, index) => {
                if (typeof segment === 'string') {
                    const parts = segment.split(pattern);
                    for (let i = 0; i < parts.length; i++) {
                        newResult.push(parts[i]);
                        if (i < parts.length - 1) {
                            const match = segment.match(pattern)![0];
                            newResult.push(
                                <a key={`${type}-${param}-${i}`} onClick={() => onNavigate('resource-list', { groupFilter: param })} style={{ color: '#1890ff', textDecoration: 'underline' }}>
                                    {match}
                                </a>
                            );
                        }
                    }
                } else {
                    newResult.push(segment);
                }
            });
            result = newResult;
        });

        return <>{result}</>;
    };


    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
            border: '1px solid rgba(114, 46, 209, 0.6)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-lg)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            margin: '0 0 16px 0'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <RobotOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                    <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>AI 每日簡報</Title>
                </div>
                <Tooltip title="重新生成分析">
                    <Avatar
                        size={28}
                        shape="square"
                        icon={<ReloadOutlined spin={isRefreshing} />}
                        onClick={handleRefresh}
                        style={{
                            background: 'linear-gradient(135deg, #722ed1 0%, #9c4dcc 100%)',
                            fontSize: '14px',
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                            opacity: isRefreshing ? 0.6 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    />
                </Tooltip>
            </div>
            <Paragraph style={{ margin: 0, lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {renderEntityLinkedText(insightContent)}
            </Paragraph>
        </div>
    );
};

export default AIInsightSummary;
