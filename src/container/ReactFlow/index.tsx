import React, {
  useMemo,
  CSSProperties,
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  WheelEvent,
  forwardRef,
} from 'react';
import cc from 'classcat';

import GraphView from '../GraphView';
import StoreUpdater from '../../components/StoreUpdater';
import DefaultNode from '../../components/Nodes/DefaultNode';
import InputNode from '../../components/Nodes/InputNode';
import OutputNode from '../../components/Nodes/OutputNode';
import { createNodeTypes } from '../NodeRenderer/utils';
import SelectionListener from '../../components/SelectionListener';
import { BezierEdge, StepEdge, SmoothStepEdge, StraightEdge } from '../../components/Edges';
import { createEdgeTypes } from '../EdgeRenderer/utils';
import Wrapper from './Wrapper';
import {
  Elements,
  NodeTypesType,
  EdgeTypesType,
  OnLoadFunc,
  Node,
  Edge,
  ConnectionMode,
  ConnectionLineType,
  ConnectionLineComponent,
  FlowTransform,
  OnConnectStartFunc,
  OnConnectStopFunc,
  OnConnectEndFunc,
  OnConnectFunc,
  TranslateExtent,
  KeyCode,
  PanOnScrollMode,
  OnEdgeUpdateFunc,
  NodeExtent,
  NodeChange,
  EdgeChange,
} from '../../types';

import '../../style.css';
import '../../theme-default.css';

const defaultNodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
};

const defaultEdgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
};

export interface ReactFlowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onLoad'> {
  nodes: Node[];
  edges: Edge[];
  onNodesChange?: (nodeChanges: NodeChange[]) => void;
  onEdgesChange?: (edgeChanges: EdgeChange[]) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, node: Edge) => void;
  onNodeDoubleClick?: (event: ReactMouseEvent, node: Node) => void;
  onNodeMouseEnter?: (event: ReactMouseEvent, node: Node) => void;
  onNodeMouseMove?: (event: ReactMouseEvent, node: Node) => void;
  onNodeMouseLeave?: (event: ReactMouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: ReactMouseEvent, node: Node) => void;
  onNodeDragStart?: (event: ReactMouseEvent, node: Node) => void;
  onNodeDrag?: (event: ReactMouseEvent, node: Node) => void;
  onNodeDragStop?: (event: ReactMouseEvent, node: Node) => void;
  onConnect?: OnConnectFunc;
  onConnectStart?: OnConnectStartFunc;
  onConnectStop?: OnConnectStopFunc;
  onConnectEnd?: OnConnectEndFunc;
  onLoad?: OnLoadFunc;
  onMove?: (flowTransform?: FlowTransform) => void;
  onMoveStart?: (flowTransform?: FlowTransform) => void;
  onMoveEnd?: (flowTransform?: FlowTransform) => void;
  onSelectionChange?: (elements: Elements | null) => void;
  onSelectionDragStart?: (event: ReactMouseEvent, nodes: Node[]) => void;
  onSelectionDrag?: (event: ReactMouseEvent, nodes: Node[]) => void;
  onSelectionDragStop?: (event: ReactMouseEvent, nodes: Node[]) => void;
  onSelectionContextMenu?: (event: ReactMouseEvent, nodes: Node[]) => void;
  onPaneScroll?: (event?: WheelEvent) => void;
  onPaneClick?: (event: ReactMouseEvent) => void;
  onPaneContextMenu?: (event: ReactMouseEvent) => void;
  nodeTypes?: NodeTypesType;
  edgeTypes?: EdgeTypesType;
  connectionMode?: ConnectionMode;
  connectionLineType?: ConnectionLineType;
  connectionLineStyle?: CSSProperties;
  connectionLineComponent?: ConnectionLineComponent;
  deleteKeyCode?: KeyCode;
  selectionKeyCode?: KeyCode;
  multiSelectionKeyCode?: KeyCode;
  zoomActivationKeyCode?: KeyCode;
  snapToGrid?: boolean;
  snapGrid?: [number, number];
  onlyRenderVisibleElements?: boolean;
  nodesDraggable?: boolean;
  nodesConnectable?: boolean;
  elementsSelectable?: boolean;
  selectNodesOnDrag?: boolean;
  paneMoveable?: boolean;
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
  defaultPosition?: [number, number];
  translateExtent?: TranslateExtent;
  preventScrolling?: boolean;
  nodeExtent?: NodeExtent;
  arrowHeadColor?: string;
  markerEndId?: string;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: PanOnScrollMode;
  zoomOnDoubleClick?: boolean;
  onEdgeUpdate?: OnEdgeUpdateFunc;
  onEdgeContextMenu?: (event: ReactMouseEvent, edge: Edge) => void;
  onEdgeMouseEnter?: (event: ReactMouseEvent, edge: Edge) => void;
  onEdgeMouseMove?: (event: ReactMouseEvent, edge: Edge) => void;
  onEdgeMouseLeave?: (event: ReactMouseEvent, edge: Edge) => void;
  onEdgeDoubleClick?: (event: ReactMouseEvent, edge: Edge) => void;
  onEdgeUpdateStart?: (event: ReactMouseEvent, edge: Edge) => void;
  onEdgeUpdateEnd?: (event: MouseEvent, edge: Edge) => void;
  edgeUpdaterRadius?: number;
}

export type ReactFlowRefType = HTMLDivElement;

const initSnapGrid: [number, number] = [15, 15];
const initDefaultPosition: [number, number] = [0, 0];

const ReactFlow = forwardRef<ReactFlowRefType, ReactFlowProps>(
  (
    {
      nodes = [],
      edges = [],
      className,
      nodeTypes = defaultNodeTypes,
      edgeTypes = defaultEdgeTypes,
      onNodeClick,
      onEdgeClick,
      onLoad,
      onMove,
      onMoveStart,
      onMoveEnd,
      onConnect,
      onConnectStart,
      onConnectStop,
      onConnectEnd,
      onNodeMouseEnter,
      onNodeMouseMove,
      onNodeMouseLeave,
      onNodeContextMenu,
      onNodeDoubleClick,
      onNodeDragStart,
      onNodeDrag,
      onNodeDragStop,
      onSelectionChange,
      onSelectionDragStart,
      onSelectionDrag,
      onSelectionDragStop,
      onSelectionContextMenu,
      connectionMode = ConnectionMode.Strict,
      connectionLineType = ConnectionLineType.Bezier,
      connectionLineStyle,
      connectionLineComponent,
      deleteKeyCode = 'Backspace',
      selectionKeyCode = 'Shift',
      multiSelectionKeyCode = 'Meta',
      zoomActivationKeyCode = 'Meta',
      snapToGrid = false,
      snapGrid = initSnapGrid,
      onlyRenderVisibleElements = false,
      selectNodesOnDrag = true,
      nodesDraggable,
      nodesConnectable,
      elementsSelectable,
      minZoom,
      maxZoom,
      defaultZoom = 1,
      defaultPosition = initDefaultPosition,
      translateExtent,
      preventScrolling = true,
      nodeExtent,
      arrowHeadColor = '#b1b1b7',
      markerEndId,
      zoomOnScroll = true,
      zoomOnPinch = true,
      panOnScroll = false,
      panOnScrollSpeed = 0.5,
      panOnScrollMode = PanOnScrollMode.Free,
      zoomOnDoubleClick = true,
      paneMoveable = true,
      onPaneClick,
      onPaneScroll,
      onPaneContextMenu,
      children,
      onEdgeUpdate,
      onEdgeContextMenu,
      onEdgeDoubleClick,
      onEdgeMouseEnter,
      onEdgeMouseMove,
      onEdgeMouseLeave,
      onEdgeUpdateStart,
      onEdgeUpdateEnd,
      edgeUpdaterRadius = 10,
      onNodesChange,
      onEdgesChange,
      ...rest
    },
    ref
  ) => {
    const nodeTypesParsed = useMemo(() => createNodeTypes(nodeTypes), [nodeTypes]);
    const edgeTypesParsed = useMemo(() => createEdgeTypes(edgeTypes), [edgeTypes]);
    const reactFlowClasses = cc(['react-flow', className]);

    return (
      <div {...rest} ref={ref} className={reactFlowClasses}>
        <Wrapper>
          <GraphView
            nodes={nodes}
            edges={edges}
            onLoad={onLoad}
            onMove={onMove}
            onMoveStart={onMoveStart}
            onMoveEnd={onMoveEnd}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseMove={onNodeMouseMove}
            onNodeMouseLeave={onNodeMouseLeave}
            onNodeContextMenu={onNodeContextMenu}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypesParsed}
            edgeTypes={edgeTypesParsed}
            connectionLineType={connectionLineType}
            connectionLineStyle={connectionLineStyle}
            connectionLineComponent={connectionLineComponent}
            selectionKeyCode={selectionKeyCode}
            deleteKeyCode={deleteKeyCode}
            multiSelectionKeyCode={multiSelectionKeyCode}
            zoomActivationKeyCode={zoomActivationKeyCode}
            onlyRenderVisibleElements={onlyRenderVisibleElements}
            selectNodesOnDrag={selectNodesOnDrag}
            defaultZoom={defaultZoom}
            defaultPosition={defaultPosition}
            preventScrolling={preventScrolling}
            arrowHeadColor={arrowHeadColor}
            markerEndId={markerEndId}
            zoomOnScroll={zoomOnScroll}
            zoomOnPinch={zoomOnPinch}
            zoomOnDoubleClick={zoomOnDoubleClick}
            panOnScroll={panOnScroll}
            panOnScrollSpeed={panOnScrollSpeed}
            panOnScrollMode={panOnScrollMode}
            paneMoveable={paneMoveable}
            onPaneClick={onPaneClick}
            onPaneScroll={onPaneScroll}
            onPaneContextMenu={onPaneContextMenu}
            onSelectionDragStart={onSelectionDragStart}
            onSelectionDrag={onSelectionDrag}
            onSelectionDragStop={onSelectionDragStop}
            onSelectionContextMenu={onSelectionContextMenu}
            onEdgeUpdate={onEdgeUpdate}
            onEdgeContextMenu={onEdgeContextMenu}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onEdgeMouseEnter={onEdgeMouseEnter}
            onEdgeMouseMove={onEdgeMouseMove}
            onEdgeMouseLeave={onEdgeMouseLeave}
            onEdgeUpdateStart={onEdgeUpdateStart}
            onEdgeUpdateEnd={onEdgeUpdateEnd}
            edgeUpdaterRadius={edgeUpdaterRadius}
          />
          <StoreUpdater
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectStop={onConnectStop}
            onConnectEnd={onConnectEnd}
            nodesDraggable={nodesDraggable}
            nodesConnectable={nodesConnectable}
            elementsSelectable={elementsSelectable}
            minZoom={minZoom}
            maxZoom={maxZoom}
            nodeExtent={nodeExtent}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            snapToGrid={snapToGrid}
            snapGrid={snapGrid}
            connectionMode={connectionMode}
            translateExtent={translateExtent}
          />

          {onSelectionChange && <SelectionListener onSelectionChange={onSelectionChange} />}
          {children}
        </Wrapper>
      </div>
    );
  }
);

ReactFlow.displayName = 'ReactFlow';

export default ReactFlow;
