import React from 'react';
import { Input, Button, Space, Row, Col, Select } from 'antd';

const { Search } = Input;
const { Option } = Select;

interface ResourceFiltersProps {
  onSearch: (searchTerm: string) => void;
  onAdd: () => void;
  onScan: () => void;
  onFilterChange: (filterType: string, value: string) => void;
}

/**
 * 資源管理頁面的篩選和操作列
 */
const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  onSearch,
  onAdd,
  onScan,
  onFilterChange,
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col>
          <Space>
            <Search
              placeholder="搜尋資源名稱或 IP..."
              onSearch={onSearch}
              style={{ width: 250 }}
            />
            <Select
              placeholder="依狀態篩選"
              style={{ width: 150 }}
              onChange={(value) => onFilterChange('status', value)}
              allowClear
            >
              <Option value="healthy">正常</Option>
              <Option value="warning">警告</Option>
              <Option value="critical">異常</Option>
            </Select>
            {/* 可以在此處加入更多篩選器，例如資源類型 */}
          </Space>
        </Col>
        <Col>
          <Space>
            <Button onClick={onScan}>掃描網路</Button>
            <Button type="primary" onClick={onAdd}>
              新增資源
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default ResourceFilters;
