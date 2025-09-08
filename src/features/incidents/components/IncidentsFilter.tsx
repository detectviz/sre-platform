import React, { useState } from 'react';
import { Input, Button, Space, Row, Col, Select, DatePicker } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Filters {
  status?: string;
  severity?: string;
  startTime?: string;
  endTime?: string;
}

interface IncidentsFilterProps {
  onApplyFilters: (filters: Filters) => void;
  onGenerateReport: () => void;
}

/**
 * 告警紀錄頁面的篩選和操作列
 */
const IncidentsFilter: React.FC<IncidentsFilterProps> = ({
  onApplyFilters,
  onGenerateReport,
}) => {
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setFilters(prev => ({
        ...prev,
        startTime: dateStrings[0] ? new Date(dateStrings[0]).toISOString() : undefined,
        endTime: dateStrings[1] ? new Date(dateStrings[1]).toISOString() : undefined,
    }));
  }

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setFilters({});
    onApplyFilters({});
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <Space wrap>
        <RangePicker onChange={handleDateChange} />
        <Select
          placeholder="所有等級"
          style={{ width: 120 }}
          onChange={(value) => handleFilterChange('severity', value)}
          allowClear
        >
          <Option value="critical">高</Option>
          <Option value="error">中</Option>
          <Option value="warning">低</Option>
          <Option value="info">資訊</Option>
        </Select>
        <Select
          placeholder="所有狀態"
          style={{ width: 120 }}
          onChange={(value) => handleFilterChange('status', value)}
          allowClear
        >
          <Option value="new">新告警</Option>
          <Option value="acknowledged">處理中</Option>
          <Option value="resolved">已解決</Option>
        </Select>
        <Button type="primary" onClick={handleApply}>查詢</Button>
        <Button onClick={handleReset}>全部</Button>
        <Button onClick={onGenerateReport} style={{ background: '#722ed1', color: 'white' }}>
            生成事件報告
        </Button>
      </Space>
    </div>
  );
};

export default IncidentsFilter;
