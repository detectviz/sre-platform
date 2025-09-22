import {
  AlertOutlined,
  ApiOutlined,
  RobotOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { Badge, Button, Divider, Space, Switch, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { KpiCard, PageContainer, PageHeader, SectionCard } from '../../components';
import { useEventRules } from '../../hooks';
import type { EventRule } from '../../hooks';

const severityColor: Record<string, string> = {
  critical: 'magenta',
  warning: 'volcano',
  info: 'geekblue'
};

const renderConditionSummary = (rule: EventRule) => {
  const phrases = rule.condition_groups?.flatMap((group) =>
    group.conditions?.map((condition) => {
      const unit = condition.unit ? condition.unit : '';
      const duration = condition.duration_minutes ? ` 持續 ${condition.duration_minutes} 分鐘` : '';
      return `${condition.metric} ${condition.comparison} ${condition.threshold}${unit}${duration}`;
    }) ?? []
  );
  return phrases && phrases.length > 0 ? phrases.join('；') : '尚未設定條件';
};

const renderLabelSummary = (rule: EventRule) => {
  if (!rule.label_selectors || rule.label_selectors.length === 0) {
    return '未設定標籤條件';
  }
  return rule.label_selectors
    .map((label) => `${label.key} ${label.operator === 'equals' ? '=' : label.operator} ${label.value ?? ''}`)
    .join('、');
};

export const EventRulesPage = () => {
  const { data, loading } = useEventRules();
  const rules = data?.items ?? [];

  const stats = useMemo(() => {
    const enabled = rules.filter((rule) => rule.enabled).length;
    const critical = rules.filter((rule) => rule.severity === 'critical').length;
    const automationEnabled = rules.filter((rule) => rule.automation_enabled).length;
    return {
      total: rules.length,
      enabled,
      critical,
      automationEnabled
    };
  }, [rules]);

  return (
    <PageContainer>
      <PageHeader
        title="事件規則"
        subtitle="檢視指標監控條件、標籤範圍與自動化觸發設定。"
        icon={<SafetyCertificateOutlined />}
        actions={
          <Button type="primary" icon={<ApiOutlined />} disabled>
            建立事件規則
          </Button>
        }
      />

      <div className="kpi-grid">
        <KpiCard
          title="規則總數"
          value={stats.total}
          unit="條"
          status="normal"
          description={`啟用 ${stats.enabled} 條 / 停用 ${stats.total - stats.enabled} 條`}
          icon={<SafetyCertificateOutlined />}
        />
        <KpiCard
          title="Critical 覆蓋"
          value={stats.critical}
          unit="條"
          status={stats.critical > 0 ? 'warning' : 'normal'}
          description="確保高風險指標具備告警規則"
          icon={<AlertOutlined />}
        />
        <KpiCard
          title="自動化啟用"
          value={stats.automationEnabled}
          unit="條"
          status={stats.automationEnabled > 0 ? 'success' : 'normal'}
          description="支援事件觸發即時執行修復腳本"
          icon={<RobotOutlined />}
        />
      </div>

      <SectionCard title="規則列表" extra={<Badge status="processing" text={`${stats.enabled} 條已啟用`} />}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {rules.map((rule) => (
            <div
              key={rule.id}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <Space size="middle" align="start">
                  <Typography.Title level={5} style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {rule.name}
                  </Typography.Title>
                  <Tag color={severityColor[rule.severity ?? ''] || 'default'} bordered={false}>
                    {rule.severity?.toUpperCase()}
                  </Tag>
                  {rule.automation_enabled ? (
                    <Tag color="processing" bordered={false} icon={<RobotOutlined />}>自動化</Tag>
                  ) : null}
                </Space>
                <Switch checked={rule.enabled} checkedChildren="啟用" unCheckedChildren="停用" disabled />
              </div>

              <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
                {rule.description || '未撰寫說明'}
              </Typography.Paragraph>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Typography.Text style={{ color: 'var(--text-tertiary)' }}>標籤條件</Typography.Text>
                  <Typography.Text>{renderLabelSummary(rule)}</Typography.Text>
                </Space>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Typography.Text style={{ color: 'var(--text-tertiary)' }}>觸發條件</Typography.Text>
                  <Typography.Text>{renderConditionSummary(rule)}</Typography.Text>
                </Space>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Typography.Text style={{ color: 'var(--text-tertiary)' }}>自動化設定</Typography.Text>
                  <Typography.Text>
                    {rule.automation_enabled
                      ? `腳本 ${rule.script_name ?? rule.script_id ?? '未指定'}，參數 ${JSON.stringify(
                          rule.automation_parameters ?? {}
                        )}`
                      : '未啟用自動化'}
                  </Typography.Text>
                </Space>
              </Space>
            </div>
          ))}

          {!loading && rules.length === 0 ? (
            <Typography.Text type="secondary">目前尚未建立事件規則。</Typography.Text>
          ) : null}
        </Space>
      </SectionCard>
    </PageContainer>
  );
};
