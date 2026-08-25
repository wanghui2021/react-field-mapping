import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import Columns from './Columns';
import { XDataProps, XDataState, DataTypes } from './types';

const SourceData = forwardRef<any, XDataProps>((props, ref) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sortableRef = useRef<any>(null);
  const orderRef = useRef<string[]>([]);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [sorting, setSorting] = useState<boolean>(false);

  // expose { boxEle } to parent via ref
  useImperativeHandle(ref, () => ({
    boxEle: rootRef.current
  }), []);

  // also support legacy prop-based `ref` (some callers passed a prop named ref)
  useEffect(() => {
    const exposed = { boxEle: rootRef.current };
    const pRef: any = (props as any).ref;
    if (typeof pRef === 'function') {
      pRef(exposed);
      return () => pRef(null);
    } else if (pRef && typeof pRef === 'object') {
      pRef.current = exposed;
      return () => { pRef.current = null; };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootRef.current]);

  useEffect(() => {
    const { isSort } = props;
    const ele = rootRef.current && (rootRef.current.querySelector('.column-content') as HTMLElement | null);
    if (isSort && ele) {
      const sortable = new Sortable(ele, {
        onStart: (): void => {
          setSorting(true);
        },
        onEnd: (evt: any): void => {
          // restore original DOM order according to saved order
          if (sortableRef.current) {
            sortableRef.current.sort(orderRef.current);
          }
          props.changeData && props.changeData(evt.oldIndex, evt.newIndex);
          setSorting(false);
        }
      });
      sortableRef.current = sortable;
      orderRef.current = sortable.toArray();
      return () => {
        try {
          sortable.destroy();
        } catch (e) {
          // ignore
        }
        sortableRef.current = null;
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isSort]);

  const show = (data: DataTypes[] = [], relation: any = [], iconStatus: any): DataTypes[] => {
    const arr = iconStatus ? relation.concat(iconStatus) : relation;
    return data.map(item => {
      let iconShow = 'hidden';
      arr.map((n: any) => {
        if (n.key === item.key || (n.source && n.source.key) === item.key) {
          iconShow = 'inherit';
        }
      });
      // create a shallow copy so we don't mutate props directly
      return Object.assign({}, item, { iconShow });
    });
  };

  const isActive = (key: string | undefined): string => {
    const className: string[] = [];
    if (activeKey === key) {
      className.push('active');
    } else if (props.currentRelation && props.currentRelation.source && props.currentRelation.source.key === key) {
      className.push('active');
    }
    return className.join(' ');
  };

  const eventHandle = (item: DataTypes, type: string, nextActiveKey: string | null): void => {
    if (!sorting) {
      setActiveKey(nextActiveKey);
      props.overActive && props.overActive(item, 'source', type);
    }
  };

  const {
    columns,
    data = [],
    iconStatus,
    relation,
    edit
  } = props as any;

  const columnOpt = (item: DataTypes, index: number): unknown => ({
    'data-id': index,
    'data-key': item.key,
    className: isActive(item.key),
    onMouseEnter: () => eventHandle(item, 'enter', item.key),
    onMouseLeave: () => eventHandle(item, 'leave', null)
  });

  const renderContent = show(data, relation, iconStatus);

  return (
    <div className="source-data" ref={rootRef}>
      <ul className="column-title">
        <li>
          {columns && columns.map((column: any, idx: number) => (
            <span
              key={idx}
              className="column-item"
              title={column.title}
              style={{ width: column.width, textAlign: column.align } as React.CSSProperties}
            >
              {column.title}
            </span>
          ))}
        </li>
      </ul>
      <ul className="column-content">
        {renderContent.map((item, index) => (
          <Columns
            columns={columns}
            key={`source_${index}`}
            columnOpt={columnOpt}
            sorting={sorting}
            item={item}
            index={index}
            type="source"
            edit={edit}
          />
        ))}
      </ul>
    </div>
  );
});

export default SourceData;
