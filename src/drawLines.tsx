import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { getOffset } from './util';
import Line from './line';
import _ from 'lodash';
import { DrawLinesProps, OneRelation } from './types';

export interface DomOperateTypes {
  key: string;
  left: number;
  top: number;
}

const DrawLines = forwardRef<any, DrawLinesProps>((props, ref) => {
  const drawEleRef = useRef<HTMLDivElement | null>(null);
  const baseXY = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
  const scrollLeftRef = useRef<number>(0);
  const scrollTopRef = useRef<number>(0);
  const sourceDomRef = useRef<HTMLElement | null>(null);
  const sortableBoxRef = useRef<HTMLElement | null>(null);

  const [drawing, setDrawing] = useState<boolean>(false);
  const [endX, setEndX] = useState<number>(0);
  const [endY, setEndY] = useState<number>(0);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [sourceData, setSourceData] = useState<any>(undefined);

  useImperativeHandle(ref, () => ({
    drawEle: drawEleRef.current
  }), []);

  useEffect(() => {
    baseXY.current = drawEleRef.current ? getOffset(drawEleRef.current) : { left: 0, top: 0 };
    // event handlers
    const onMouseDown = (event: MouseEvent) => {
      const eventDom = event.target as HTMLElement;
      sourceDomRef.current = eventDom;
      const className = (eventDom && (eventDom.className as string)) || '';
      if (className && typeof className === 'string' && className.indexOf('source-column-icon') > -1) {
        event.preventDefault();
        let relation = _.assign([], props.relation || []);
        const key = domOperate(eventDom).key;
        if (!props.sourceMutiple && _.find(relation, (o: any) => o.source.key === key)) {
          return;
        }
        if (baseXY.current.left !== (drawEleRef.current ? getOffset(drawEleRef.current).left : 0) || baseXY.current.top !== (drawEleRef.current ? getOffset(drawEleRef.current).top : 0)) {
          baseXY.current = drawEleRef.current ? getOffset(drawEleRef.current) : baseXY.current;
        }
        let scrollEle: HTMLElement | null = document.querySelector('.react-field-mapping-box');
        document.body.classList.add('user-select-none');
        const sData = _.find(props.sourceData || [], (o: any) => o.key === key);
        props.onDrawStart && props.onDrawStart(sData, props.relation);
        props.changeIconStatus && props.changeIconStatus(sData);
        const { left, top } = domOperate(eventDom);
        setStartX(left);
        setStartY(top);
        setEndX(left);
        setEndY(top);
        setDrawing(true);
        setSourceData(sData);
        scrollTopRef.current = 0;
        scrollLeftRef.current = 0;
        while (scrollEle && scrollEle.tagName !== 'BODY') {
          scrollTopRef.current += scrollEle.scrollTop;
          scrollLeftRef.current += scrollEle.scrollLeft;
          scrollEle = scrollEle.parentElement;
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (drawing) {
        props.onDrawing && props.onDrawing(sourceData, props.relation);
        setEndX(event.pageX - baseXY.current.left + scrollLeftRef.current);
        setEndY(event.pageY - baseXY.current.top + scrollTopRef.current);
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      document.body.classList.remove('user-select-none');
      const eventDom = event.target as HTMLElement;
      const className = (eventDom && (eventDom.className as string)) || '';
      if (className && typeof className === 'string' && className.indexOf('target-column-icon') > -1) {
        let relation = _.assign([], props.relation || []);
        const targetKey = domOperate(eventDom).key;
        const sourceKey = sourceDomRef.current ? domOperate(sourceDomRef.current).key : undefined;
        if ((!props.targetMutiple && _.find(relation, (o: any) => o.target.key === targetKey)) || _.find(relation, (o: any) => o.target.key === targetKey && o.source.key === sourceKey)) {
          props.changeIconStatus && props.changeIconStatus();
          resetState();
          sourceDomRef.current = null;
          return;
        }
        const tData = _.find(props.targetData || [], (o: any) => o.key === targetKey);
        relation.push({
          source: {
            x: startX,
            y: startY,
            ...(sourceData || {})
          },
          target: {
            x: domOperate(eventDom).left,
            y: domOperate(eventDom).top,
            ...(tData || {})
          }
        });
        props.onDrawEnd && props.onDrawEnd(sourceData, tData, relation);
        props.onChange && props.onChange(relation);
        sourceDomRef.current = null;
      }
      props.changeIconStatus && props.changeIconStatus();
      resetState();
    };

    document.documentElement.addEventListener('mousedown', onMouseDown);
    document.documentElement.addEventListener('mousemove', onMouseMove);
    document.documentElement.addEventListener('mouseup', onMouseUp);

    return () => {
      document.documentElement.removeEventListener('mousedown', onMouseDown);
      document.documentElement.removeEventListener('mousemove', onMouseMove);
      document.documentElement.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing, sourceData, startX, startY, props.relation, props.sourceData, props.targetData, props.sourceMutiple, props.targetMutiple]);

  const resetState = () => {
    setDrawing(false);
    setEndX(0);
    setEndY(0);
    setStartX(0);
    setStartY(0);
    setSourceData(undefined);
    scrollLeftRef.current = 0;
    scrollTopRef.current = 0;
  };

  const domOperate = (eventDom: HTMLElement): DomOperateTypes => ({
    key: eventDom.offsetParent.getAttribute('data-key') || '',
    left: getOffset(eventDom).left - baseXY.current.left + 3,
    top: getOffset(eventDom).top - baseXY.current.top + 6
  });

  const removeRelation = (removeNode: any) => {
    const relation = _.assign([], props.relation || []);
    _.remove(relation, (item) => item === removeNode);
    props.onChange && props.onChange(relation);
  };

  const topLine = (item: any) => {
    const relation = _.assign([], props.relation || []);
    _.remove(relation, (n) => n === item);
    relation.push(item);
    props.onChange && props.onChange(relation, false);
  };

  const { relation, currentRelation, edit, closeIcon } = props as any;

  return (
    <div className="lines-area" ref={drawEleRef}>
      <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker
            className="path"
            id="markerArrow"
            markerWidth="12"
            markerHeight="12"
            refX="6"
            refY="6"
            orient="auto">
            <path d="M2,4 L5,6 L2,8 L9,6 L2,4" className="arrow" />
          </marker>
        </defs>
        <g>
          {relation && relation.filter((item: any) => item.source.key && item.target.key).map((item: any) => (
            <Line
              key={`${item.source.key}-${item.target.key}`}
              startX={item.source.x}
              startY={item.source.y}
              endX={item.target.x}
              endY={item.target.y}
              data={item}
              edit={edit}
              closeIcon={closeIcon}
              toTop={topLine}
              currentRelation={currentRelation}
              removeRelation={removeRelation}
            />
          ))}
        </g>
        {drawing && (
          <g className="path">
            <path
              className="line"
              d={`M${startX}, ${startY} L${endX}, ${endY}`}
              strokeDasharray="5,5"
              markerEnd="url(#markerArrow)"
            />
          </g>
        )}
      </svg>

    </div>
  );
});

export default DrawLines;
