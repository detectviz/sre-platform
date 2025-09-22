import { Table } from 'antd';
import type { TableProps } from 'antd';
import type { ReactNode } from 'react';

export type DataTableProps<RecordType extends object> = TableProps<RecordType> & {
  /** 表格標題區域，可自訂複雜內容 */
  titleContent?: ReactNode;
  /** 附加到外層容器的 class */
  wrapperClassName?: string;
};

/**
 * 具有玻璃擬態效果和自訂工具列的資料表格。
 * 樣式由 global.css 中的 .table-wrapper 和 .table-toolbar class 控制。
 */
export const DataTable = <RecordType extends object>({
  titleContent,
  wrapperClassName,
  ...props
}: DataTableProps<RecordType>) => (
  <div className={`table-wrapper ${wrapperClassName || ''}`.trim()}>
    {titleContent && (
      <div className="table-toolbar">
        {titleContent}
      </div>
    )}
    <Table<RecordType>
      {...props}
      pagination={
        props.pagination === false
          ? false
          : {
              ...props.pagination,
              className: `custom-pagination ${
                props.pagination?.className || ''
              }`.trim(),
            }
      }
    />
  </div>
);

export default DataTable;
