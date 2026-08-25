import React from 'react';
import { ColumnsProps, DataTypes } from './types';

const Columns: React.FC<ColumnsProps> = ({ item, index, columnOpt, sorting, columns, type, edit }) => {
  const customRender = (opts: any, data: DataTypes, idx: number): React.ReactNode => {
    const { key, render } = opts as any;
    if (React.isValidElement(render) || typeof render === 'string') {
      return render as any;
    } else if (typeof render === 'function') {
      return render((data as any)[key], data, idx);
    }
    return null;
  };

  return (
    <li id={`${type}_${index}`} {...(columnOpt ? (columnOpt(item, index) as any) : {})}>
      {columns && columns.map((column) => (
        <span
          key={column.key}
          className="column-item"
          style={{ width: column.width, textAlign: column.align } as React.CSSProperties}
          title={(item as any)[column.key] || ''}
        >
          {customRender(column as any, item as DataTypes, index) || (item as any)[column.key]}
        </span>
      ))}
      <div style={{ visibility: edit && (item as any).iconShow }} className={`column-icon ${type}-column-icon ${sorting ? 'sorting' : ''} ${edit ? '' : 'disabled'}`} />
    </li>
  );
};

export default Columns;
