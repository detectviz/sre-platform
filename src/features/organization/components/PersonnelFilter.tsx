import React from 'react';
import { Input, Button, Row, Col } from 'antd';

const { Search } = Input;

interface PersonnelFilterProps {
  onApplyFilters: (filters: { search?: string }) => void;
  onAddPersonnel: () => void;
}

/**
 * 人員管理篩選及操作元件
 */
const PersonnelFilter: React.FC<PersonnelFilterProps> = ({ onApplyFilters, onAddPersonnel }) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
      <Col>
        <Search
          placeholder="搜尋姓名或團隊"
          onSearch={(value) => onApplyFilters({ search: value })}
          style={{ width: 240 }}
          allowClear
        />
      </Col>
      <Col>
        <Button type="primary" onClick={onAddPersonnel}>
          新增人員
        </Button>
      </Col>
    </Row>
  );
};

export default PersonnelFilter;
