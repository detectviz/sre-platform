import { Table } from 'antd';
import type { TableProps } from 'antd/es/table';
import type { ReactNode } from 'react';

export type DataTableProps<RecordType extends object> = TableProps<RecordType> & {
  /** 表格標題區域，可自訂複雜內容 */
  titleContent?: ReactNode;
  /** 是否顯示包裹容器預設樣式 */
  glass?: boolean;
};

export const DataTable = <RecordType extends object>({
  titleContent,
  className,
  glass = true,
  ...props
}: DataTableProps<RecordType>) => (
  <div className={`${glass ? 'glass-surface table-wrapper' : 'table-wrapper'} ${className ?? ''}`.trim()}>
    {titleContent && (
      <div className="table-toolbar">
        {titleContent}
      </div>
    )}
    <Table<RecordType>
      pagination={{ pageSize: 10, showSizeChanger: false, ...props.pagination }}
      {...props}
    />
  </div>
);

export default DataTable;
