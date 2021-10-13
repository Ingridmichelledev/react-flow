import React, { memo, HTMLAttributes } from 'react';
import cc from 'classcat';
import shallow from 'zustand/shallow';

import { useStore } from '../../store';
import { getRectOfNodes, getBoundsofRects } from '../../utils/graph';
import { Node, Rect, ReactFlowState } from '../../types';
import MiniMapNode from './MiniMapNode';

type StringFunc = (node: Node) => string;

export interface MiniMapProps extends HTMLAttributes<SVGSVGElement> {
  nodeColor?: string | StringFunc;
  nodeStrokeColor?: string | StringFunc;
  nodeClassName?: string | StringFunc;
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  maskColor?: string;
}

declare const window: any;

const defaultWidth = 200;
const defaultHeight = 150;

const selector = (s: ReactFlowState) => ({ width: s.width, height: s.height, transform: s.transform, nodes: s.nodes });

const MiniMap = ({
  style,
  className,
  nodeStrokeColor = '#555',
  nodeColor = '#fff',
  nodeClassName = '',
  nodeBorderRadius = 5,
  nodeStrokeWidth = 2,
  maskColor = 'rgb(240, 242, 243, 0.7)',
}: MiniMapProps) => {
  const { width: containerWidth, height: containerHeight, transform, nodes } = useStore(selector, shallow);
  const [tX, tY, tScale] = transform;

  const mapClasses = cc(['react-flow__minimap', className]);
  const elementWidth = (style?.width || defaultWidth)! as number;
  const elementHeight = (style?.height || defaultHeight)! as number;
  const nodeColorFunc = (nodeColor instanceof Function ? nodeColor : () => nodeColor) as StringFunc;
  const nodeStrokeColorFunc = (
    nodeStrokeColor instanceof Function ? nodeStrokeColor : () => nodeStrokeColor
  ) as StringFunc;
  const nodeClassNameFunc = (nodeClassName instanceof Function ? nodeClassName : () => nodeClassName) as StringFunc;
  const hasNodes = nodes && nodes.length;
  const bb = getRectOfNodes(nodes);
  const viewBB: Rect = {
    x: -tX / tScale,
    y: -tY / tScale,
    width: containerWidth / tScale,
    height: containerHeight / tScale,
  };
  const boundingRect = hasNodes ? getBoundsofRects(bb, viewBB) : viewBB;
  const scaledWidth = boundingRect.width / elementWidth;
  const scaledHeight = boundingRect.height / elementHeight;
  const viewScale = Math.max(scaledWidth, scaledHeight);
  const viewWidth = viewScale * elementWidth;
  const viewHeight = viewScale * elementHeight;
  const offset = 5 * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const width = viewWidth + offset * 2;
  const height = viewHeight + offset * 2;
  const shapeRendering = typeof window === 'undefined' || !!window.chrome ? 'crispEdges' : 'geometricPrecision';

  return (
    <svg
      width={elementWidth}
      height={elementHeight}
      viewBox={`${x} ${y} ${width} ${height}`}
      style={style}
      className={mapClasses}
    >
      {nodes
        .filter((node) => !node.isHidden && node.width && node.height)
        .map((node) => (
          <MiniMapNode
            key={node.id}
            x={node.position.x}
            y={node.position.y}
            width={node.width!}
            height={node.height!}
            style={node.style}
            className={nodeClassNameFunc(node)}
            color={nodeColorFunc(node)}
            borderRadius={nodeBorderRadius}
            strokeColor={nodeStrokeColorFunc(node)}
            strokeWidth={nodeStrokeWidth}
            shapeRendering={shapeRendering}
          />
        ))}
      <path
        className="react-flow__minimap-mask"
        d={`M${x - offset},${y - offset}h${width + offset * 2}v${height + offset * 2}h${-width - offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`}
        fill={maskColor}
        fillRule="evenodd"
      />
    </svg>
  );
};

MiniMap.displayName = 'MiniMap';

export default memo(MiniMap);
