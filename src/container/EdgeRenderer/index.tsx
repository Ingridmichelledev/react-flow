import React, { memo, CSSProperties, useCallback } from 'react';
import shallow from 'zustand/shallow';

import { useStore } from '../../store';
import ConnectionLine from '../../components/ConnectionLine/index';
import MarkerDefinitions from './MarkerDefinitions';
import { getEdgePositions, getHandle, getSourceTargetNodes, isEdgeVisible } from './utils';
import {
  Position,
  Edge,
  Connection,
  ConnectionLineType,
  ConnectionLineComponent,
  ConnectionMode,
  OnEdgeUpdateFunc,
  ReactFlowState,
  NodeHandleBounds,
} from '../../types';

interface EdgeRendererProps {
  edgeTypes: any;
  connectionLineType: ConnectionLineType;
  connectionLineStyle?: CSSProperties;
  connectionLineComponent?: ConnectionLineComponent;
  onEdgeClick?: (event: React.MouseEvent, node: Edge) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  arrowHeadColor: string;
  markerEndId?: string;
  onlyRenderVisibleElements: boolean;
  onEdgeUpdate?: OnEdgeUpdateFunc;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeUpdateStart?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeUpdateEnd?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
}

interface EdgeWrapperProps {
  edge: Edge;
  edgeTypes: any;
  markerEndId?: string;
  onEdgeClick?: (event: React.MouseEvent, node: Edge) => void;
  onEdgeContextMenu?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: React.MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeUpdateStart?: (event: React.MouseEvent, edge: Edge) => void;
  onEdgeUpdateEnd?: (event: MouseEvent, edge: Edge) => void;
  onEdgeUpdate?: OnEdgeUpdateFunc;
  elementsSelectable: boolean;
  connectionMode?: ConnectionMode;
  sourceNodeWidth?: number | null;
  sourceNodeHeight?: number | null;
  sourceNodeX?: number;
  sourceNodeY?: number;
  sourceNodeHandleBounds?: NodeHandleBounds;
  targetNodeWidth?: number | null;
  targetNodeHeight?: number | null;
  targetNodeX?: number;
  targetNodeY?: number;
  targetNodeHandleBounds?: NodeHandleBounds;
}

const Edge = memo(
  ({
    edge,
    edgeTypes,
    markerEndId,
    onEdgeClick,
    onEdgeContextMenu,
    onEdgeMouseEnter,
    onEdgeMouseMove,
    onEdgeMouseLeave,
    edgeUpdaterRadius,
    onEdgeDoubleClick,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    onEdgeUpdate,
    connectionMode,
    elementsSelectable,
    sourceNodeWidth,
    sourceNodeHeight,
    sourceNodeX,
    sourceNodeY,
    sourceNodeHandleBounds,
    targetNodeWidth,
    targetNodeHeight,
    targetNodeX,
    targetNodeY,
    targetNodeHandleBounds,
  }: EdgeWrapperProps) => {
    const sourceHandleId = edge.sourceHandle || null;
    const targetHandleId = edge.targetHandle || null;

    const onConnectEdge = useCallback(
      (connection: Connection) => {
        onEdgeUpdate?.(edge, connection);
      },
      [edge, onEdgeUpdate]
    );

    // source and target node need to be initialized
    if (!sourceNodeHandleBounds || !targetNodeHandleBounds) {
      return null;
    }

    if (
      !sourceNodeWidth ||
      !sourceNodeHeight ||
      typeof sourceNodeX === 'undefined' ||
      typeof sourceNodeY === 'undefined'
    ) {
      console.warn(`couldn't create edge for source id: ${edge.source}; edge id: ${edge.id}`);
      return null;
    }

    if (
      !targetNodeWidth ||
      !targetNodeHeight ||
      typeof targetNodeX === 'undefined' ||
      typeof targetNodeY === 'undefined'
    ) {
      console.warn(`couldn't create edge for target id: ${edge.target}; edge id: ${edge.id}`);
      return null;
    }

    const edgeType = edge.type || 'default';
    const EdgeComponent = edgeTypes[edgeType] || edgeTypes.default;
    // when connection type is loose we can define all handles as sources
    const targetNodeHandles =
      connectionMode === ConnectionMode.Strict
        ? targetNodeHandleBounds.target
        : targetNodeHandleBounds.target || targetNodeHandleBounds.source;
    const sourceHandle = getHandle(sourceNodeHandleBounds.source!, sourceHandleId);
    const targetHandle = getHandle(targetNodeHandles!, targetHandleId);
    const sourcePosition = sourceHandle ? sourceHandle.position : Position.Bottom;
    const targetPosition = targetHandle ? targetHandle.position : Position.Top;

    if (!sourceHandle) {
      console.warn(`couldn't create edge for source handle id: ${sourceHandleId}; edge id: ${edge.id}`);
      return null;
    }

    if (!targetHandle) {
      console.warn(`couldn't create edge for target handle id: ${targetHandleId}; edge id: ${edge.id}`);
      return null;
    }

    const { sourceX, sourceY, targetX, targetY } = getEdgePositions(
      { x: sourceNodeX, y: sourceNodeY, width: sourceNodeWidth, height: sourceNodeHeight },
      sourceHandle,
      sourcePosition,
      { x: targetNodeX, y: targetNodeY, width: targetNodeWidth, height: targetNodeHeight },
      targetHandle,
      targetPosition
    );

    return (
      <EdgeComponent
        key={edge.id}
        id={edge.id}
        className={edge.className}
        type={edgeType}
        data={edge.data}
        onClick={onEdgeClick}
        isSelected={!!edge.isSelected}
        animated={edge.animated}
        label={edge.label}
        labelStyle={edge.labelStyle}
        labelShowBg={edge.labelShowBg}
        labelBgStyle={edge.labelBgStyle}
        labelBgPadding={edge.labelBgPadding}
        labelBgBorderRadius={edge.labelBgBorderRadius}
        style={edge.style}
        arrowHeadType={edge.arrowHeadType}
        source={edge.source}
        target={edge.target}
        sourceHandleId={sourceHandleId}
        targetHandleId={targetHandleId}
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        elementsSelectable={elementsSelectable}
        markerEndId={markerEndId}
        isHidden={edge.isHidden}
        onConnectEdge={onConnectEdge}
        handleEdgeUpdate={typeof onEdgeUpdate !== 'undefined'}
        onContextMenu={onEdgeContextMenu}
        onMouseEnter={onEdgeMouseEnter}
        onMouseMove={onEdgeMouseMove}
        onMouseLeave={onEdgeMouseLeave}
        edgeUpdaterRadius={edgeUpdaterRadius}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
      />
    );
  }
);

const selector = (s: ReactFlowState) => ({
  transform: s.transform,
  connectionNodeId: s.connectionNodeId,
  connectionHandleId: s.connectionHandleId,
  connectionHandleType: s.connectionHandleType,
  connectionPosition: s.connectionPosition,
  nodesConnectable: s.nodesConnectable,
  elementsSelectable: s.elementsSelectable,
  width: s.width,
  height: s.height,
  connectionMode: s.connectionMode,
  nodes: s.nodes,
});

const EdgeRenderer = (props: EdgeRendererProps) => {
  const {
    transform,
    connectionNodeId,
    connectionHandleId,
    connectionHandleType,
    connectionPosition,
    nodesConnectable,
    elementsSelectable,
    width,
    height,
    connectionMode,
    nodes,
  } = useStore(selector, shallow);

  const edges = useStore(
    useCallback(
      (s: ReactFlowState) => {
        if (!props.onlyRenderVisibleElements) {
          return s.edges;
        }

        return s.edges.filter((e) => {
          const { sourceNode, targetNode } = getSourceTargetNodes(e, s.nodes);

          return (
            sourceNode?.width &&
            sourceNode?.height &&
            targetNode?.width &&
            targetNode?.height &&
            isEdgeVisible({
              sourcePos: sourceNode.position,
              targetPos: targetNode.position,
              sourceWidth: sourceNode.width,
              sourceHeight: sourceNode.height,
              targetWidth: targetNode.width,
              targetHeight: targetNode.height,
              width: s.width,
              height: s.height,
              transform: s.transform,
            })
          );
        });
      },
      [props.onlyRenderVisibleElements]
    )
  );

  if (!width) {
    return null;
  }

  const { connectionLineType, arrowHeadColor, connectionLineStyle, connectionLineComponent } = props;
  const renderConnectionLine = connectionNodeId && connectionHandleType;

  return (
    <svg width={width} height={height} className="react-flow__edges">
      <MarkerDefinitions color={arrowHeadColor} />
      <g transform={`translate(${transform[0]},${transform[1]}) scale(${transform[2]})`}>
        {edges.map((edge: Edge) => {
          const { sourceNode, targetNode } = getSourceTargetNodes(edge, nodes);
          return (
            <Edge
              key={edge.id}
              edge={edge}
              sourceNodeWidth={sourceNode?.width}
              sourceNodeHeight={sourceNode?.height}
              sourceNodeX={sourceNode?.position.x}
              sourceNodeY={sourceNode?.position.y}
              sourceNodeHandleBounds={sourceNode?.handleBounds}
              targetNodeWidth={targetNode?.width}
              targetNodeHeight={targetNode?.height}
              targetNodeX={targetNode?.position.x}
              targetNodeY={targetNode?.position.y}
              targetNodeHandleBounds={targetNode?.handleBounds}
              elementsSelectable={elementsSelectable}
              markerEndId={props.markerEndId}
              onEdgeContextMenu={props.onEdgeContextMenu}
              onEdgeMouseEnter={props.onEdgeMouseEnter}
              onEdgeMouseMove={props.onEdgeMouseMove}
              onEdgeMouseLeave={props.onEdgeMouseLeave}
              edgeUpdaterRadius={props.edgeUpdaterRadius}
              onEdgeDoubleClick={props.onEdgeDoubleClick}
              onEdgeUpdateStart={props.onEdgeUpdateStart}
              onEdgeUpdateEnd={props.onEdgeUpdateEnd}
              onEdgeUpdate={props.onEdgeUpdate}
              edgeTypes={props.edgeTypes}
              connectionMode={connectionMode}
            />
          );
        })}
        {renderConnectionLine && (
          <ConnectionLine
            connectionNodeId={connectionNodeId!}
            connectionHandleId={connectionHandleId}
            connectionHandleType={connectionHandleType!}
            connectionPositionX={connectionPosition.x}
            connectionPositionY={connectionPosition.y}
            transform={transform}
            connectionLineStyle={connectionLineStyle}
            connectionLineType={connectionLineType}
            isConnectable={nodesConnectable}
            CustomConnectionLineComponent={connectionLineComponent}
          />
        )}
      </g>
    </svg>
  );
};

EdgeRenderer.displayName = 'EdgeRenderer';

export default memo(EdgeRenderer);
