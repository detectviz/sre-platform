import React, { useState } from 'react';
import { Select, InputNumber, Space } from 'antd';
import type { GrafanaDashboardProps } from '../types/components';

const { Option } = Select;


export const GrafanaDashboard: React.FC<GrafanaDashboardProps> = ({
  dashboardUrl = 'http://localhost:3000/d/aead3d54-423b-4a91-b91c-dbdf40d7fff5?orgId=1',
  height = '600px',
  title = 'Grafana Dashboard',
  showControls = true,
  orgId,
  panelId,
  viewPanel = false,
  autofitpanels = true,
  kiosk = true,
  from,
  to,
  timeRange = 'Last 6 hours'
}) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [kioskState, setKioskState] = useState<'off' | 'kiosk' | 'tv'>(() => {
    if (typeof kiosk === 'string') {
      return kiosk as 'off' | 'kiosk' | 'tv';
    }
    return kiosk ? 'tv' : 'off';
  });
  const [refresh, setRefresh] = useState<number | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange || 'Last 6 hours');

  const timeRangeOptions = [
    { label: 'Last 5 minutes', from: 'now-5m', to: 'now' },
    { label: 'Last 15 minutes', from: 'now-15m', to: 'now' },
    { label: 'Last 30 minutes', from: 'now-30m', to: 'now' },
    { label: 'Last 1 hour', from: 'now-1h', to: 'now' },
    { label: 'Last 3 hours', from: 'now-3h', to: 'now' },
    { label: 'Last 6 hours', from: 'now-6h', to: 'now' },
    { label: 'Last 12 hours', from: 'now-12h', to: 'now' },
    { label: 'Last 24 hours', from: 'now-1d', to: 'now' },
    { label: 'Last 2 days', from: 'now-2d', to: 'now' },
    { label: 'Last 7 days', from: 'now-7d', to: 'now' },
    { label: 'Last 30 days', from: 'now-30d', to: 'now' }
  ];

  // 構造完整的嵌入URL
  const buildEmbedUrl = (baseUrl: string) => {
    let url = baseUrl;
    const params = new URLSearchParams();

    // 檢查是否為公開的 Grafana 儀表板（不需認證）
    const isPublicGrafana = baseUrl.includes('play.grafana.org') ||
      baseUrl.includes('public-dashboards') ||
      baseUrl.includes('grafana.net');

    // 檢查是否為您的本地 Grafana 實例
    const isYourLocalGrafana = baseUrl.includes('localhost:3000');

    // 只有在非公開儀表板且非您的本地 Grafana 時才添加認證參數
    if (!isPublicGrafana && !isYourLocalGrafana) {
      params.append('authToken', 'demo-token');
    }

    // 添加主題參數
    if (theme) {
      params.append('theme', theme);
    }

    // 添加kiosk模式
    if (kioskState === 'kiosk') {
      params.append('kiosk', 'true');
    } else if (kioskState === 'tv') {
      params.append('kiosk', 'tv');
    }

    // 添加刷新間隔
    if (refresh && refresh > 0) {
      params.append('refresh', `${refresh}s`);
    }

    // 添加組織 ID
    if (orgId) {
      params.append('orgId', orgId.toString());
    }

    // 添加面板 ID（如果指定了 viewPanel）
    if (panelId && viewPanel) {
      params.append('panelId', panelId.toString());
      params.append('viewPanel', 'true');
    }

    // 添加自動調整面板
    if (autofitpanels !== undefined) {
      params.append('autofitpanels', autofitpanels.toString());
    }

    // 添加時間範圍
    if (from) {
      params.append('from', from);
    }

    if (to) {
      params.append('to', to);
    }

    // 添加快速時間範圍
    const selectedTimeOption = timeRangeOptions.find(option => option.label === selectedTimeRange);
    if (selectedTimeOption) {
      params.append('from', selectedTimeOption.from);
      params.append('to', selectedTimeOption.to);
    }

    const paramString = params.toString();
    if (paramString) {
      url += (baseUrl.includes('?') ? '&' : '?') + paramString;
    }

    return url;
  };

  const [currentUrl, setCurrentUrl] = useState(buildEmbedUrl(dashboardUrl));

  // 當相關參數改變時更新 URL
  React.useEffect(() => {
    const newUrl = buildEmbedUrl(dashboardUrl);
    setCurrentUrl(newUrl);
  }, [dashboardUrl, selectedTimeRange, theme, kioskState, refresh]);



  return (
    <div style={{ padding: 0, margin: 0 }}>
      {showControls && (
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <Space wrap>
            <div>
              <label style={{ marginRight: 'var(--spacing-xs)' }}>主題：</label>
              <Select
                value={theme}
                onChange={setTheme}
                size="small"
                style={{ width: 100 }}
              >
                <Option value="light">淺色</Option>
                <Option value="dark">深色</Option>
              </Select>
            </div>

            <div>
              <label style={{ marginRight: 'var(--spacing-xs)' }}>TV模式：</label>
              <Select
                value={kioskState}
                onChange={setKioskState}
                size="small"
                style={{ width: 100 }}
              >
                <Option value="off">關閉</Option>
                <Option value="kiosk">Kiosk</Option>
                <Option value="tv">TV</Option>
              </Select>
            </div>

            <div>
              <label style={{ marginRight: 'var(--spacing-xs)' }}>刷新：</label>
              <InputNumber
                min={0}
                max={3600}
                value={refresh}
                onChange={(value) => setRefresh(value)}
                placeholder="秒"
                size="small"
                style={{ width: 80 }}
              />
            </div>

            <div>
              <label style={{ marginRight: 'var(--spacing-xs)' }}>時間：</label>
              <Select
                value={selectedTimeRange}
                onChange={setSelectedTimeRange}
                size="small"
                style={{ width: 120 }}
              >
                {timeRangeOptions.map(option => (
                  <Option key={option.label} value={option.label}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>
          </Space>
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height }}>
        <iframe
          className="grafana-iframe"
          src={currentUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-elevated)'
          }}
          title={title}
        />
      </div>

    </div>
  );
};
