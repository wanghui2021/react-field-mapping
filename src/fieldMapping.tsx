import './fieldMapping.less';
import React, { useEffect, useRef, useState } from 'react';
import SourceData from './sourceData';
import TargetData from './targetData';
import DrawLines from './drawLines';
import { calCoord } from './util';
import _ from 'lodash';
import {
  FieldMappingProps,
  FieldMappingState,
  DataTypes,
  OneRelation
} from './types';

const FieldMapping: React.FC<FieldMappingProps> = (props) => {
  const sourceComRef = useRef<any>(null);
  const targetComRef = useRef<any>(null);

  const [relation, setRelation] = useState<OneRelation[]>(props.relation || []);
  const [currentRelation, setCurrentRelation] = useState<OneRelation | undefined>(undefined);
  const [iconStatus, setIconStatus] = useState<any>(undefined);

  // helper: mirror previous changeRelation behavior
  const changeRelation = (newRelation: OneRelation[], isUpdate = true) => {
    setRelation(newRelation);
    if (isUpdate && props.onChange) {
      props.onChange(newRelation);
    }
  };

  const changeIconStatus = (status: any) => {
    setIconStatus(status);
  };

  const uniqWith = (data: any): DataTypes[] => {
    return _.uniqWith(data, (n1: any, n2: any) => n1.key === n2.key).filter((item: any) => !!item.key);
  };

  const overActive = (item: DataTypes, type: string, active: string) => {
    const rel = _.assign([], relation) as any[];
    let cur: any = {};
    rel.map((n) => {
      if (n[type].key === item.key) {
        if (active === 'enter') {
          cur = n;
          return;
        } else if (active === 'leave') {
          cur = {};
        }
      }
    });
    setCurrentRelation(cur);
  };

  const changeSource = (oldIndex: number, newIndex: number) => {
    const sourceData = props.source?.data || [];
    const onChange = props.source?.onChange || (() => {});
    let data = _.assign([], sourceData);
    const item = data.slice(oldIndex, oldIndex + 1);
    data.splice(oldIndex, 1);
    const dataS = data.slice(0, newIndex);
    const dataE = data.slice(newIndex, data.length);
    data = dataS.concat(item).concat(dataE);
    onChange(data);
    const relationWithCoord = calCoord(_.assign([], props.relation || []), {
      sourceCom: sourceComRef.current,
      targetCom: targetComRef.current,
      props
    } as any);
    changeRelation(relationWithCoord, false);
  };

  const changeTarget = (oldIndex: number, newIndex: number) => {
    const targetData = props.target?.data || [];
    const onChange = props.target?.onChange || (() => {});
    let data = _.assign([], targetData);
    const item = data.slice(oldIndex, oldIndex + 1);
    data.splice(oldIndex, 1);
    const dataS = data.slice(0, newIndex);
    const dataE = data.slice(newIndex, data.length);
    data = dataS.concat(item).concat(dataE);
    onChange(data);
    const relationWithCoord = calCoord(_.assign([], props.relation || []), {
      sourceCom: sourceComRef.current,
      targetCom: targetComRef.current,
      props
    } as any);
    changeRelation(relationWithCoord, false);
  };

  // watch for prop.relation changes
  useEffect(() => {
    if (props.relation && props.relation !== relation) {
      const relationWithCoord = calCoord(_.assign([], props.relation), {
        sourceCom: sourceComRef.current,
        targetCom: targetComRef.current,
        props
      } as any);
      changeRelation(relationWithCoord, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.relation]);

  // componentDidMount equivalent: initialize relation from props
  useEffect(() => {
    const relationWithCoord = calCoord(_.assign([], props.relation || []), {
      sourceCom: sourceComRef.current,
      targetCom: targetComRef.current,
      props
    } as any);
    if (relationWithCoord && relationWithCoord.length > 0) {
      changeRelation(relationWithCoord, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    source: { data: sourceData = [], columns: sourceCols = [], mutiple: sourceMutiple = false } = {},
    target: { data: targetData = [], columns: targetCols = [], mutiple: targetMutiple = false } = {},
    className = '',
    style = {},
    isSort = false,
    onDrawStart,
    onDrawing,
    onDrawEnd,
    edit,
    closeIcon
  } = props as any;

  const sourceOpt = {
    ref: (me: any) => {
      sourceComRef.current = me;
    },
    iconStatus,
    relation,
    columns: sourceCols,
    data: sourceData,
    currentRelation,
    isSort,
    edit,
    changeData: changeSource,
    overActive
  };

  const targetOpt = {
    ref: (me: any) => {
      targetComRef.current = me;
    },
    iconStatus,
    relation,
    columns: targetCols,
    data: targetData,
    currentRelation,
    isSort,
    edit,
    changeData: changeTarget,
    overActive
  };

  const drawLinesOpt = {
    sourceData,
    targetData,
    sourceMutiple,
    targetMutiple,
    onDrawStart,
    onDrawing,
    onDrawEnd,
    relation,
    edit,
    closeIcon,
    currentRelation,
    onChange: (r: any, isUpdate?: boolean) => changeRelation(r, isUpdate),
    changeIconStatus
  };

  return (
    <div style={style} className={`react-field-mapping-box ${className}`}>
      <SourceData {...sourceOpt} />
      <TargetData {...targetOpt} />
      <DrawLines {...drawLinesOpt} />
    </div>
  );
};

FieldMapping.defaultProps = {
  relation: [],
  source: {
    data: [],
    onChange: (): void => {},
    columns: [],
    mutiple: false
  },
  target: {
    data: [],
    onChange: (): void => {},
    columns: [],
    mutiple: false
  },
  edit: true
};

export default FieldMapping;
