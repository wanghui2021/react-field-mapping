import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Sortable from 'sortablejs';
import Columns from './Columns';
import { XDataProps, XDataState, DataTypes } from './types';

const TargetData = forwardRef<any, XDataProps>((props, ref) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sortableRef = useRef<any>(null);
  const orderRef = useRef<string[]>([]);

  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [sorting, setSorting] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    boxEle: rootRef.current
  }), []);

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
    return data.map(item => {
      let iconShow = iconStatus ? 'inherit' : 'hidden';
      relation && relation.map((n: any) => {
        if ((n.target && n.target.key) === item.key) {
          iconShow = 'inherit';
        }
      });
      return Object.assign({}, item, { iconShow });
    });
  };

  const isActive = (key: string | undefined): string => {
    if (activeKey === key) {
      return 'active';
    } else if (props.currentRelation && props.currentRelation.target && props.currentRelation.target.key === key) {
      return 'active';
    }
    return '';
  };

  const eventHandle = (item: DataTypes, type: string, nextActiveKey: string | null): void => {
    if (!sorting) {
      setActiveKey(nextActiveKey);
      props.overActive && props.overActive(item, 'target', type);
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
    <div className="target-data" ref={rootRef}>
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
            key={`target_${index}`}
            columnOpt={columnOpt}
            sorting={sorting}
            edit={edit}
            item={item}
            index={index}
            type="target"
          />
        ))}
      </ul>
    </div>
  );
});

export default TargetData;
