import React from 'react';
import { Input, Button, Row, Col } from 'antd';

const { Search } = Input;

interface TeamsFilterProps {
  onApplyFilters: (filters: { search?: string }) => void;
  onAddTeam: () => void;
}

/**
 * 團隊管理篩選及操作元件
 */
const TeamsFilter: React.FC<TeamsFilterProps> = ({ onApplyFilters, onAddTeam }) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Search
          placeholder="搜尋團隊名稱"
          onSearch={(value) => onApplyFilters({ search: value })}
          style={{ width: 240 }}
          allowClear
        />
      </Col>
      <Col>
        <Button type="primary" onClick={onAddTeam}>
          新增團隊
        </Button>
      </Col>
    </Row>
  );
};

export default TeamsFilter;
