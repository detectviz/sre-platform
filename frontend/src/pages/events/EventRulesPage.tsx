import { Card, Descriptions, Space, Switch, Typography } from 'antd';
import { useEventRules } from '../../hooks';

export const EventRulesPage = () => {
  const { data, loading } = useEventRules();

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Typography.Title level={4} className="page-header">
        事件規則
      </Typography.Title>
      {data?.items?.map((rule) => (
        <Card key={rule.id} loading={loading} title={rule.name} bordered={false}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Switch checked={rule.enabled} checkedChildren="啟用" unCheckedChildren="停用" disabled />
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="嚴重性">{rule.severity}</Descriptions.Item>
              <Descriptions.Item label="監控對象">{rule.target_type}</Descriptions.Item>
              <Descriptions.Item label="標籤條件" span={2}>
                {rule.label_selectors?.map((label) => `${label.key}:${label.value}`).join('、') || '未設定'}
              </Descriptions.Item>
              <Descriptions.Item label="條件設定" span={2}>
                {rule.condition_groups
                  ?.flatMap((group) =>
                    group.conditions?.map(
                      (condition) =>
                        `${condition.metric} ${condition.comparison} ${condition.threshold}${condition.unit || ''} 持續 ${condition.duration_minutes || 0} 分鐘`
                    ) || []
                  )
                  .join('；') || '未設定'}
              </Descriptions.Item>
              <Descriptions.Item label="自動化腳本" span={2}>
                {rule.automation_enabled ? rule.script_id || '已啟用' : '未啟用'}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </Card>
      ))}
    </Space>
  );
};
