import { CalendarOutlined, PauseCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { Badge, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useSilences } from '../../hooks';
import type { Silence } from '../../hooks';

dayjs.extend(isBetween);

const SILENCE_TYPE_LABEL: Record<string, string> = {
  recurring: '週期靜音',
  one_time: '臨時靜音',
  maintenance: '維護窗口'
};

const SCOPE_LABEL: Record<string, string> = {
  resource: '資源',
  resource_group: '資源群組',
  rule: '事件規則',
  global: '全域'
};

const formatMatcher = (silence: Silence) => {
  const matchers = silence.matchers ?? [];
  if (matchers.length === 0) {
    return '未指定匹配條件';
  }
  return matchers.map((item) => `${item.key} ${item.operator} ${item.value ?? ''}`).join('、');
};

const formatRepeat = (silence: Silence) => {
  if (!silence.repeat_pattern) {
    return '單次執行';
  }
  const repeat = silence.repeat_pattern;
  if (repeat.repeat_mode === 'daily') {
    return `每日 ${repeat.duration_hours ?? 0} 小時`;
  }
  if (repeat.repeat_mode === 'weekly') {
    const days = (repeat.weekdays ?? []).join('、');
    return `每週 (${days}) ${repeat.duration_hours ?? 0} 小時`;
  }
  return '自訂排程';
};

const isActive = (silence: Silence) => {
  if (!silence.start_time || !silence.end_time) {
    return false;
  }
  const now = dayjs();
  return now.isBetween(dayjs(silence.start_time), dayjs(silence.end_time), 'minute', '[]');
};

export const SilenceRulesPage = () => {
  const { data, loading } = useSilences();
  const silences = data?.items ?? [];

  const stats = useMemo(() => {
    const active = silences.filter((silence) => silence.is_enabled && isActive(silence)).length;
    const upcoming = silences.filter((silence) => dayjs(silence.start_time).isAfter(dayjs())).length;
    const recurring = silences.filter((silence) => Boolean(silence.repeat_pattern)).length;
    return {
      total: silences.length,
      active,
      upcoming,
      recurring
    };
  }, [silences]);

  return (
    <PageContainer>
      <PageHeader
        title="靜音規則"
        subtitle="設定臨時或週期靜音以避免重複告警，維持值班專注。"
        icon={<PauseCircleOutlined />}
      />

      <div className="kpi-grid">
        <KpiCard
          title="靜音規則"
          value={stats.total}
          unit="條"
          status="normal"
          description={`啟用 ${stats.active} 條 / 即將開始 ${stats.upcoming} 條`}
          icon={<SoundOutlined />}
        />
        <KpiCard
          title="進行中"
          value={stats.active}
          unit="條"
          status={stats.active > 0 ? 'warning' : 'normal'}
          description="確保維護期間暫停非必要通知"
          icon={<PauseCircleOutlined />}
        />
        <KpiCard
          title="週期靜音"
          value={stats.recurring}
          unit="條"
          status={stats.recurring > 0 ? 'success' : 'normal'}
          description="減少固定維護造成的告警噪音"
          icon={<CalendarOutlined />}
        />
      </div>

      <SectionCard title="靜音規則列表">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {silences.map((silence) => {
            const active = silence.is_enabled && isActive(silence);
            return (
              <div
                key={silence.id}
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)'
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <Space size="small" wrap>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {silence.name}
                      </Typography.Title>
                      <Tag bordered={false} color="geekblue">
                        {SILENCE_TYPE_LABEL[silence.silence_type ?? ''] || silence.silence_type}
                      </Tag>
                      <Tag bordered={false} color="volcano">
                        {SCOPE_LABEL[silence.scope ?? ''] || silence.scope}
                      </Tag>
                    </Space>
                    <Badge status={active ? 'processing' : 'default'} text={active ? '靜音中' : '未生效'} />
                  </div>

                  <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                    {silence.description || '未提供描述'}
                  </Typography.Paragraph>

                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <Typography.Text style={{ color: 'var(--text-tertiary)' }}>匹配條件</Typography.Text>
                    <Typography.Text>{formatMatcher(silence)}</Typography.Text>
                  </Space>

                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    <Typography.Text style={{ color: 'var(--text-tertiary)' }}>時間區段</Typography.Text>
                    <Typography.Text>
                      {dayjs(silence.start_time).format('YYYY/MM/DD HH:mm')} ~{' '}
                      {dayjs(silence.end_time).format('YYYY/MM/DD HH:mm')} ({silence.timezone})
                    </Typography.Text>
                    <Typography.Text type="secondary">{formatRepeat(silence)}</Typography.Text>
                  </Space>

                  <Space direction="horizontal" size="large" wrap>
                    <Tag color={silence.notify_on_start ? 'blue' : 'default'} bordered={false}>
                      開始通知 {silence.notify_on_start ? '已啟用' : '未啟用'}
                    </Tag>
                    <Tag color={silence.notify_on_end ? 'blue' : 'default'} bordered={false}>
                      結束通知 {silence.notify_on_end ? '已啟用' : '未啟用'}
                    </Tag>
                  </Space>
                </Space>
              </div>
            );
          })}

          {!loading && silences.length === 0 ? (
            <Typography.Text type="secondary">目前尚未建立靜音規則。</Typography.Text>
          ) : null}
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
