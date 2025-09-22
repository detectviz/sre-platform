import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { SelectProps } from 'antd';
import {
  DeleteOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import useTagMetadata from '../hooks/useTagMetadata';
import { fetchJson } from '../utils/apiClient';
import type { TagFilter } from '../types/resources';
import type { TagKeyMetadata, TagValueOption, TagValueResponse } from '../types/tags';

const { Text } = Typography;

type FilterOperator = TagFilter['operator'];

const operatorOptions: Array<{ value: FilterOperator; label: string }> = [
  { value: 'eq', label: '等於 (=)' },
  { value: 'neq', label: '不等於 (!=)' },
  { value: 'in', label: '包含於 (in)' },
  { value: 'not_in', label: '不包含於 (not in)' },
  { value: 'regex', label: '符合正則 (=~)' },
  { value: 'not_regex', label: '不符合正則 (!~)' },
];

const MULTI_VALUE_OPERATORS = new Set<FilterOperator>(['in', 'not_in']);
const REGEX_OPERATORS = new Set<FilterOperator>(['regex', 'not_regex']);

const generateRowId = () => `smart-filter-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const determineDefaultOperator = (metadata?: TagKeyMetadata): FilterOperator => {
  if (!metadata) {
    return 'eq';
  }
  if (metadata.valueMode === 'ENUM' || metadata.valueMode === 'DYNAMIC') {
    return 'in';
  }
  return 'eq';
};

const sanitizeValues = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));

const safeCreateRegex = (pattern: string) => {
  try {
    return new RegExp(pattern);
  } catch (_error) {
    return null;
  }
};

type BuilderRow = TagFilter & {
  id: string;
  error?: string | null;
};

type SmartFilterBuilderProps = {
  value: TagFilter[];
  onApply: (filters: TagFilter[]) => void;
  disabled?: boolean;
};

type ValueOptionType = TagValueOption & { usageCount?: number };

const createEmptyRow = (): BuilderRow => ({
  id: generateRowId(),
  key: '',
  operator: 'eq' as FilterOperator,
  values: [],
  error: null,
});

const SmartFilterBuilder = ({ value, onApply, disabled }: SmartFilterBuilderProps) => {
  const { message } = AntdApp.useApp();
  const { tags, loading: tagLoading, error: tagError, isFallback, refresh } = useTagMetadata();
  const [rows, setRows] = useState<BuilderRow[]>(() => (value.length > 0
    ? value.map((filter) => ({ ...filter, id: generateRowId(), values: [...filter.values], error: null }))
    : [createEmptyRow()]
  ));
  const [valueOptionsMap, setValueOptionsMap] = useState<Record<string, ValueOptionType[]>>({});
  const [pendingKeys, setPendingKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (value.length === 0) {
      setRows([createEmptyRow()]);
      return;
    }
    setRows((prevRows) => value.map((filter, index) => ({
      id: prevRows[index]?.id ?? generateRowId(),
      key: filter.key,
      operator: filter.operator,
      values: [...filter.values],
      error: null,
    })));
  }, [value]);

  useEffect(() => {
    setValueOptionsMap((previous) => {
      const next = { ...previous };
      tags.forEach((tag) => {
        if (tag.allowedValues && tag.allowedValues.length > 0 && !next[tag.key]) {
          next[tag.key] = tag.allowedValues.map((option) => ({
            value: option.value,
            label: option.label ?? option.value,
            color: option.color ?? null,
            usageCount: option.usageCount,
          }));
        }
      });
      return next;
    });
  }, [tags]);

  const tagMap = useMemo(() => new Map(tags.map((tag) => [tag.key, tag])), [tags]);
  const keyOptions = useMemo(() => tags.map((tag) => ({
    value: tag.key,
    label: tag.label ?? tag.key,
    data: tag,
  })), [tags]);

  const renderKeyOption: NonNullable<SelectProps['optionRender']> = (option) => {
    const metadata = (option as unknown as { data?: TagKeyMetadata }).data;
    return (
      <Space size={8}>
        <span>{option.label}</span>
        {typeof metadata?.usageCount === 'number' && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            使用 {metadata.usageCount}
          </Text>
        )}
      </Space>
    );
  };

  const ensureValueOptions = async (key: string) => {
    if (!key || valueOptionsMap[key] || pendingKeys[key]) {
      return;
    }
    setPendingKeys((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetchJson<TagValueResponse>(`/tags/${encodeURIComponent(key)}/values?limit=100`);
      if (Array.isArray(response?.items)) {
        setValueOptionsMap((prev) => ({
          ...prev,
          [key]: response.items.map((item) => ({
            value: item.value,
            label: item.label ?? item.value,
            color: item.color ?? null,
            usageCount: item.usage_count,
          })),
        }));
        return;
      }
    } catch (_error) {
      const metadata = tagMap.get(key);
      const sampleValues = metadata?.sampleValues ?? [];
      if (sampleValues.length > 0) {
        setValueOptionsMap((prev) => ({
          ...prev,
          [key]: sampleValues.map((item) => ({
            value: item.value,
            label: item.label ?? item.value,
            color: item.color ?? null,
            usageCount: item.usageCount,
          })),
        }));
      }
    } finally {
      setPendingKeys((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleAddRow = () => {
    setRows((prev) => ([
      ...prev,
      createEmptyRow(),
    ]));
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [createEmptyRow()];
      }
      return prev.filter((row) => row.id !== id);
    });
  };

  const handleKeyChange = (id: string, key: string) => {
    const metadata = tagMap.get(key);
    const defaultOperator = determineDefaultOperator(metadata);
    setRows((prev) => prev.map((row) => (row.id === id
      ? {
          ...row,
          key,
          operator: defaultOperator,
          values: [],
          error: null,
        }
      : row
    )));
    if (key) {
      ensureValueOptions(key);
    }
  };

  const handleOperatorChange = (id: string, operator: FilterOperator) => {
    setRows((prev) => prev.map((row) => (row.id === id
      ? {
          ...row,
          operator,
          values: MULTI_VALUE_OPERATORS.has(operator) ? row.values : row.values.slice(0, 1),
          error: null,
        }
      : row
    )));
  };

  const handleValueChange = (id: string, value: string | string[] | undefined) => {
    const valuesArray = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? [value]
        : [];
    setRows((prev) => prev.map((row) => (row.id === id
      ? {
          ...row,
          values: sanitizeValues(valuesArray),
          error: null,
        }
      : row
    )));
  };

  const handleReset = () => {
    setRows([createEmptyRow()]);
    onApply([]);
  };

  const validateRows = (inputRows: BuilderRow[]) => {
    const validatedRows = inputRows.map((row) => {
      if (!row.key) {
        return { ...row, error: null };
      }
      const values = sanitizeValues(row.values);
      if (MULTI_VALUE_OPERATORS.has(row.operator)) {
        if (values.length === 0) {
          return { ...row, error: '請選擇至少一個值' };
        }
        return { ...row, values, error: null };
      }
      if (REGEX_OPERATORS.has(row.operator)) {
        const pattern = values[0] ?? '';
        if (!pattern) {
          return { ...row, values: [], error: '請輸入正則表達式' };
        }
        const regex = safeCreateRegex(pattern);
        if (!regex) {
          return { ...row, values: [pattern], error: '正則表達式格式錯誤' };
        }
        return { ...row, values: [pattern], error: null };
      }
      const primary = values[0];
      if (!primary) {
        return { ...row, values: [], error: '請輸入值' };
      }
      return { ...row, values: [primary], error: null };
    });
    return validatedRows;
  };

  const handleApply = () => {
    const validated = validateRows(rows);
    setRows(validated);

    const hasError = validated.some((row) => row.error);
    if (hasError) {
      message.error('請先修正篩選條件的錯誤');
      return;
    }

    const sanitized = validated
      .filter((row) => row.key && (row.values.length > 0 || MULTI_VALUE_OPERATORS.has(row.operator)))
      .map((row) => ({
        key: row.key,
        operator: row.operator,
        values: row.values,
      }));

    onApply(sanitized);
    message.success('已套用智慧標籤篩選');
  };

  const renderValueInput = (row: BuilderRow, metadata?: TagKeyMetadata) => {
    const isMulti = MULTI_VALUE_OPERATORS.has(row.operator);
    const isRegex = REGEX_OPERATORS.has(row.operator);
    const options = valueOptionsMap[row.key]
      || metadata?.allowedValues
      || metadata?.sampleValues;
    const selectOptions = options?.map((option) => ({
      value: option.value,
      label: option.label ?? option.value,
      data: option,
    }));

    const renderValueOption: NonNullable<SelectProps['optionRender']> = (option) => {
      const optionData = (option as unknown as { data?: ValueOptionType }).data;
      return (
        <Space size={8}>
          {optionData?.color ? <Tag color={optionData.color}>{option.label}</Tag> : <span>{option.label}</span>}
          {typeof optionData?.usageCount === 'number' && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              使用 {optionData.usageCount}
            </Text>
          )}
        </Space>
      );
    };

    if (isRegex) {
      return (
        <Input
          placeholder="輸入正則表達式"
          value={row.values[0] ?? ''}
          onChange={(event) => handleValueChange(row.id, event.target.value)}
          disabled={disabled}
          allowClear
        />
      );
    }

    if (metadata?.valueMode === 'ENUM' || metadata?.valueMode === 'DYNAMIC' || selectOptions) {
      const selectValue = (isMulti ? row.values : row.values[0] ?? undefined) as SelectProps['value'];
      return (
        <Select
          mode={isMulti ? 'multiple' : undefined}
          value={selectValue}
          options={selectOptions}
          loading={Boolean(pendingKeys[row.key])}
          showSearch
          disabled={disabled}
          placeholder="選擇或輸入標籤值"
          filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          onDropdownVisibleChange={(open) => {
            if (open && row.key) {
              ensureValueOptions(row.key);
            }
          }}
          onFocus={() => row.key && ensureValueOptions(row.key)}
          onChange={(value) => handleValueChange(row.id, value)}
          allowClear
          optionRender={renderValueOption}
        />
      );
    }

    return (
      <Input
        placeholder="輸入值"
        value={row.values[0] ?? ''}
        onChange={(event) => handleValueChange(row.id, event.target.value)}
        disabled={disabled}
        allowClear
      />
    );
  };

  return (
    <Card
      size="small"
      title={(
        <Space>
          <FilterOutlined />
          <span>智慧標籤篩選</span>
        </Space>
      )}
      extra={(
        <Space size={8}>
          <Tooltip title="重新整理標籤定義">
            <Button icon={<ReloadOutlined />} size="small" onClick={refresh} disabled={tagLoading} />
          </Tooltip>
          <Button icon={<PlusOutlined />} size="small" onClick={handleAddRow} disabled={disabled}>
            新增條件
          </Button>
        </Space>
      )}
      style={{ width: '100%' }}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {isFallback && (
          <Alert
            type="info"
            showIcon
            message="目前顯示為離線標籤資料"
          />
        )}
        {Boolean(tagError) && !tagLoading && (
          <Alert
            type="error"
            showIcon
            message="無法載入標籤定義"
            description={tagError instanceof Error ? tagError.message : '請稍後再試'}
          />
        )}
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          {rows.map((row, index) => {
            const metadata = row.key ? tagMap.get(row.key) : undefined;
            return (
              <Card
                key={row.id}
                size="small"
                bordered
                bodyStyle={{ padding: 12 }}
              >
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={8} md={5}>
                    <Select
                      showSearch
                      placeholder="選擇標籤鍵"
                      value={row.key || undefined}
                      onChange={(key) => handleKeyChange(row.id, key)}
                      disabled={disabled}
                      options={keyOptions}
                      optionRender={renderKeyOption}
                      filterOption={(input, option) => String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                      allowClear
                    />
                  </Col>
                  <Col xs={24} sm={6} md={4}>
                    <Select
                      value={row.operator}
                      options={operatorOptions}
                      onChange={(operator) => handleOperatorChange(row.id, operator as FilterOperator)}
                      disabled={disabled || !row.key}
                    />
                  </Col>
                  <Col xs={24} sm={10} md={12}>
                    {renderValueInput(row, metadata)}
                  </Col>
                  <Col xs={24} sm={24} md={3}>
                    <Space>
                      <Tooltip title="移除此條件">
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveRow(row.id)}
                          disabled={disabled}
                        />
                      </Tooltip>
                    </Space>
                  </Col>
                </Row>
                {metadata?.validationRegex && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    驗證規則：{metadata.validationRegex}
                  </Text>
                )}
                {row.error && (
                  <Alert
                    type="error"
                    showIcon
                    style={{ marginTop: 12 }}
                    message={row.error}
                  />
                )}
                {index < rows.length - 1 && <div style={{ height: 8 }} />}
              </Card>
            );
          })}
        </Space>
        <Space size={12}>
          <Button onClick={handleReset} disabled={disabled}>
            清除條件
          </Button>
          <Button type="primary" onClick={handleApply} disabled={disabled}>
            套用
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default SmartFilterBuilder;
